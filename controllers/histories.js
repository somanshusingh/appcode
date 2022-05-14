const path = require("path");
const moment = require("moment");
const config = require("config");
const appRoot = path.dirname(require.main.filename);

// get SQL DB driver connection
const db = require("../models/db");
const tableName = 'inhouse_transport_history';
const newTableName = 'outside_transport_history'

module.exports.controller = function (app) {
  app.post('/history/inhouse_transport', (req, res)=>{
      try{
        let sql =
            `CREATE TABLE ${tableName}(Trip_No INT NOT NULL auto_increment, VehicleNo VARCHAR(15), Material_Type VARCHAR(25),Material VARCHAR(50), Issued_By VARCHAR(50), Issued_Date DATE, Driver_Name VARCHAR(50), Driver_Number BIGINT, Time VARCHAR(15), Consignee_Name VARCHAR(50), Address VARCHAR(150), Gross_Weight DOUBLE, Tare_Weight DOUBLE, Net_Weight DOUBLE, Vehicle_Mapping VARCHAR(15), Qty_Mt_Weight DOUBLE, Status VARCHAR(10), LrNumber VARCHAR(10), LrDate DATE, Card_Number VARCHAR(20), PRIMARY KEY(Trip_No))`;
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
                VehicleNo : reqObject.VehicleNo,
                Material_Type : reqObject.Material,
                Material : reqObject.Material,
                Issued_By : reqObject.Issued_By,
                Issued_Date : reqObject.Issued_Date,
                Driver_Name : reqObject.Driver_Name,
                Driver_Number : reqObject.Driver_Number,
                Time : reqObject.Time,
                Consignee_Name : reqObject.Consignee_Name,
                Address : reqObject.Address,
                Gross_Weight : 0,//reqObject.Gross_Weight,
                Tare_Weight : 0,//reqObject.Tare_Weight,
                Net_Weight : 0,//reqObject.Net_Weight,
                Vehicle_Mapping: '',//reqObject.Vehicle_Mapping,
                Qty_Mt_Weight : reqObject.Qty_Mt_Weight,
                Status: "open",
                LrNumber : reqObject.LrNumber ? reqObject.LrNumber : '',
                LrDate  : reqObject.LrDate,
                Card_Number : reqObject.Card_Number ? reqObject.Card_Number : ''
              };
              let sql = `INSERT INTO ${tableName} SET ?`;
              let query = db.query(sql, post, (err) => {
                if (err) {
                    res.json({ status: 0, msg: err });
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
    
  app.get('/history/inhouse_transport/view/:Trip_No?', (req, res)=>{
      try{
          //if(req.params && req.params.VehicleNo){
              const Trip_No = req.params.Trip_No ? req.params.Trip_No : '';
              let findQuery = ` where Trip_No = "${Trip_No}"`;
              if (Trip_No === ''){
                findQuery = "";
              }
              if (req.query.hasOwnProperty('VehicleNo') && req.query.VehicleNo !== "") {
                findQuery = ` where VehicleNo = "${req.query.VehicleNo}"`;
              }
              let sql = `SELECT * FROM ${tableName}${findQuery}`;
              let query = db.query(sql, (err, row) => {
                  if (err) {
                  res.json({ status: 0, msg: err });
                  } else {
                  if (row && row.length && row.length > 0) {
                      res.json({ status: 1, msg: row});
                  } else {
                    if (Trip_No === ''){
                      res.json({ status: 0, msg: `No trip available` });
                    } else {
                      res.json({ status: 0, msg: `Trip ${Trip_No} not exist` });
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
      let Trip_No = reqObject.Trip_No;
      let current_date = moment().format("YYYY-MM-DD hh:mm:ss");
      //let updateQuery = `Issued_Date = '${current_date}',`;
      let updateQuery = ``;
      for (const k in reqObject){
          if (k !== "Issued_Date" || k !== "Modified_By"){
            updateQuery += `${k} = '${reqObject[k]}',`
          }
      }
      updateQuery = updateQuery.substring(0, updateQuery.length - 1);
      let sql = `UPDATE ${tableName} SET ${updateQuery} WHERE Trip_No = '${Trip_No}'`;
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
              `CREATE TABLE ${newTableName}(Trip_No INT NOT NULL auto_increment, VehicleNo VARCHAR(15), Make VARCHAR(25), Model VARCHAR(25), Insurance_exp_date Date, PUC_exp_date Date, Material_Type VARCHAR(25),Material VARCHAR(50), Issued_By VARCHAR(50), Issued_Date DATE, Driver_Name VARCHAR(50), Driver_Number BIGINT, Time VARCHAR(15), Consignee_Name VARCHAR(50), Address VARCHAR(150), Gross_Weight DOUBLE, Tare_Weight DOUBLE, Net_Weight DOUBLE, Vehicle_Mapping VARCHAR(15), Qty_Mt_Weight DOUBLE, Status VARCHAR(10), LrNumber VARCHAR(10), LrDate DATE, Card_Number VARCHAR(20), PRIMARY KEY(Trip_No))`;
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
                  VehicleNo : reqObject.VehicleNo,
                  Make : reqObject.Make,
                  Model : reqObject.Model,
                  Insurance_exp_date : reqObject.Insurance_exp_date,
                  PUC_exp_date : reqObject.PUC_exp_date,
                  Material_Type : reqObject.Material,
                  Material : reqObject.Material,
                  Issued_By : reqObject.Issued_By,
                  Issued_Date : reqObject.Issued_Date,
                  Driver_Name : reqObject.Driver_Name,
                  Driver_Number : reqObject.Driver_Number,
                  Time : reqObject.Time,
                  Consignee_Name : reqObject.Consignee_Name,
                  Address : reqObject.Address,
                  Gross_Weight : 0,//reqObject.Gross_Weight,
                  Tare_Weight : 0,//reqObject.Tare_Weight,
                  Net_Weight : 0,//reqObject.Net_Weight,
                  Vehicle_Mapping: '',//reqObject.Vehicle_Mapping,
                  Qty_Mt_Weight : reqObject.Qty_Mt_Weight,
                  Status: "open",
                  LrNumber : reqObject.LrNumber ? reqObject.LrNumber : '',
                  LrDate  : reqObject.LrDate,
                  Card_Number : reqObject.Card_Number ? reqObject.Card_Number : ''
                };
                let sql = `INSERT INTO ${newTableName} SET ?`;
                let query = db.query(sql, post, (err) => {
                  if (err) {
                      res.json({ status: 0, msg: err });
                  } else {
                    res.json({ status: 1, msg: "added in history" });
                  }
                });
                if(reqObject.hasOwnProperty('Vehicle') && reqObject.Vehicle === false){
                  let objVehicleData = {
                    data: {
                      "VehicleNo": reqObject.VehicleNo,
                      "Make": reqObject.Make,
                      "Model": reqObject.Model,
                      "Insurance_exp_date": reqObject.Insurance_exp_date,
                      "PUC_exp_date": reqObject.PUC_exp_date,
                      "VehicleType": "",
                      "Created_By": reqObject.Issued_By,
                      "Modified_By": reqObject.Issued_By,
                      "Source": "OutBound"
                    },
                    headers: {
                      "Content-Type": "application/json",
                    },
                  };
                  const url_api = config.environment.weburl + "/vehicle/registration";
                  var Client = require("node-rest-client").Client;
                  var client = new Client();
                  client.post(url_api, objVehicleData, function (data, response) {
                     console.log(data);
                  });
                }
              } catch (ex) {
                res.json({ status: 100, msg: ex.stack });
              }
            });
        } catch(ex) {
          res.json({ status: 100, msg: ex.stack });
        }
  });

  app.get('/history/outside_transport/view/:Trip_No?', (req, res)=>{
      try{
          //if(req.params && req.params.VehicleNo){
              const Trip_No = req.params.Trip_No ? req.params.Trip_No : '';
              let findQuery = ` where Trip_No = "${Trip_No}"`;
              if (Trip_No === ''){
                findQuery = "";
              }
              if (req.query.hasOwnProperty('VehicleNo') && req.query.VehicleNo !== "") {
                findQuery = ` where VehicleNo = "${req.query.VehicleNo}"`;
              }
              let sql = `SELECT * FROM ${newTableName}${findQuery}`;
              let query = db.query(sql, (err, row) => {
                  if (err) {
                  res.json({ status: 0, msg: err });
                  } else {
                  if (row && row.length && row.length > 0) {
                      res.json({ status: 1, msg: row});
                  } else {
                    if (Trip_No === ''){
                      res.json({ status: 0, msg: `No trip available` });
                    } else {
                      res.json({ status: 0, msg: `Trip ${Trip_No} not exist` });
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
      let Trip_No = reqObject.Trip_No;
      let current_date = moment().format("YYYY-MM-DD hh:mm:ss");
      //let updateQuery = `Issued_Date = '${current_date}',`;
      let updateQuery = ``;
      for (const k in reqObject){
          if (k !== "Issued_Date"){
            updateQuery += `${k} = '${reqObject[k]}',`
          }
      }
      updateQuery = updateQuery.substring(0, updateQuery.length - 1);
      let sql = `UPDATE ${newTableName} SET ${updateQuery} WHERE Trip_No = '${Trip_No}'`;
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

  app.post('/history/weight/update', (req, res)=>{
    try{
        //if(req.params && req.params.VehicleNo){
            const Trip_No = req.body.Trip_No ? req.body.Trip_No : '';
            const Weight = (req.body.Weight && isNaN(req.body.Weight) === false) ? parseFloat(req.body.Weight) : 0;
            const Card_Number = req.body.Card_Number ? req.body.Card_Number : '';
            const tempTableName = (req.body.trip && req.body.trip === 'out') ? newTableName : tableName;
            let findQuery = ` where Card_Number = "${Card_Number}"`;
            if (Trip_No !== ''){
              findQuery += ` AND  Trip_No = ${Trip_No}`;
            }
            let sql = `SELECT * FROM ${tempTableName}${findQuery}`;
            let query = db.query(sql, (err, row) => {
                if (err) {
                res.json({ status: 0, msg: err });
                } else {
                if (row && row.length && row.length > 0) {
                  //res.json({ status: 1, msg: row});
                  //console.log(row, Weight);
                  let tempGross_Weight = row[0].Gross_Weight ? row[0].Gross_Weight : 0;
                  let tempTare_Weight = row[0].Tare_Weight ? row[0].Tare_Weight : 0;
                  console.log('tempGross_Weight , tempTare_Weight, Weight')
                  console.log(tempGross_Weight , tempTare_Weight, Weight)
                  if ((tempGross_Weight || tempGross_Weight === 0 )|| (tempTare_Weight || tempTare_Weight === 0) ){
                    let updateQuery = ``;
                    if (tempGross_Weight !== 0 && tempTare_Weight !== 0 )  {
                      updateQuery = ``;
                    }else if ((tempGross_Weight && tempGross_Weight !== 0) || (tempGross_Weight !== 0 && tempTare_Weight === 0 ))  {
                      updateQuery = `Tare_Weight = "${Weight}"`;
                    }else if ((tempTare_Weight && tempTare_Weight !== 0) || ( tempTare_Weight !== 0 && tempGross_Weight === 0 ))   {
                      updateQuery = `Gross_Weight = "${Weight}"`
                    }else if (tempGross_Weight === 0 && tempTare_Weight === 0 )   {
                      updateQuery = `Gross_Weight = "${Weight}"`
                    }
                    if (updateQuery !== ``){
                      let tempsql = `UPDATE ${tempTableName} SET ${updateQuery} ${findQuery}`;
                      let nquery = db.query(tempsql, (err, row) => {
                        if (err) {
                          res.json({ status: 0, msg: err });
                        } else {
                          if (row && row.affectedRows && row.affectedRows > 0) {
                            res.json({ status: 1, msg: "data updated" });
                          } else {
                            res.json({ status: 0, msg: "data not updated" });
                          }
                        }
                      });
                    } else {
                      res.json({ status: 0, msg: `Weight not updated` });
                    }
                  }else {
                    res.json({ status: 0, msg: `Weight not updated` });
                  }
                } else {
                  res.json({ status: 0, msg: `Card_Number ${Card_Number} not exist` });
                }
                }
            });
    }catch (ex) {
        res.json({ status: 100, msg: ex.stack });
      }
});
    //code end here
};

