const db = require('../models');
const Users = db.user;

const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs');

//Render Homepage
exports.home = function (req, res, next) {
    let user = "Me"
    res.render('home', {
        user
    });
}

//Render Account info Page
exports.account = function (req, res, next) {
    let user = "Me"
    res.render('account', {
        user
    });
}

//Termina la cookie y renderiza login page (Logout)
exports.destroyToken = function (req, res, next) {
    console.log("\nCalling logout function");
    res.cookie('Authorization', { maxAge: 0 });
    console.log('Logged out \n')
    res.render('login');
}