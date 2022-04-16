const express = require("express");
const app = express();
const path = require("path");
const moment = require("moment");
const config = require("config");
const bodyParser = require("body-parser");
const util = require("util");
const fs = require("fs");
// get SQL DB driver connection
//const db = require("./models/db");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );
  next();
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

app.all("/assets/:folder/:file", function (req, res) {
  var urlpath = req.url;
  var folder = req.params.folder;
  var file = req.params.file;
  res.sendFile(path.join(__dirname + "/views/assets/" + folder + "/" + file));
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
