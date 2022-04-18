const path = require("path");
const moment = require("moment");
const appRoot = path.dirname(require.main.filename);

// get SQL DB driver connection
const db = require("../models/db");
const tableName = 'vehicles';

module.exports.controller = function (app) {  
    app.post("/vehicle/registration", (req, res) => {
        try {
          let sql =
            `CREATE TABLE ${tableName}(VehicleNo VARCHAR(15) NOT NULL, Make VARCHAR(25), Model VARCHAR(25),Insurance_exp_date DATE, PUC_exp_date DATE, VehicleType VARCHAR(25), Status VARCHAR(10), Created_By VARCHAR(50), Created_On DATE, Modified_By VARCHAR(50), Modified_On DATE, PRIMARY KEY(VehicleNo))`;
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
                VehicleNo: reqObject.VehicleNo,
                Make: reqObject.Make,
                Model: reqObject.Model,
                Insurance_exp_date: reqObject.Insurance_exp_date,
                PUC_exp_date: reqObject.PUC_exp_date,
                VehicleType: reqObject.VehicleType,
                Status: reqObject.Status ? "Active" : reqObject.Status,
                Created_By: reqObject.Created_By
                  ? reqObject.Created_By
                  : '',
                Created_On: reqObject.Created_On
                  ? reqObject.Created_On
                  : moment().format("YYYY-MM-DD hh:mm:ss"),
                Modified_By: reqObject.Created_By
                  ? reqObject.Created_By
                  : '',
                Modified_On: reqObject.Modified_On
                  ? reqObject.Modified_On
                  : moment().format("YYYY-MM-DD hh:mm:ss"),
              };
              let sql = `INSERT INTO ${tableName} SET ?`;
              let query = db.query(sql, post, (err) => {
                if (err) {
                  if (err && err.code && err.code === "ER_DUP_ENTRY") {
                    res.json({
                      status: 0,
                      msg: `vehicle  ${reqObject.VehicleNo} already exist`,
                    });
                  } else {
                    res.json({ status: 0, msg: err });
                  }
                } else {
                  res.json({ status: 1, msg: "vehicle added" });
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

    app.get('/vehicle/view/:VehicleNo', (req, res)=>{
        try{
            if(req.params && req.params.VehicleNo){
                const VehicleNo = req.params.VehicleNo ? req.params.VehicleNo : '';
                let sql = `SELECT * FROM ${tableName} where VehicleNo = "${VehicleNo}"`;
                let query = db.query(sql, (err, row) => {
                    if (err) {
                    res.json({ status: 0, msg: err });
                    } else {
                    if (row && row.length && row.length > 0) {
                        res.json({ status: 1, msg: row});
                    } else {
                        res.json({ status: 0, msg: `vehicle no ${VehicleNo} not exist` });
                    }
                    }
                });
            } else {
                res.json({ status: 0, msg: `vehicle no ${VehicleNo} invalid` });
            }
        }catch (ex) {
            res.json({ status: 100, msg: ex.stack });
          }
    })

    app.post("/vehicle/update", (req, res) => {
        try {
          const reqObject = req.body;
          let VehicleNo = reqObject.VehicleNo;
          let current_date = moment().format("YYYY-MM-DD hh:mm:ss");
          let updateQuery = `Modified_On = '${current_date}', Modified_By='${reqObject.Modified_By}',`;
          for (const k in reqObject){
              if (k !== 'Modified_On' || k !== "Modified_By"){
                updateQuery += `${k} = '${reqObject[k]}',`
              }
          }
          updateQuery = updateQuery.substring(0, updateQuery.length - 1);
          console.log(updateQuery);
          let sql = `UPDATE ${tableName} SET ${updateQuery} WHERE VehicleNo = '${VehicleNo}'`;
          let query = db.query(sql, (err, row) => {
            if (err) {
              res.json({ status: 0, msg: err });
            } else {
              if (row && row.affectedRows && row.affectedRows > 0) {
                res.json({ status: 1, msg: "vehicle date updated" });
              } else {
                res.json({ status: 0, msg: "vehicle data not updated" });
              }
            }
          });
        } catch (ex) {
          res.json({ status: 100, msg: ex.stack });
        }
      });
    //code end here
};