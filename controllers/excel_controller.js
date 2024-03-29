const db = require("../models");
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

const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
let moment = require("moment");
const { parseValues, addSessionMsgs } = require("../public/javascripts/common");

// Packages for Uploading CSV
const csv = require("csv-parser");
const fs = require("fs");
var formidable = require("formidable");
const limit = 10;

// FOR TESTING
const util = require("util");

//Renderiza Login Page con los datos de records y oficinas
exports.renderExcel = function (req, res, next) {
	res.render("excel/indexTest", {});
};

exports.showExcel = function (req, res, next) {
	var form = new formidable.IncomingForm();
	form.parse(req, async function (err, fields, files) {
		timetable_student = [];
		timetable_teacher = [];
		timetables = { timetable_student, timetable_teacher };
		timetables = await getCSVInfo2(
			timetables,
			files,
			"timetable",
			req,
			res
		);
		// console.log(timetables);
		timetables = await getCSVInfo2(
			timetables,
			files,
			"datosDocentes",
			req,
			res
		);

		// console.log(timetables.timetable_teacher);
		// console.log(timetables);
		// console.log(timetables.timetable_student[0].hours);
		createExcels(timetables);

		// console.log(
		// 	util.inspect(timetables.timetable_student[0], {
		// 		showHidden: false,
		// 		depth: null,
		// 		colors: true,
		// 	})
		// );
		res.render("excel/indexTest", {
			timetables,
		});
	});
};
async function getCSVInfo2(timetables, files, nameForm, req, res) {
	return new Promise((resolve, reject) => {
		if (
			files[nameForm].originalFilename != "" &&
			files[nameForm].originalFilename.includes(".csv")
		) {
			path = files[nameForm].filepath;
			fs.createReadStream(path, { encoding: "utf8" })
				.pipe(csv())
				.on("error", (error) => {
					reject(error);
				})
				.on("data", (data) => {
					if (nameForm == "timetable") {
						let day = data["Day"];
						let hour = data["Hour"];
						let students = data["Students Sets"];
						let subject = data["Subject"];
						let teacher = data["Teachers"];
						let room = data["Room"];

						hour = hour.slice(0, 2); //remove $
						hour = parseValues(hour);

						if (day.includes("coles")) {
							day = "Miercoles";
						}
						// let spaceIndex = room.indexOf(" ");
						// room = room.slice(spaceIndex);

						let timetableObj = { hours: [] };
						let foundStd = -1;
						let foundTch = -1;
						timetables.timetable_student.forEach(function (
							item,
							index
						) {
							if (item?.students == students) {
								foundStd = index;
							}
						});
						timetables.timetable_teacher.forEach(function (
							item,
							index
						) {
							if (item?.teacher == teacher) {
								foundTch = index;
							}
						});

						if (foundStd == -1) {
							timetableObj.students = students;
							timetableObj.especialidad =
								getEspecialidad(students);
							timetableObj.materias = [
								{
									subject: subject,
									hours: 1,
									teacher: teacher,
								},
							];
							timetableObj = addHour(
								timetableObj,
								day,
								hour,
								teacher,
								room,
								subject
							);
							timetables.timetable_student.push(timetableObj);
						} else {
							let horario =
								timetables.timetable_student[foundStd];
							horario.materias = addSubject(
								horario.materias,
								subject,
								teacher,
								"teacher"
							);
							horario = addHour(
								horario,
								day,
								hour,
								teacher,
								room,
								subject
							);
						}

						timetableObj = { hours: [] };
						if (foundTch == -1) {
							timetableObj.teacher = teacher;
							timetableObj.materias = [
								{ subject: subject, hours: 1, group: students },
							];
							timetableObj = addHour(
								timetableObj,
								day,
								hour,
								students,
								room,
								subject
							);
							timetables.timetable_teacher.push(timetableObj);
						} else {
							let horario =
								timetables.timetable_teacher[foundTch];
							horario.materias = addSubject(
								horario.materias,
								subject,
								students,
								"group"
							);
							horario = addHour(
								horario,
								day,
								hour,
								students,
								room,
								subject
							);
						}
					}
					if (nameForm == "datosDocentes") {
						let name_timetable = data["nombre_timetable"];

						// console.log(data, data.nombre, data["nombre"]);
						let found = timetables.timetable_teacher.findIndex(
							(horario) => {
								if (
									horario.teacher?.toUpperCase()?.trim() ===
									name_timetable?.toUpperCase()?.trim()
								) {
									// console.log("found!!");
									return horario;
								}
							}
						);
						if (found !== -1) {
							// console.log("this does happen");
							timetables.timetable_teacher[found] = {
								...timetables.timetable_teacher[found],
								...data,
							};
						} else {
							console.log("we didnt find it...");
							console.log(name_timetable);
						}
					}
				})
				.on("end", () => {
					console.log("Finished " + nameForm);
					resolve(timetables);
				});
		} else {
			msg = {
				text:
					"Cannot read " +
					nameForm +
					" file. File has to be a CSV file",
				type: "error",
			};
			addSessionMsgs(req, res, msg);
			resolve(timetables);
		}
	});
}

function addHour(array, day, hour, teacher, room, subject) {
	if (typeof array.hours[hour] == "undefined") {
		array.hours[hour] = {
			Monday: {},
			Tuesday: {},
			Wednesday: {},
			Thursday: {},
			Friday: {},
			hour: hour,
		};
	}

	if (array.students) {
		// Horario para estudiantes
		array.hours[hour][day] = {
			teacher: teacher,
			room: room,
			subject: subject,
			hour: hour,
		};
	} else {
		// Horario para Docentes
		array.hours[hour][day] = {
			group: teacher,
			room: room,
			subject: subject,
			hour: hour,
		};
	}
	return array;
}

function getEspecialidad(students) {
	let especialidad = students[1];
	switch (especialidad) {
		case "D":
		case "E":
			especialidad = "Programación";
			break;
		case "A":
		case "B":
			especialidad = "Administración";
			break;
		case "C":
			especialidad = "Logística";
			break;
		case "F":
		case "G":
			especialidad = "Electrónica";
			break;
		default:
			especialidad = "Error";
			break;
	}
	return especialidad;
}

function addSubject(materiasArray, subject, teacher, tipo) {
	let indexFound = -1;
	materiasArray.forEach(function (materiaObj, index) {
		if (materiaObj["subject"] == subject && materiaObj[tipo] == teacher) {
			indexFound = index;
		}
	});
	if (indexFound == -1) {
		materiasArray.push({ subject: subject, hours: 1, [tipo]: teacher });
	} else {
		materiasArray[indexFound].hours = materiasArray[indexFound].hours + 1;
	}
	return materiasArray;
	//{'subject': subject, 'hours': 1, 'teacher': teacher}
}

const XlsxPopulate = require("xlsx-populate");

function createExcels(timetables) {
	let original = "./public/excels/formatogrupo.xlsx";
	timetables.timetable_student.forEach((horario, index) => {
		let excelname = "./public/excels/" + horario.students + ".xlsx";
		XlsxPopulate.fromFileAsync(original).then((workbook) => {
			// POPULATING UPPER 2 CELLS
			let sheet = workbook.sheet("HORARIO_GRUPO");
			sheet.cell("D5").value(horario.students);
			sheet.cell("G5").value(horario.especialidad);

			// POPULATING SCHEDULE
			let dias = [
				{ dia: "Monday", cell: "D", cell2: "E" },
				{ dia: "Tuesday", cell: "F", cell2: "G" },
				{ dia: "Wednesday", cell: "H", cell2: "I" },
				{ dia: "Thursday", cell: "J", cell2: "K" },
				{ dia: "Friday", cell: "L", cell2: "M" },
			];
			horario.hours.forEach((hour) => {
				for (let i = 0; i < 5; i++) {
					sheet
						.cell(dias[i].cell + (hour.hour + 1))
						.value(hour[dias[i].dia]?.subject);
					sheet
						.cell(dias[i].cell2 + (hour.hour + 1))
						.value(hour[dias[i].dia]?.room);
				}
			});

			// POPULATING LOWER TABLE
			horario.materias.forEach((materia, index) => {
				sheet.cell("C" + (index + 24)).value(index + 1);
				sheet.cell("D" + (index + 24)).value(materia.subject);
				sheet.cell("I" + (index + 24)).value(materia.hours);
				sheet.cell("J" + (index + 24)).value(materia.teacher);
			});
			// Write to file.

			sheet = workbook.sheet("SalonesNuevo");
			dias = [
				{ dia: "Monday", cell: "D", row: 4 },
				{ dia: "Tuesday", cell: "F", row: 34 },
				{ dia: "Wednesday", cell: "H", row: 65 },
				{ dia: "Thursday", cell: "J", row: 96 },
				{ dia: "Friday", cell: "L", row: 128 },
			];
			let cells = [
				"D",
				"E",
				"F",
				"G",
				"H",
				"I",
				"J",
				"K",
				"L",
				"M",
				"N",
				"O",
				"P",
				"Q",
				"R",
				"S",
				"T",
				"U",
				"V",
				"W",
				"X",
				"Y",
				"Z",
				"AA",
				"AB",
				"AC",
				"AD",
				"AE",
				"AF",
				"AG",
				"AH",
				"AI",
				"AJ",
				"AK",
				"AL",
			];
			timetables.timetable_student.forEach((schedule, i) => {
				schedule.hours.forEach((hour) => {
					if (hour.hour !== undefined) {
						dias.forEach((dia) => {
							if (
								hour[dia.dia].room !== undefined &&
								hour[dia.dia].room !== ""
							) {
								// console.log(dia, hour);
								// console.log("room is: ", hour[dia.dia].room);
								// console.log(
								// 	"parseInt is: ",
								// 	parseInt(hour[dia.dia].room),
								// 	hour
								// );
								// console.log(
								// 	"cell in that index is",
								// 	cells[parseInt(hour[dia.dia].room) - 1]
								// );

								let cellLetter =
									cells[parseInt(hour[dia.dia].room) - 1];
								let cellNumber = dia.row + (hour.hour - 7) * 2;
								let teacherSplit =
									hour[dia.dia].teacher.split(" ");
								let lastName = teacherSplit[0].substring(0, 6);

								sheet
									.cell(`${cellLetter}${cellNumber}`)
									.value(schedule.students);
								sheet
									.cell(`${cellLetter}${cellNumber + 1}`)
									.value(lastName);
							}
						});
					}
				});
			});

			return workbook.toFileAsync(excelname);
		});
	});

	original = "./public/excels/formatodocentesNew.xlsx";
	timetables.timetable_teacher.forEach((horario, index) => {
		// if (index == 0) {
		let excelname = "./public/excels/" + horario.teacher + ".xlsx";
		XlsxPopulate.fromFileAsync(original).then((workbook) => {
			// POPULATING UPPER 2 CELLS
			let sheet = workbook.sheet("Hoja1");
			sheet.cell("C8").value(horario.teacher);
			sheet.cell("B16").value(horario.teacher);

			sheet.cell("L7").value(horario.rfc);
			sheet.cell("C9").value(horario.estudios);
			sheet.cell("L8").value(horario.egresado);
			sheet.cell("I9").value(horario.academia);
			sheet.cell("N9").value(horario.categoria);
			sheet.cell("A12").value(horario.ingreso_sep);
			sheet.cell("B12").value(horario.ingreso_dgeti);
			sheet.cell("F12").value(horario.horas);

			if (horario.clave_presupuestal) {
				let claves = horario.clave_presupuestal.split(",");
				claves.forEach((clave, i) => {
					sheet.cell(`C${12 + i}`).value(clave);
				});
			}

			// POPULATING SCHEDULE
			let dias = [
				{ dia: "Monday", cell: "G", cell2: "H" },
				{ dia: "Tuesday", cell: "I", cell2: "J" },
				{ dia: "Wednesday", cell: "K", cell2: "L" },
				{ dia: "Thursday", cell: "M", cell2: "N" },
				{ dia: "Friday", cell: "O", cell2: "P" },
			];
			horario.hours.forEach((hour) => {
				for (let i = 0; i < 5; i++) {
					sheet
						.cell(dias[i].cell + (11 + hour.hour))
						.value(hour[dias[i].dia]?.group);
					sheet
						.cell(dias[i].cell2 + (11 + hour.hour))
						.value(hour[dias[i].dia]?.room);
				}
			});

			// POPULATING LEFT TABLE
			horario.materias.forEach((materia, index) => {
				sheet.cell("A" + (index + 18)).value(materia.group);
				sheet.cell("B" + (index + 18)).value(materia.subject);
				sheet.cell("E" + (index + 18)).value(materia.hours);
			});
			// Write to file.
			return workbook.toFileAsync(excelname);
		});
	});
}
