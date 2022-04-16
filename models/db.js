const mysql = require("mysql");
const config = require("config");
const con = mysql.createConnection({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

con.connect(function (err) {
  if (err) throw err;
  console.log("SQL DB Connected!");
});

module.exports = con;
