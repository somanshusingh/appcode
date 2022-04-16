const path = require("path");
const moment = require("moment");
const appRoot = path.dirname(require.main.filename);

// get SQL DB driver connection
const db = require("../models/db");

module.exports.controller = function (app) {
  app.post("/registration/user", (req, res) => {
    try {
      let sql =
        "CREATE TABLE users(UserId VARCHAR(10) NOT NULL, Password VARCHAR(25) NOT NULL, Name VARCHAR(50),Mobile BIGINT, Email VARCHAR(50),Address VARCHAR(150),Role VARCHAR(10), Status VARCHAR(10), Created_By VARCHAR(50),Created_On DATE,Modified_By VARCHAR(50),Modified_On DATE, PRIMARY KEY(UserId))";
      db.query(sql, (err) => {
        try {
          if (err) {
            if (
              err &&
              err.sqlMessage &&
              err.sqlMessage === "Table 'users' already exists"
            ) {
              //code here
            } else {
              res.json({ status: 0, msg: err });
            }
          }
          const reqObject = req.body;
          let post = {
            UserId: reqObject.UserId,
            Password: reqObject.Password,
            Name: reqObject.Name,
            Mobile: reqObject.Mobile,
            Email: reqObject.Email,
            Address: reqObject.Address,
            Role: reqObject.Role ? "Admin" : reqObject.Role,
            Status: reqObject.Status ? "Active" : reqObject.Status,
            Created_By: reqObject.Created_By
              ? reqObject.Created_By
              : reqObject.UserId,
            Created_On: reqObject.Created_On
              ? reqObject.Created_On
              : moment().format("YYYY-MM-DD hh:mm:ss"),
            Modified_By: reqObject.Modified_By
              ? reqObject.Modified_By
              : reqObject.UserId,
            Modified_On: reqObject.Modified_On
              ? reqObject.Modified_On
              : moment().format("YYYY-MM-DD hh:mm:ss"),
          };
          let sql = "INSERT INTO users SET ?";
          let query = db.query(sql, post, (err) => {
            if (err) {
              if (err && err.code && err.code === "ER_DUP_ENTRY") {
                res.json({
                  status: 0,
                  msg: `user ${reqObject.UserId} already exist`,
                });
              } else {
                res.json({ status: 0, msg: err });
              }
            } else {
              res.json({ status: 1, msg: "user added" });
            }
          });
        } catch (ex) {
          res.json({ status: 100, msg: ex.stack });
        }
      });
    } catch (ex) {
      res.json({ status: 100, msg: ex.stack });
    }
  });

  app.post("/registration/signin", (req, res) => {
    try {
      const reqObject = req.body;
      let sql = `SELECT * FROM users where UserId = "${reqObject.UserId}" AND Password = "${reqObject.Password}"`;
      let query = db.query(sql, (err, row) => {
        if (err) {
          res.json({ status: 0, msg: err });
        } else {
          if (row && row.length && row.length > 0) {
            res.json({ status: 1, msg: "user exist" });
          } else {
            res.json({ status: 0, msg: "UserID/Password not exist" });
          }
        }
      });
    } catch (ex) {
      res.json({ status: 100, msg: ex.stack });
    }
  });

  app.post("/registration/update", (req, res) => {
    try {
      const reqObject = req.body;
      let newPassword = reqObject.Password;
      let current_date = moment().format("YYYY-MM-DD hh:mm:ss");
      let sql = `UPDATE users SET Password = '${newPassword}',Modified_By = '${reqObject.Modified_By}',Modified_On = '${current_date}'  WHERE UserId = '${reqObject.UserId}'`;
      let query = db.query(sql, (err, row) => {
        if (err) {
          res.json({ status: 0, msg: err });
        } else {
          if (row && row.affectedRows && row.affectedRows > 0) {
            res.json({ status: 1, msg: "password updated" });
          } else {
            res.json({ status: 0, msg: "Password not updated" });
          }
        }
      });
    } catch (ex) {
      res.json({ status: 100, msg: ex.stack });
    }
  });
  //code end here
};
