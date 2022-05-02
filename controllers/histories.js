const path = require("path");
const moment = require("moment");
const appRoot = path.dirname(require.main.filename);

// get SQL DB driver connection
const db = require("../models/db");
const tableName = 'inhouse_transport_history';
const newTableName = 'outside_transport_history'

module.exports.controller = function (app) {
  app.post('/history/inhouse_transport', (req, res)=>{
      try{
        let sql =
            `CREATE TABLE ${tableName}(BookNo VARCHAR(25) NOT NULL, VehicleNo VARCHAR(15), Material_Type VARCHAR(25),Material VARCHAR(50), Issued_By VARCHAR(50), Issued_Date DATE, Driver_Name VARCHAR(50), Driver_Number BIGINT, Time VARCHAR(15), Consignee_Name VARCHAR(50), Address VARCHAR(150), Trip_No INT, Gross_Weight DOUBLE, Tare_Weight DOUBLE, Net_Weight DOUBLE, PRIMARY KEY(BookNo))`;
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
                BookNo : reqObject.BookNo,
                VehicleNo : reqObject.VehicleNo,
                Material_Type : reqObject.Material_Type,
                Material : reqObject.Material,
                Issued_By : reqObject.Issued_By,
                Issued_Date : reqObject.Issued_Date,
                Driver_Name : reqObject.Driver_Name,
                Driver_Number : reqObject.Driver_Number,
                Time : reqObject.Time,
                Consignee_Name : reqObject.Consignee_Name,
                Address : reqObject.Address,
                Trip_No : reqObject.Trip_No,
                Gross_Weight : reqObject.Gross_Weight,
                Tare_Weight : reqObject.Tare_Weight,
                Net_Weight : reqObject.Net_Weight
              };
              let sql = `INSERT INTO ${tableName} SET ?`;
              let query = db.query(sql, post, (err) => {
                if (err) {
                  if (err && err.code && err.code === "ER_DUP_ENTRY") {
                    res.json({
                      status: 0,
                      msg: `in history booking ${reqObject.BookNo} already exist`,
                    });
                  } else {
                    res.json({ status: 0, msg: err });
                  }
                } else {
                  res.json({ status: 1, msg: "added in history" });
                }
              });
            } catch (ex) {
              res.json({ status: 100, msg: ex.stack });
            }
          });
      } catch(ex) {
        res.json({ status: 100, msg: ex.stack });
      }
  });
    
  app.get('/history/inhouse_transport/view/:BookNo?', (req, res)=>{
      try{
          //if(req.params && req.params.VehicleNo){
              const BookNo = req.params.BookNo ? req.params.BookNo : '';
              let findQuery = ` where BookNo = "${BookNo}"`;
              if (BookNo === ''){
                findQuery = "";
              }
              let sql = `SELECT * FROM ${tableName}${findQuery}`;
              let query = db.query(sql, (err, row) => {
                  if (err) {
                  res.json({ status: 0, msg: err });
                  } else {
                  if (row && row.length && row.length > 0) {
                      res.json({ status: 1, msg: row});
                  } else {
                    if (BookNo === ''){
                      res.json({ status: 0, msg: `No booking available` });
                    } else {
                      res.json({ status: 0, msg: `BookNo ${BookNo} not exist` });
                    }
                  }
                  }
              });
      }catch (ex) {
          res.json({ status: 100, msg: ex.stack });
        }
  });

  app.post("/history/inhouse_transport/update", (req, res) => {
    try {
      const reqObject = req.body;
      let BookNo = reqObject.BookNo;
      let current_date = moment().format("YYYY-MM-DD hh:mm:ss");
      //let updateQuery = `Issued_Date = '${current_date}',`;
      let updateQuery = ``;
      for (const k in reqObject){
          if (k !== "Issued_Date" || k !== "Modified_By"){
            updateQuery += `${k} = '${reqObject[k]}',`
          }
      }
      updateQuery = updateQuery.substring(0, updateQuery.length - 1);
      let sql = `UPDATE ${tableName} SET ${updateQuery} WHERE BookNo = '${BookNo}'`;
      let query = db.query(sql, (err, row) => {
        if (err) {
          res.json({ status: 0, msg: err });
        } else {
          if (row && row.affectedRows && row.affectedRows > 0) {
            res.json({ status: 1, msg: "date updated" });
          } else {
            res.json({ status: 0, msg: "data not updated" });
          }
        }
      });
    } catch (ex) {
      res.json({ status: 100, msg: ex.stack });
    }
  });

  app.post('/history/outside_transport', (req, res)=>{
        try{
          let sql =
              `CREATE TABLE ${newTableName}(BookNo VARCHAR(25) NOT NULL, VehicleNo VARCHAR(15), Make VARCHAR(25), Model VARCHAR(25), Insurance_exp_date Date, PUC_exp_date Date, Material_Type VARCHAR(25),Material VARCHAR(50), Issued_By VARCHAR(50), Issued_Date DATE, Driver_Name VARCHAR(50), Driver_Number BIGINT, Time VARCHAR(15), Consignee_Name VARCHAR(50), Address VARCHAR(150), Trip_No INT, Gross_Weight DOUBLE, Tare_Weight DOUBLE, Net_Weight DOUBLE, PRIMARY KEY(BookNo))`;
            db.query(sql, (err) => {
              try {
                if (err) {
                  if (
                    err &&
                    err.sqlMessage &&
                    err.sqlMessage === `Table '${newTableName}' already exists`
                  ) {
                    //code here
                  } else {
                    res.json({ status: 0, msg: err });
                  }
                }
                const reqObject = req.body;
                let post = {
                  BookNo : reqObject.BookNo,
                  VehicleNo : reqObject.VehicleNo,
                  Make : reqObject.Make,
                  Model : reqObject.Model,
                  Insurance_exp_date : reqObject.Insurance_exp_date,
                  PUC_exp_date : reqObject.PUC_exp_date,
                  Material_Type : reqObject.Material_Type,
                  Material : reqObject.Material,
                  Issued_By : reqObject.Issued_By,
                  Issued_Date : reqObject.Issued_Date,
                  Driver_Name : reqObject.Driver_Name,
                  Driver_Number : reqObject.Driver_Number,
                  Time : reqObject.Time,
                  Consignee_Name : reqObject.Consignee_Name,
                  Address : reqObject.Address,
                  Trip_No : reqObject.Trip_No,
                  Gross_Weight : reqObject.Gross_Weight,
                  Tare_Weight : reqObject.Tare_Weight,
                  Net_Weight : reqObject.Net_Weight
                };
                let sql = `INSERT INTO ${newTableName} SET ?`;
                let query = db.query(sql, post, (err) => {
                  if (err) {
                    if (err && err.code && err.code === "ER_DUP_ENTRY") {
                      res.json({
                        status: 0,
                        msg: `in history booking ${reqObject.BookNo} already exist`,
                      });
                    } else {
                      res.json({ status: 0, msg: err });
                    }
                  } else {
                    res.json({ status: 1, msg: "added in history" });
                  }
                });
              } catch (ex) {
                res.json({ status: 100, msg: ex.stack });
              }
            });
        } catch(ex) {
          res.json({ status: 100, msg: ex.stack });
        }
  });

  app.get('/history/outside_transport/view/:BookNo?', (req, res)=>{
      try{
          //if(req.params && req.params.VehicleNo){
              const BookNo = req.params.BookNo ? req.params.BookNo : '';
              let findQuery = ` where BookNo = "${BookNo}"`;
              if (BookNo === ''){
                findQuery = "";
              }
              let sql = `SELECT * FROM ${newTableName}${findQuery}`;
              let query = db.query(sql, (err, row) => {
                  if (err) {
                  res.json({ status: 0, msg: err });
                  } else {
                  if (row && row.length && row.length > 0) {
                      res.json({ status: 1, msg: row});
                  } else {
                    if (BookNo === ''){
                      res.json({ status: 0, msg: `No booking available` });
                    } else {
                      res.json({ status: 0, msg: `BookNo ${BookNo} not exist` });
                    }
                  }
                  }
              });
      }catch (ex) {
          res.json({ status: 100, msg: ex.stack });
        }
  });

  app.post("/history/outside_transport/update", (req, res) => {
    try {
      const reqObject = req.body;
      let BookNo = reqObject.BookNo;
      let current_date = moment().format("YYYY-MM-DD hh:mm:ss");
      //let updateQuery = `Issued_Date = '${current_date}',`;
      let updateQuery = ``;
      for (const k in reqObject){
          if (k !== "Issued_Date"){
            updateQuery += `${k} = '${reqObject[k]}',`
          }
      }
      updateQuery = updateQuery.substring(0, updateQuery.length - 1);
      let sql = `UPDATE ${newTableName} SET ${updateQuery} WHERE BookNo = '${BookNo}'`;
      let query = db.query(sql, (err, row) => {
        if (err) {
          res.json({ status: 0, msg: err });
        } else {
          if (row && row.affectedRows && row.affectedRows > 0) {
            res.json({ status: 1, msg: "date updated" });
          } else {
            res.json({ status: 0, msg: "data not updated" });
          }
        }
      });
    } catch (ex) {
      res.json({ status: 100, msg: ex.stack });
    }
  });
    //code end here
};