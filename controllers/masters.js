const path = require("path");
const moment = require("moment");
const appRoot = path.dirname(require.main.filename);

// get SQL DB driver connection
const db = require("../models/db");
const tableName = 'materialmaster';

module.exports.controller = function (app) {
    app.post("/master/material", (req, res) => {
        try {
          let sql =
            `CREATE TABLE ${tableName}(MaterialId int NOT NULL AUTO_INCREMENT, MaterialName VARCHAR(50) , Description VARCHAR(100), PRIMARY KEY(MaterialId))`;
          db.query(sql, (err) => {
            try {
              if (err) {
                if (
                  err &&
                  err.sqlMessage &&
                  err.sqlMessage === `Table '${tableName}' already exists`
                ) {
                  //code here
                } else {
                  res.json({ status: 0, msg: err });
                }
              }
              const reqObject = req.body;
              let post = {
                MaterialName: reqObject.MaterialName,
                Description : reqObject.Description ? reqObject.Description : ""
            };
              let sql = `INSERT INTO ${tableName} SET ?`;
              let query = db.query(sql, post, (err) => {
                if (err) {
                  if (err && err.code && err.code === "ER_DUP_ENTRY") {
                    res.json({
                      status: 0,
                      msg: `Material ${reqObject.MaterialId} already exist`,
                    });
                  } else {
                    res.json({ status: 0, msg: err });
                  }
                } else {
                  res.json({ status: 1, msg: "Material added" });
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
    
      app.get('/master/material/view', (req, res)=>{
        try{
                let sql = `SELECT * FROM ${tableName}`;
                let query = db.query(sql, (err, row) => {
                    if (err) {
                      res.json({ status: 0, msg: err });
                    } else {
                      if (row && row.length && row.length > 0) {
                          res.json({ status: 1, msg: row});
                      } else {
                          res.json({ status: 0, msg: `material not available` });
                      }
                    }
                });
        }catch (ex) {
            res.json({ status: 100, msg: ex.stack });
          }
    });
  
    //code end here
};