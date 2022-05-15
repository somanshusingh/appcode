const path = require("path");
const moment = require("moment");
const config = require("config");
const appRoot = path.dirname(require.main.filename);

// get SQL DB driver connection
const db = require("../models/db");
const tableName = 'transport_history';

module.exports.controller = function (app) {
  app.post('/history/inhouse_transport', (req, res)=>{
      try{
        let sql =
            `CREATE TABLE ${tableName}(Trip_No VARCHAR(15) NOT NULL, VehicleNo VARCHAR(15), Make VARCHAR(25), Model VARCHAR(25), Insurance_exp_date Date, PUC_exp_date Date, Material_Type VARCHAR(25),Material VARCHAR(50), Issued_By VARCHAR(50), Issued_Date DATE, Driver_Name VARCHAR(50), Driver_Number BIGINT, Time VARCHAR(15), Consignee_Name VARCHAR(50), Address VARCHAR(150), Gross_Weight DOUBLE, Tare_Weight DOUBLE, Net_Weight DOUBLE, Vehicle_Mapping VARCHAR(15), Qty_Mt_Weight DOUBLE, Status VARCHAR(10), LrNumber VARCHAR(10), LrDate DATE, Card_Number VARCHAR(20),Gross_Wgh_Date_time DATE, Tare_Wgh_Date_time DATE, Gate_In_Date_time DATE, Gate_Out_Date_time DATE, Remark_Field VARCHAR(200), Front_image json, Rear_Image json, Type VARCHAR(10), PRIMARY KEY(Trip_No))`;
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
                Trip_No : ('I'+moment().format('DDMMYYHHMMSS')),
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
                Status: reqObject.Status ? reqObject.Status : '',
                LrNumber : reqObject.LrNumber ? reqObject.LrNumber : '',
                LrDate  : reqObject.LrDate,
                Card_Number : reqObject.Card_Number ? reqObject.Card_Number : '',
                Type:'in'
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
              let findQuery = ` where Type = "in"`;
              if (Trip_No !== ''){
                findQuery = ` where Trip_No = "${Trip_No}" AND Type = "in"`;
              }
              if (req.query.hasOwnProperty('VehicleNo') && req.query.VehicleNo !== "") {
                findQuery = ` where VehicleNo = "${req.query.VehicleNo}" AND Type = "in"`;
              }
              if (req.query.hasOwnProperty('Card_Number') && req.query.Card_Number !== "") {
                findQuery = ` where Card_Number = "${req.query.Card_Number}" AND Type = "in"`;
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
      let sql = `UPDATE ${tableName} SET ${updateQuery} WHERE Trip_No = '${Trip_No}' AND Type = "in"`;
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
              `CREATE TABLE ${tableName}(Trip_No VARCHAR(15) NOT NULL, VehicleNo VARCHAR(15), Make VARCHAR(25), Model VARCHAR(25), Insurance_exp_date Date, PUC_exp_date Date, Material_Type VARCHAR(25),Material VARCHAR(50), Issued_By VARCHAR(50), Issued_Date DATE, Driver_Name VARCHAR(50), Driver_Number BIGINT, Time VARCHAR(15), Consignee_Name VARCHAR(50), Address VARCHAR(150), Gross_Weight DOUBLE, Tare_Weight DOUBLE, Net_Weight DOUBLE, Vehicle_Mapping VARCHAR(15), Qty_Mt_Weight DOUBLE, Status VARCHAR(10), LrNumber VARCHAR(10), LrDate DATE, Card_Number VARCHAR(20),Gross_Wgh_Date_time DATE, Tare_Wgh_Date_time DATE, Gate_In_Date_time DATE, Gate_Out_Date_time DATE, Remark_Field VARCHAR(200), Front_image json, Rear_Image json, Type VARCHAR(10), PRIMARY KEY(Trip_No))`;
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
                  Trip_No : ('O'+moment().format('DDMMYYHHMMSS')),
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
                  Status: reqObject.Status ? reqObject.Status : '',
                  LrNumber : reqObject.LrNumber ? reqObject.LrNumber : '',
                  LrDate  : reqObject.LrDate,
                  Card_Number : reqObject.Card_Number ? reqObject.Card_Number : '',
                  Type : "out"
                };
                let sql = `INSERT INTO ${tableName} SET ?`;
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
            let findQuery = ` where Type = "out"`;
            if (Trip_No !== ''){
              findQuery = ` where Trip_No = "${Trip_No}" AND Type = "out"`;
            }
            if (req.query.hasOwnProperty('VehicleNo') && req.query.VehicleNo !== "") {
              findQuery = ` where VehicleNo = "${req.query.VehicleNo}" AND Type = "out"`;
            }
            if (req.query.hasOwnProperty('Card_Number') && req.query.Card_Number !== "") {
              findQuery = ` where Card_Number = "${req.query.Card_Number}" AND Type = "out"`;
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
      let sql = `UPDATE ${tableName} SET ${updateQuery} WHERE Trip_No = '${Trip_No}' AND Type="out"`;
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
            const tempTableName = (req.body.trip && req.body.trip === 'out') ? tableName : tableName;
            let findQuery = ` where Card_Number = "${Card_Number}"`;
            if (Trip_No !== ''){
              findQuery += ` AND  Trip_No = "${Trip_No}"`;
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
                      let nquery = db.query(tempsql, (err, row, fields) => {
                        if (err) {
                          res.json({ status: 0, msg: err });
                        } else {
                          if (row && row.affectedRows && row.affectedRows > 0) {
                            console.log(Trip_No);
                            let sql = `SELECT * FROM ${tempTableName} WHERE Trip_No='${Trip_No}';                            `;
                            let query = db.query(sql, (err, row) => {
                                if (err) {
                                res.json({ status: 0, msg: err });
                                } else {
                                  if (row && row.length && row.length > 0) {
                                    res.json({ status: 1, msg: "data updated", "print_data":row[0]});
                                  } else {
                                    res.json({ status: 1, msg: "data updated" });
                                  }
                                }
                              });
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

app.get("/history/getcardinfo/:Card_Number", (req, res) => {
  try {
    const Card_Number = req.params.Card_Number ? req.params.Card_Number : '';
    let findQuery = ``;
    if (Card_Number !== ''){
        findQuery = ` where Card_Number = "${Card_Number}"`;
    }
    let sql = `SELECT * FROM ${tableName}${findQuery}`;
    let query = db.query(sql, (err, row) => {
        if (err) {
        res.json({ status: 0, msg: err });
        } else {
        if (row && row.length && row.length > 0) {
            if(row[0].hasOwnProperty('Status') && ((row[0]['Status']).toString().toLowerCase() !== "close" || (row[0]['Status']).toString().toLowerCase() !== "completed")){
              res.json({ status: 1, msg: row});
            } else{
              res.json({ status: 0, msg: `no record found` });
            }
        } else {
            res.json({ status: 0, msg: `no record found` });
        }
        }
    });
  } catch (ex) {
    res.json({ status: 100, msg: ex.stack });
  }
});

app.get("/history/gettripinfo/:Trip_No", (req, res) => {
  try {
    const Trip_No = req.params.Trip_No ? req.params.Trip_No : '';
    let findQuery = ``;
    if (Trip_No !== ''){
        findQuery = ` where Trip_No = "${Trip_No}"`;
    }
    let sql = `SELECT * FROM ${tableName}${findQuery}`;
    let query = db.query(sql, (err, row) => {
        if (err) {
        res.json({ status: 0, msg: err });
        } else {
        if (row && row.length && row.length > 0) {
            res.json({ status: 1, msg: row});
        } else {
            res.json({ status: 0, msg: `no record found` });
        }
        }
    });
  } catch (ex) {
    res.json({ status: 100, msg: ex.stack });
  }
});

    //code end here
};

