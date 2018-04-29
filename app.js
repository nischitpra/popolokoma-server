var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var cryptoCompare = require('./routes/cryptocompare/cryptoCompare')
var twitter = require('./routes/twitter/twitter')
var news = require('./routes/news/news')
var mailer = require('./routes/mailer/mailer')

const connection=require('./routes/connection')
const id=require('./routes/constants').id
const network=require('./routes/constants').network
const forecast=require('./routes/forecast/forecast')

const database = require('./routes/database')

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/** setting up cors options */
var cors = require('cors')


/** Initialize database */
database.createGoodbadTable((status,message)=>{console.log(`status: ${status}, message: ${message}`)})
database.createSentimentTrendTable((status,message)=>{console.log(`status: ${status}, message: ${message}`)})
database.createTweetsTable((status,message)=>{console.log(`status: ${status}, message: ${message}`)})
database.createOTPTable((status,message)=>{console.log(`status: ${status}, message: ${message}`)})
database.createSubscribedTable((status,message)=>{console.log(`status: ${status}, message: ${message}`)})

/** Initialize url paths */
app.use(cors())
app.use('/', index);
app.use('/news', news);
app.use('/cc',cryptoCompare.router);
app.use('/twitter',twitter);
app.use('/m',mailer.router)
app.use('/f',forecast)

/** Initialize update sucscribed candlestick services */
cryptoCompare.uscs(0)
cryptoCompare.uscs(1)

/** Initialize 4 Day summary mailer */
mailer.summary4Days()


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
