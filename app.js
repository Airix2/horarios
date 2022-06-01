require("dotenv").config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')

var Authorize = require('./controllers/index_controller')

//Routers
//Se declaran todos los routers que se van a usar en la app
var indexRouter = require('./routes/index');
var excelRouter = require('./routes/excel');

var app = express();

//View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for Session
var sess = {
  secret: 'keyboard cat',
  cookie: {},
  msgs: []
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))

//Use routers
//Se aplican todos los routers y se añade un middleware de ser necesario
//El middleware authrole recibe los tipos de usuarios que pueden pasar atraves de el
//User Middleware pone automaticamente la variable user para utilizarse en los renders
app.use('/', indexRouter);
app.use('/excel', excelRouter);


app.listen(8080, function () {
  console.log("Express server listening on port 8080");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err)



  if ((app.get('env') === 'production')) {
    msgs = [{text: 'Sorry, an error ocurred, please try again. If this persists, please contact IT.', type: 'error'}]
    let user = req.user.user
    res.render('home', {
        user,
        msgs
    });
  } else {
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  }
});

module.exports = app;
