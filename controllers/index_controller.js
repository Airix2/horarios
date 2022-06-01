const db = require('../models');
const Users = db.user;

const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs');

//Render Login Page
exports.login = function (req, res, next) {
    res.render("login");
};

//User Authentication at login
exports.auth_index = function (req, res, next) {
    console.log("\n\n Calling login function - auth_index \n");
    Users.findOne({
        where: {
            email: req.body.login_email
        }
    }).then(function (user) {
        if (!user || !req.body.login_email || !req.body.login_password) {
            res.send("Please Try Again To Login")
        } else {
            bcrypt.compare(req.body.login_password, user.pass, function (err, result) {
                if (result == true) {
                    const accessToken = generateAccessToken(user)
                    res.set({ 'X-Api-Response': accessToken })  // API Key 
                    req.headers.authorization = `Bearer: ${accessToken}`;

                    //console.log('\n\nreq.headers.authorization: \n', req.headers.authorization, '\n\n')
                    //setting cookies
                    res.cookie('Authorization', accessToken, { maxAge: 60000 * 15 * 100, httpOnly: true }); //15min * 100
                    res.redirect('/home')
                } else {
                    res.send("Wrong Password or username")
                }
            });
        }
    });
};

//Función middleware que revisa el tipo de usuario(permisos)
function authRole(role) {
    return (req, res, next) => {
        //console.log('\n\n\n********My department: ', req.user.user.user_type)
        if (![req.user.user.user_type].some(x => role.includes(x))) {
            res.status(401)
            console.log("Got no authorization")
            return res.redirect('/home')
        }
        next()
    }
}
exports.authRole = authRole;

//Función middleware que revisa que exista un token
exports.authenticateToken = function (req, res, next) {
    if (req.headers.cookie == null) {
        console.log('\nCookies null')
        return res.redirect('/')
    }
    var get_cookies = function (req) {
        var cookies = {};
        req.headers && req.headers.cookie.split(';').forEach(function (cookie) {
            var parts = cookie.match(/(.*?)=(.*)$/)
            cookies[parts[1].trim()] = (parts[2] || '').trim();
        });
        return cookies;
    };

    //console.log('\nToken authHeader:\n ', authHeader, '\n')
    const token = get_cookies(req)['Authorization']
    //console.log('\nToken after split[1]: \n', token)

    if (token == null) {
        console.log('\nToken Does Not Exist')
        return res.redirect('/')
    }

    else if (token != null) {
        //console.log('\nToken Does Exist')
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => { //verify token
            if (err) {
                console.log('\nRedirecting To Root, bad login \n')
                return res.redirect("/") //if error send to login page
            } else {
                req.user = user // else make a user
                //console.log("\nCalling next from authenticate token\n")
                next();
            }
        })
    }
}

//This checks if the use has logged in ---------- Unused??
exports.User = function (req, res, next) {
    if (!req.user) {
        res.status(403).redirect('/')
        console.log('\n you dont have access for this page .USER\n')
    } else {
        next()
    }
};

//Generador del token con secreto
function generateAccessToken(user) {
    return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '900000000' }) //15min = 900,000 ->  * 100 = 900 000 000
}

//Render Homepage
exports.home = function (req, res, next) {
    let user = req.user.user
    res.render('home', {
        user
    });
}

//Render Account info Page
exports.account = function (req, res, next) {
    let user = req.user.user
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