const express = require("express");
const app = express();
const path = require("path");
const moment = require("moment");
const config = require("config");
const bodyParser = require("body-parser");
const util = require("util");
const fs = require("fs");
const cors = require('cors');
const db = require("./models/db");
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const MySQLStore = require('express-mysql-session')(sessions);
// get SQL DB driver connection
//const db = require("./models/db");

const sessionStore = new MySQLStore({}, db);
const halfHours = 1000 * 60 * 60 * 0.5;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors()); // used to avoid cors error

app.use(function (req, res, next) {
  //res.header("Access-Control-Allow-Origin", "http://localhost:5500");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );
  next();
});

app.use(cookieParser())
app.use(sessions({
  secret: 'Your_Secret_Key',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: { maxAge: halfHours }
}))

//session
app.use((req, res, next) => {
  let session = req.session;
  if (req.hasOwnProperty('originalUrl')) {
    try{
      let tempUrl = req.originalUrl.split("/");
      if ((tempUrl.indexOf("registration") > -1 && tempUrl.indexOf("signin") > -1) || tempUrl.indexOf("set") > -1) {
        session=req.session;
        session.sessionID=req.sessionID;
        session.user = {};
      }
    } catch(ex){
      console.log('error  ->', ex.stack);
    }
  }
  next(); // this will invoke next middleware function
});


// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

var dev = require("./routes/dev");
app.use("/dev", dev);

// This responds with "Hello World" on the homepage
app.get("/", function (req, res) {
  //console.log("Got a GET request for the homepage");
  //res.send('Welcome to Express Server');
  res.render("index");
});

app.all('/Image/*', function (req, res) {
  var urlpath = req.url;
  urlpath = decodeURI(urlpath);
  urlpath = urlpath.toString().replace('Image', '');
  res.sendFile(path.join(__dirname + urlpath));
});

app.all("/assets/:folder/:file", function (req, res) {
  var urlpath = req.url;
  var folder = req.params.folder;
  var file = req.params.file;
  res.sendFile(path.join(__dirname + "/views/assets/" + folder + "/" + file));
});

app.get("/set/session", (req, res) => {
  try {
    res.json({status: 1,msg: req.sessionID});
  } catch (ex) {
    res.json({ status: 100, msg: ex.stack });
  }
});
app.get("/get-session", (req, res) => {
  try {
    res.json({status: 1,msg: req.session});
  } catch (ex) {
    res.json({ status: 100, msg: ex.stack });
  }
});
app.get("/end-session", (req, res) => {
  try {
    req.session.destroy();
    res.json({status: 1,msg: 'Session Destroyed'});
  } catch (ex) {
    res.json({ status: 100, msg: ex.stack });
  }
});

const port = process.env.PORT || 5000;
const server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});

fs.readdirSync("./controllers").forEach(function (file) {
  if (file.substr(-3) == ".js") {
    route = require("./controllers/" + file);
    console.log("Controller", file);
    route.controller(app);
    var sleep = require("system-sleep");
    sleep(500);
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  //console.log(req, res, next)
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
  res.render("error");
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});


//logger
// app.use((req, res, next) => {
//   const oldWrite = res.write;
//   const oldEnd = res.end;

//   const chunks = [];

//   res.write = (...restArgs) => {
//     chunks.push(Buffer.from(restArgs[0]));
//     oldWrite.apply(res, restArgs);
//   };

//   res.end = (...restArgs) => {
//     if (restArgs[0]) {
//       chunks.push(Buffer.from(restArgs[0]));
//     }
//     const body = Buffer.concat(chunks).toString("utf8");
//     // console.log({
//     //   time: new Date().toUTCString(),
//     //   fromIP: req.headers['x-forwarded-for'] ||
//     //   req.connection.remoteAddress,
//     //   method: req.method,
//     //   originalUri: req.originalUrl,
//     //   uri: req.url,
//     //   requestData: req.body,
//     //   responseData: body,
//     //   referer: req.headers.referer || '',
//     //   ua: req.headers['user-agent']
//     // });

//     // console.log(body);
//     oldEnd.apply(res, restArgs);
//   };
//   next(); // this will invoke next middleware function
// });