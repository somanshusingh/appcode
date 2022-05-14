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
  try{
    res.json({ status: 1, msg: {session : req.session, sessionId : req.sessionID} });
  } catch (ex) {
    res.json({ status: 100, msg: ex.stack });
  }
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

  app.get("/session/get/:session_id", (req, res) => {
    try {
        const session_id = req.params.session_id ? req.params.session_id : '';
        let sql = `SELECT * FROM ${tableName} where session_id = '${session_id}'` ;
        let query = db.query(sql, (err, row) => {
            if (err) {
                res.json({ status: 0, msg: err });
            } else {
            if (row && row.length && row.length > 0 && row[0].hasOwnProperty('data')) {
              if(row.length>0){
                for(let s in row){
                  if(row[s].hasOwnProperty('data')){
                    row[s]['data'] = JSON.parse(row[s]['data'] )
                  }
                }
              }
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

  app.get("/session/end/:session_id", (req, res) => {
    try {
        const session_id = req.params.session_id ? req.params.session_id : '';
        let sql = `delete FROM ${tableName} where session_id = '${session_id}'` ;
        let query = db.query(sql, (err, row) => {
            if (err) {
                res.json({ status: 0, msg: err });
            } else {
              if (row && row.affectedRows && row.affectedRows > 0) {
                res.json({ status: 1, msg: "Logged Out" });
              } else {
                res.json({ status: 0, msg: "Error" });
              }
            }
        });
    } catch (ex) {
      res.json({ status: 100, msg: ex.stack });
    }
  });
  //code end here

};
