const path = require("path");
const moment = require("moment");
const appRoot = path.dirname(require.main.filename);

// get SQL DB driver connection
const db = require("../models/db");
const tableName = "sessions";

module.exports.controller = function (app) {
  app.get("/session/login", (req, res) => {
    try {
        let sql = `SELECT * FROM ${tableName}`;
        let query = db.query(sql, (err, row) => {
            if (err) {
                res.json({ status: 0, msg: err });
            } else {
            if (row && row.length && row.length > 0 && row[0].hasOwnProperty('data')) {
                //res.json({ status: 1, msg: JSON.parse(row[0].data)});
                res.json({ status: 1, msg: row});
            } else {
                res.json({ status: 0, msg: `` });
            }
            }
        });
    } catch (ex) {
      res.json({ status: 100, msg: ex.stack });
    }
  });
  app.get("/session/get", (req, res) => {
    res.json(req.session)
  });

  app.get("/session/logout", (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          res.json({ status: 0, msg: err });
        } else {
          res.json({ status: 1, msg: "" });
        }
      });
    } catch (ex) {
      res.json({ status: 100, msg: ex.stack });
    }
  });
  //code end here
};
