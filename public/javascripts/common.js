let moment = require('moment');
// Functions for ordering the object for Reports
function addEmptyDate(dates, row, field = 'v_total') {
    const info = {
        officeId: row.officeId,
        field: row[field]
    };

    const infoObj = [];
    infoObj.push(info);

    const dateObj = {
        date: row.date,
        officeEntries: infoObj
    }
    dates.push(dateObj)                // agregar esta nueva fecha al arreglo de fechas
}

function addToDate(dates, row, index, field = 'v_total') {
    const infoObj = {
        officeId: row.officeId,
        field: row[field]
    };

    dates[index].officeEntries.push(infoObj);   //agregar otro entry a la fecha existente
}

function orderJSON(jsonName, reqElement) {
    let jsonObj = {}
    if (typeof reqElement != 'object') {
        if (reqElement != "" && reqElement != null) {
            jsonObj[jsonName] = [reqElement]
        } else {
            jsonObj[jsonName] = []
        }
    } else {
        let length = reqElement.length
        let arreglo = []
        for (let i = 0; i < length; i++) {
            if (reqElement[i] != "") {
                arreglo.push(reqElement[i])
            }
        }
        jsonObj[jsonName] = arreglo
    }
    return jsonObj
}

function orderMultJSON(innerFields, innerNames, outerFields, outerNames) {
    let jsonObj = {}
    jsonObj['amountObj'] = []
    let start = true
    innerFields.forEach((fieldElem, index) => {
        if (typeof fieldElem != 'object') {
            if (start == true) {
                let arreglo = {}
                jsonObj['amountObj'].push(arreglo)
                start = false
            }
            jsonObj['amountObj'][0][innerNames[index]] = fieldElem
        } else {
            let length = fieldElem.length
            if (start == true) {
                for (let i = 0; i < length; i++) {
                    jsonObj['amountObj'].push({})
                }
                start = false
            }
            
            for (let i = 0; i < length; i++) {
                jsonObj['amountObj'][i][innerNames[index]] = fieldElem[i]
            }
        }
    });
    outerFields.forEach((fieldElem, index) => {
        jsonObj[outerNames[index]] = fieldElem
    });
    jsonObj = deleteEmpty(jsonObj)
    return jsonObj
}

function deleteEmpty(jsonObj){
    jsonObj['amountObj'].forEach((elements, index) => {
        let empty = true
        for (let property in elements) {
            if (elements[property] != "" && typeof elements[property] != 'undefined') {
                empty = false
            }
        }

        if (empty == true) {
            jsonObj['amountObj'].splice(index, 1);
        }
    })
    return jsonObj
}

function parseValues(value, string = 0) {
    if (value == "") {
        return null
    } else if (string == 1) {
        return value
    } else {
        value = parseFloat(value)
        return value
    }
}

function parseValuesDate(date, type, dateType, format = 'YYYY-MM-DD') {
    if (type == "start" && (date == "" || date == undefined)) {
        return '0'
    } else if (type == "end" && (date == "" || date == undefined)) {
        return '2222-12-31'
    } else if (type == "end") {
        let a = moment(date)
        if (dateType == "createdAt") {
            a = a.add(1, 'd')
        }
        let dateOrdered = a.format(format).toString()
        console.log(dateOrdered)
        return dateOrdered
    } else {
        let a = moment(date)
        let dateOrdered = a.format(format).toString()
        console.log(dateOrdered)
        return dateOrdered
    }
}


function formatDate(date, format = 'YYYY-MM-DD', ogformat = null) {
    let a
    if (ogformat != null) {
        a= moment(date, ogformat)
    } else {
        a= moment(date)
    }
    let dateOrdered = a.format(format).toString()
    return dateOrdered
}

function addSessionMsgs(req, res, msg) {
    if (typeof req.session.msgs == 'undefined') {
        req.session.msgs = []
        req.session.msgs.push(msg)
        // res.locals.msgs = []
        // res.locals.msgs.push(msg)
    } else {
        req.session.msgs.push(msg)
        //res.locals.msgs.push(msg)
    }
}

module.exports = {addEmptyDate, addToDate, orderJSON, parseValues, orderMultJSON, formatDate, parseValuesDate, addSessionMsgs};