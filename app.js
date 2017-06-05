var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket = require('socket.io');
var watson = require('watson-developer-cloud');
var fs = require('fs');

//var tracking = require('tracking');

var index = require('./routes/index');
var users = require('./routes/users');
var face = require('./routes/face');

var app = express();
var io = socket();

var visual_recognition = watson.visual_recognition({
  api_key: 'f28a7547bdfcfc8b210492aa578218f6ed2039c6',
  version: 'v3',
  version_date: '2016-05-19'
});



app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/face', face);

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

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('face', function(snap){
    console.log('resivido');
    var data = snap.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    var img_name = guid();
    fs.writeFile(__dirname + '/public/images/'+ img_name +'.png', buf);
    console.log('save face ' + img_name + '.png');
    
    var params = {
      images_file: fs.createReadStream(__dirname + '/public/images/'+ img_name +'.png'),
      parameters: fs.createReadStream('params.json')  
    };
    
    visual_recognition.classify(params, function(err, res) {
       	if (err)
          console.log(err);
        else
          io.emit('name', res);
    });
    
  });
  
  /*socket.on('face_tracking', function(snap){
    var data = snap.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    var img_name = guid();
    fs.writeFile(__dirname + '/public/images/'+ img_name +'.png', buf);
    console.log('save face ' + img_name + '.png');
  });*/
});


  


console.log("localhost:8080");

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

module.exports = app;
