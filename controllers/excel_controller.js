const db = require('../models');
// Add Databases
const Users = db.user;
const Records = db.records;
const Offices = db.offices;
const Reports = db.reports;
// Add Joint Tables
Reports.belongsTo(Offices);
Reports.belongsTo(Users);
Offices.hasMany(Reports);
Users.hasMany(Reports);

var paginate = require('paginate')();
const { v4: uuidv4 } = require('uuid');
const { Op } = require("sequelize");
let moment = require('moment');
const {orderMultJSON, parseValues, parseValuesDate, formatDate, addSessionMsgs} = require('../public/javascripts/common');

// Packages for Uploading CSV
const csv = require('csv-parser')
const fs = require('fs')
var formidable = require('formidable');
const limit = 10

// FOR TESTING
const util = require('util');

//Renderiza Login Page con los datos de records y oficinas
exports.renderExcel = function (req, res, next) {
    res.render('excel/indexTest', {});
}

exports.showExcel = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        timetable_student = []
        timetable_teacher = []
        timetables = {timetable_student, timetable_teacher}
        timetables = await getCSVInfo2(timetables, files, 'timetable', req, res)
        //timetables = await getCSVInfo2(timetables, files, 'datosDocentes', req, res)

        createExcels(timetables)

        //console.log(util.inspect(timetables.timetable_student[0], {showHidden: false, depth: null, colors: true}))
        res.render('excel/indexTest', {
            timetables
        });
    });
}
async function getCSVInfo2(timetables, files, nameForm, req, res) {
    return new Promise((resolve, reject) => {
        if(files[nameForm].originalFilename != "" && files[nameForm].originalFilename.includes('.csv')) {
            path = files[nameForm].filepath
            fs.createReadStream(path, {encoding: 'binary'})
                .pipe(csv())
                .on('error', error => {
                    reject(error);
                })
                .on('data', (data) => {
                    if (nameForm == 'timetable') {
                        let day
                        let hour
                        let students
                        let subject
                        let teacher
                        let room
                        for (let property in data) { 
                            if(property == 'Day') {
                                day = data[property]
                            } else if(property == 'Hour') {
                                hour = data[property]
                            } else if(property == 'Students Sets') {
                                students = data[property]
                            } else if(property == 'Subject') {
                                subject = data[property]
                            } else if(property == 'Teachers') {
                                teacher = data[property]
                            } else if(property == 'Room') {
                                room = data[property]
                            }
                        }
                        hour = hour.slice(0,2)  //remove $
                        hour = parseValues(hour)

                        if (day == 'Martes') {
                            day = 'martes'
                        } else if (day.includes('coles')) {
                            day = 'miercoles'
                        }
                        let spaceIndex = room.indexOf(' ');
                        room = room.slice(spaceIndex)

                        let timetableObj = {hours: []}
                        let foundStd = -1
                        let foundTch = -1
                        timetables.timetable_student.forEach(function(item, index) {
                            if (item?.students == students) {
                                foundStd = index
                            }
                        });
                        timetables.timetable_teacher.forEach(function(item, index) {
                            if (item?.teacher == teacher) {
                                foundTch = index
                            }
                        });

                        if (foundStd == -1) {
                            timetableObj.students = students
                            timetableObj.especialidad = getEspecialidad(students)
                            timetableObj.materias = [{'subject': subject, 'hours': 1, 'teacher': teacher}]
                            timetableObj = addHour(timetableObj, day, hour, teacher, room, subject)
                            timetables.timetable_student.push(timetableObj)
                        } else {
                            let horario = timetables.timetable_student[foundStd]
                            horario.materias = addSubject(horario.materias, subject, teacher, 'teacher')
                            horario = addHour(horario, day, hour, teacher, room, subject)
                        }

                        timetableObj = {hours: []}
                        if (foundTch == -1) {
                            timetableObj.teacher = teacher
                            timetableObj.materias = [{'subject': subject, 'hours': 1, 'group': students}]
                            timetableObj = addHour(timetableObj, day, hour, students, room, subject)
                            timetables.timetable_teacher.push(timetableObj)
                        } else {
                            let horario = timetables.timetable_teacher[foundTch]
                            horario.materias = addSubject(horario.materias, subject, students, 'group')
                            horario = addHour(horario, day, hour, students, room, subject)
                        }
                    }
                })
                .on('end', () => {
                    console.log('Finished '+nameForm)
                    resolve(timetables);
                })
        } else {
            msg = {text: 'Cannot read '+nameForm+' file. File has to be a CSV file', type: 'error'}
            addSessionMsgs(req, res, msg)
            resolve(timetables)
        }
    });
}

function addHour(array, day, hour, teacher, room, subject) {
    if (typeof array.hours[hour] == 'undefined') {
        array.hours[hour] = {lunes: {}, martes: {}, miercoles: {}, jueves: {}, viernes: {}, hour: hour}
    }

    if (array.students) {   // Horario para estudiantes
        array.hours[hour][day] = {teacher: teacher, room: room, subject: subject, hour: hour}
    } else {                // Horario para Docentes
        array.hours[hour][day] = {group: teacher, room: room, subject: subject, hour: hour}
    }
    return array
}

function getEspecialidad(students) {
    let especialidad = students[1]
    switch (especialidad) {
        case 'D':
        case 'E':
            especialidad = 'Programación'
            break;
        case 'A':
        case 'B':
            especialidad = 'Administración'
            break;
        case 'C':
            especialidad = 'Logística'
            break;
        case 'F':
        case 'G':
            especialidad = 'Electrónica'
            break;
        default:
            especialidad = 'Error'
            break;
    }
    return especialidad
}

function addSubject(materiasArray, subject, teacher, tipo) {
    let indexFound = -1
    materiasArray.forEach(function(materiaObj, index) {
        if (materiaObj['subject'] == subject && materiaObj[tipo] == teacher) {
            indexFound = index
        }
    });
    if (indexFound == -1) {
        materiasArray.push({'subject': subject, 'hours': 1, [tipo]: teacher})
    } else {
        materiasArray[indexFound].hours = materiasArray[indexFound].hours + 1
    }
    return materiasArray
    //{'subject': subject, 'hours': 1, 'teacher': teacher}
}

const XlsxPopulate = require('xlsx-populate');

function createExcels(timetables) {
    let original = './public/excels/formatogrupo.xlsx';
    // timetables.timetable_student.forEach(horario => {
    //     let excelname = './public/excels/'+horario.students+'.xlsx';
    //     XlsxPopulate.fromFileAsync(original)
    //         .then(workbook => {
    //             // POPULATING UPPER 2 CELLS
    //             let sheet = workbook.sheet("HORARIO_GRUPO");
    //             sheet.cell("D5").value(horario.students);
    //             sheet.cell("G5").value(horario.especialidad);

    //             // POPULATING SCHEDULE
    //             let dias = [
    //                 {dia: 'lunes', cell: 'D', cell2: 'E'}, 
    //                 {dia: 'martes', cell: 'F', cell2: 'G'}, 
    //                 {dia: 'miercoles', cell: 'H', cell2: 'I'}, 
    //                 {dia: 'jueves', cell: 'J', cell2: 'K'}, 
    //                 {dia: 'viernes', cell: 'L', cell2: 'M'}
    //             ]
    //             horario.hours.forEach((hour) => {
    //                 for (let i = 0; i < 5; i++) {
    //                     sheet.cell(dias[i].cell+(hour.hour+1)).value(hour[dias[i].dia]?.subject)
    //                     sheet.cell(dias[i].cell2+(hour.hour+1)).value(hour[dias[i].dia]?.room)
    //                 }
    //             });

    //             // POPULATING LOWER TABLE
    //             horario.materias.forEach((materia, index) => {
    //                 sheet.cell('C'+(index+24)).value((index+1))
    //                 sheet.cell('D'+(index+24)).value(materia.subject)
    //                 sheet.cell('I'+(index+24)).value(materia.hours)
    //                 sheet.cell('J'+(index+24)).value(materia.teacher)
    //             })
    //             // Write to file.
    //             return workbook.toFileAsync(excelname);
    //         })
    // });

    original = './public/excels/formatodocentesNew.xlsx';
    timetables.timetable_teacher.forEach((horario, index) => {
        if (index == 0) {
            let excelname = './public/excels/'+horario.teacher+'.xlsx';
            XlsxPopulate.fromFileAsync(original)
                .then(workbook => {
                    // POPULATING UPPER 2 CELLS
                    let sheet = workbook.sheet("Sheet1");
                    sheet.cell("C10").value(horario.teacher);
                    sheet.cell("B25").value(horario.teacher);

                    // POPULATING SCHEDULE
                    let dias = [
                        {dia: 'lunes', cell: 'L', cell2: 'M'}, 
                        {dia: 'martes', cell: 'N', cell2: 'O'}, 
                        {dia: 'miercoles', cell: 'P', cell2: 'Q'}, 
                        {dia: 'jueves', cell: 'R', cell2: 'S'}, 
                        {dia: 'viernes', cell: 'T', cell2: 'U'}
                    ]
                    horario.hours.forEach((hour) => {
                        for (let i = 0; i < 5; i++) {
                            sheet.cell(dias[i].cell+(20+hour.hour)).value(hour[dias[i].dia]?.group)
                            sheet.cell(dias[i].cell2+(20+hour.hour)).value(hour[dias[i].dia]?.room)
                        }
                    });

                    // POPULATING LOWER TABLE
                    horario.materias.forEach((materia, index) => {
                        sheet.cell('A'+(index+27)).value(materia.group)
                        sheet.cell('B'+(index+27)).value(materia.subject)
                        sheet.cell('G'+(index+27)).value(materia.hours)
                    })
                    // Write to file.
                    return workbook.toFileAsync(excelname);
                })
        }
    });
}