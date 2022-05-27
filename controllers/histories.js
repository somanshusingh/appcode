const path = require("path");
const moment = require("moment");
const config = require("config");
const appRoot = path.dirname(require.main.filename);
const fs = require("fs");
const pdf = require('html-pdf');

// get SQL DB driver connection
const db = require("../models/db");
const tableName = 'transport_history';

module.exports.controller = function (app) {
  app.post('/history/inhouse_transport', (req, res)=>{
      try{
        let sql =
            `CREATE TABLE ${tableName}(Trip_No VARCHAR(15) NOT NULL, VehicleNo VARCHAR(15), Make VARCHAR(25), Model VARCHAR(25), Insurance_exp_date datetime, PUC_exp_date datetime, Material_Type VARCHAR(25),Material VARCHAR(50), Issued_By VARCHAR(50), Issued_Date datetime, Driver_Name VARCHAR(50), Driver_Number BIGINT, Time VARCHAR(15), Consignee_Name VARCHAR(50), Address VARCHAR(150), Gross_Weight DOUBLE, Tare_Weight DOUBLE, Net_Weight DOUBLE, Vehicle_Mapping VARCHAR(15), Qty_Mt_Weight DOUBLE, Status VARCHAR(10), LrNumber VARCHAR(10), LrDate datetime, Card_Number VARCHAR(20),Gross_Wgh_Date_time datetime, Tare_Wgh_Date_time datetime, Gate_In_Date_time datetime, Gate_Out_Date_time datetime, Remark_Field VARCHAR(200), Front_Image VARCHAR(50), Rear_Image VARCHAR(50), Type VARCHAR(10), PRIMARY KEY(Trip_No))`;
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
              let newSql = `select * from ${tableName} where VehicleNo = '${reqObject.VehicleNo}' AND (NOT Status = "close" AND NOT Status = "completed")`;
              let newQuery = db.query(newSql, (err, row) => {
                if (err) {
                  res.json({ status: 0, msg: err });
                } else {
                  if (row && row.length && row.length > 0) {
                    res.json({ status: 0, msg: "Trip already exists" });
                  } else {
                    let newSql = `select * from ${tableName} where Card_Number = '${reqObject.Card_Number}' AND (NOT Status = "close" AND NOT Status = "completed")`;
                    let newQuery = db.query(newSql, (err, row) => {
                      if (err) {
                        res.json({ status: 0, msg: err });
                      } else {
                        if (row && row.length && row.length > 0) {
                          res.json({ status: 0, msg: "Trip already exists for given Card Number" });
                        } else {
                          let tempTrip = moment().format("DDMMYYHHMMSS");
                          let post = {
                            Trip_No: "I" + tempTrip,
                            VehicleNo: reqObject.VehicleNo,
                            Make: reqObject.Make ? reqObject.Make : '',
                            Model: reqObject.Model ? reqObject.Model : '',
                            Insurance_exp_date: reqObject.Insurance_exp_date ? reqObject.Insurance_exp_date : '',
                            PUC_exp_date: reqObject.PUC_exp_date ? reqObject.PUC_exp_date : '',
                            Material_Type: reqObject.Material,
                            Material: reqObject.Material,
                            Issued_By: reqObject.Issued_By,
                            Issued_Date: moment().format("YYYY-MM-DD hh:mm:ss"),
                            Driver_Name: reqObject.Driver_Name,
                            Driver_Number: reqObject.Driver_Number,
                            Time: moment().format("hh:mm:ss"),
                            Consignee_Name: reqObject.Consignee_Name,
                            Address: reqObject.Address,
                            Gross_Weight: 0, //reqObject.Gross_Weight,
                            Tare_Weight: 0, //reqObject.Tare_Weight,
                            Net_Weight: 0, //reqObject.Net_Weight,
                            Vehicle_Mapping: "", //reqObject.Vehicle_Mapping,
                            Qty_Mt_Weight: reqObject.Qty_Mt_Weight,
                            Status: reqObject.Status ? reqObject.Status : "",
                            LrNumber: reqObject.LrNumber
                              ? reqObject.LrNumber
                              : "",
                            LrDate: reqObject.LrDate,
                            Card_Number: reqObject.Card_Number
                              ? reqObject.Card_Number
                              : "",
                            Type: "in",
                            Front_Image : tempTrip+'_Front',
                            Rear_Image : tempTrip+'_Rear',
                            Gate_In_Date_time: moment().format(
                              "YYYY-MM-DD hh:mm:ss"
                            ),
                          };
                          let sql = `INSERT INTO ${tableName} SET ?`;
                          let query = db.query(sql, post, (err) => {
                            if (err) {
                              res.json({ status: 0, msg: err });
                            } else {
                              res.json({ status: 1, msg: "added in history" });
                            }
                          });
                        }
                      }
                    });
                  }
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
              let findQuery = ` where Type = 'in' ORDER BY Gate_In_Date_time,Time DESC`;
              if (Trip_No !== ''){
                findQuery = ` where Trip_No = "${Trip_No}"`;
              }
              if (req.query.hasOwnProperty('VehicleNo') && req.query.VehicleNo !== "") {
                findQuery = ` where VehicleNo = "${req.query.VehicleNo}"`;
              }
              if (req.query.hasOwnProperty('Card_Number') && req.query.Card_Number !== "") {
                findQuery = ` where Card_Number = "${req.query.Card_Number}"`;
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
      let newSql = `select * from ${tableName} where Card_Number = '${reqObject.Card_Number}' AND (NOT Status = "close" AND NOT Status = "completed")`;
      let newQuery = db.query(newSql, (err, row) => {
        if (err) {
          res.json({ status: 0, msg: err });
        } else {
          if (row && row.length && row.length > 0) {
            res.json({
              status: 0,
              msg: "Trip already exists for given Card Number",
            });
          } else {
            let Trip_No = reqObject.Trip_No;
            let current_date = moment().format("YYYY-MM-DD hh:mm:ss");
            //let updateQuery = `Issued_Date = '${current_date}',`;
            let updateQuery = ``;
            for (const k in reqObject) {
              if (k !== "Issued_Date" || k !== "Modified_By") {
                updateQuery += `${k} = '${reqObject[k]}',`;
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
              `CREATE TABLE ${tableName}(Trip_No VARCHAR(15) NOT NULL, VehicleNo VARCHAR(15), Make VARCHAR(25), Model VARCHAR(25), Insurance_exp_date datetime, PUC_exp_date datetime, Material_Type VARCHAR(25),Material VARCHAR(50), Issued_By VARCHAR(50), Issued_Date datetime, Driver_Name VARCHAR(50), Driver_Number BIGINT, Time VARCHAR(15), Consignee_Name VARCHAR(50), Address VARCHAR(150), Gross_Weight DOUBLE, Tare_Weight DOUBLE, Net_Weight DOUBLE, Vehicle_Mapping VARCHAR(15), Qty_Mt_Weight DOUBLE, Status VARCHAR(10), LrNumber VARCHAR(10), LrDate datetime, Card_Number VARCHAR(20),Gross_Wgh_Date_time datetime, Tare_Wgh_Date_time datetime, Gate_In_Date_time datetime, Gate_Out_Date_time datetime, Remark_Field VARCHAR(200), Front_Image VARCHAR(50), Rear_Image VARCHAR(50), Type VARCHAR(10), PRIMARY KEY(Trip_No))`;
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
                let newSql = `select * from ${tableName} where VehicleNo = '${reqObject.VehicleNo}' AND (NOT Status = "close" AND NOT Status = "completed")`;
                let newQuery = db.query(newSql, (err, row) => {
                  if (err) {
                    res.json({ status: 0, msg: err });
                  } else {
                    if (row && row.length && row.length > 0) {
                      res.json({ status: 0, msg: "Trip already exists" });
                    } else {
                      let newSql = `select * from ${tableName} where Card_Number = '${reqObject.Card_Number}' AND (NOT Status = "close" AND NOT Status = "completed")`;
                      let newQuery = db.query(newSql, (err, row) => {
                        if (err) {
                          res.json({ status: 0, msg: err });
                        } else {
                          if (row && row.length && row.length > 0) {
                            res.json({ status: 0, msg: "Trip already exists for given Card Number" });
                          } else {
                            let tempTrip = moment().format("DDMMYYHHMMSS");
                            let post = {
                              Trip_No: "O" + tempTrip,
                              VehicleNo: reqObject.VehicleNo,
                              Make: reqObject.Make,
                              Model: reqObject.Model,
                              Insurance_exp_date: reqObject.Insurance_exp_date,
                              PUC_exp_date: reqObject.PUC_exp_date,
                              Material_Type: reqObject.Material,
                              Material: reqObject.Material,
                              Issued_By: reqObject.Issued_By,
                              Issued_Date: moment().format("YYYY-MM-DD hh:mm:ss"),
                              Driver_Name: reqObject.Driver_Name,
                              Driver_Number: reqObject.Driver_Number,
                              Time: moment().format("hh:mm:ss"),
                              Consignee_Name: reqObject.Consignee_Name,
                              Address: reqObject.Address,
                              Gross_Weight: 0, //reqObject.Gross_Weight,
                              Tare_Weight: 0, //reqObject.Tare_Weight,
                              Net_Weight: 0, //reqObject.Net_Weight,
                              Vehicle_Mapping: "", //reqObject.Vehicle_Mapping,
                              Qty_Mt_Weight: reqObject.Qty_Mt_Weight,
                              Status: reqObject.Status ? reqObject.Status : "",
                              LrNumber: reqObject.LrNumber
                                ? reqObject.LrNumber
                                : "",
                              LrDate: reqObject.LrDate,
                              Card_Number: reqObject.Card_Number
                                ? reqObject.Card_Number
                                : "",
                              Type: "out",
                              Front_Image : tempTrip+'_Front',
                              Rear_Image : tempTrip+'_Rear',
                              Gate_In_Date_time: moment().format(
                                "YYYY-MM-DD hh:mm:ss"
                              ),
                            };
                            let sql = `INSERT INTO ${tableName} SET ?`;
                            let query = db.query(sql, post, (err) => {
                              if (err) {
                                res.json({ status: 0, msg: err });
                              } else {
                                res.json({
                                  status: 1,
                                  msg: "added in history",
                                });
                              }
                            });
                            if (
                              reqObject.hasOwnProperty("Vehicle") &&
                              reqObject.Vehicle === false
                            ) {
                              let objVehicleData = {
                                data: {
                                  VehicleNo: reqObject.VehicleNo,
                                  Make: reqObject.Make,
                                  Model: reqObject.Model,
                                  Insurance_exp_date:
                                    reqObject.Insurance_exp_date,
                                  PUC_exp_date: reqObject.PUC_exp_date,
                                  VehicleType: "",
                                  Created_By: reqObject.Issued_By,
                                  Modified_By: reqObject.Issued_By,
                                  Source: "OutBound",
                                },
                                headers: {
                                  "Content-Type": "application/json",
                                },
                              };
                              const url_api =
                                config.environment.weburl +
                                "/vehicle/registration";
                              var Client = require("node-rest-client").Client;
                              var client = new Client();
                              client.post(
                                url_api,
                                objVehicleData,
                                function (data, response) {
                                  console.log(data);
                                }
                              );
                            }
                          }
                        }
                      });
                    }
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

  app.get('/history/outside_transport/view/:Trip_No?', (req, res)=>{
      try{
          //if(req.params && req.params.VehicleNo){
            const Trip_No = req.params.Trip_No ? req.params.Trip_No : '';
            let findQuery = ` where Type = 'out' ORDER BY Gate_In_Date_time,Time DESC`;
            if (Trip_No !== ''){
              findQuery = ` where Trip_No = "${Trip_No}"`;
            }
            if (req.query.hasOwnProperty('VehicleNo') && req.query.VehicleNo !== "") {
              findQuery = ` where VehicleNo = "${req.query.VehicleNo}"`;
            }
            if (req.query.hasOwnProperty('Card_Number') && req.query.Card_Number !== "") {
              findQuery = ` where Card_Number = "${req.query.Card_Number}"`;
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
      let newSql = `select * from ${tableName} where Card_Number = '${reqObject.Card_Number}' AND (NOT Status = "close" AND NOT Status = "completed")`;
      let newQuery = db.query(newSql, (err, row) => {
        if (err) {
          res.json({ status: 0, msg: err });
        } else {
          if (row && row.length && row.length > 0) {
            res.json({
              status: 0,
              msg: "Trip already exists for given Card Number",
            });
          } else {
            let Trip_No = reqObject.Trip_No;
            let current_date = moment().format("YYYY-MM-DD hh:mm:ss");
            //let updateQuery = `Issued_Date = '${current_date}',`;
            let updateQuery = ``;
            for (const k in reqObject) {
              if (k !== "Issued_Date") {
                updateQuery += `${k} = '${reqObject[k]}',`;
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
                      updateQuery = `Tare_Weight = "${Weight}", Tare_Wgh_Date_time = "${moment().format("YYYY-MM-DD hh:mm:ss")}"`;
                    }else if ((tempTare_Weight && tempTare_Weight !== 0) || ( tempTare_Weight !== 0 && tempGross_Weight === 0 ))   {
                      updateQuery = `Gross_Weight = "${Weight}", Gross_Wgh_Date_time = "${moment().format("YYYY-MM-DD hh:mm:ss")}"`
                    }else if (tempGross_Weight === 0 && tempTare_Weight === 0 )   {
                      updateQuery = `Gross_Weight = "${Weight}", Gross_Wgh_Date_time = "${moment().format("YYYY-MM-DD hh:mm:ss")}"`
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

app.get('/history/weight/update/:Card_Number/:Weight', (req, res)=>{
  try{
      //if(req.params && req.params.VehicleNo){
          const Weight = (req.params.Weight && isNaN(req.params.Weight) === false) ? parseFloat(req.params.Weight) : 0;
          const Card_Number = req.params.Card_Number ? req.params.Card_Number : '';
          let findQuery = ` where Card_Number = "${Card_Number}" AND Status = 'In plant'`;
          let sql = `SELECT * FROM ${tableName}${findQuery}`;
          let query = db.query(sql, (err, row) => {
              if (err) {
              res.json({ status: 0, msg: err });
              } else {
              if (row && row.length && row.length > 0) {
                //res.json({ status: 1, msg: row});
                //console.log(row, Weight);
                if(row[0].hasOwnProperty('Status') && ((row[0]['Status']).toString().toLowerCase() !== "close" || (row[0]['Status']).toString().toLowerCase() !== "completed")){
                  let tempGross_Weight = row[0].Gross_Weight ? row[0].Gross_Weight : 0;
                  let tempTare_Weight = row[0].Tare_Weight ? row[0].Tare_Weight : 0;
                  if ((tempGross_Weight || tempGross_Weight === 0 )|| (tempTare_Weight || tempTare_Weight === 0) ){
                    let updateQuery = ``;
                    if (tempGross_Weight !== 0 && tempTare_Weight !== 0 )  {
                      updateQuery = ``;
                    }else if ((tempGross_Weight && tempGross_Weight !== 0) || (tempGross_Weight !== 0 && tempTare_Weight === 0 ))  {
                      updateQuery = `Tare_Weight = "${Weight}", Tare_Wgh_Date_time = "${moment().format("YYYY-MM-DD hh:mm:ss")}"`;
                    }else if ((tempTare_Weight && tempTare_Weight !== 0) || ( tempTare_Weight !== 0 && tempGross_Weight === 0 ))   {
                      updateQuery = `Gross_Weight = "${Weight}", Gross_Wgh_Date_time = "${moment().format("YYYY-MM-DD hh:mm:ss")}"`
                    }else if (tempGross_Weight === 0 && tempTare_Weight === 0 )   {
                      updateQuery = `Gross_Weight = "${Weight}", Gross_Wgh_Date_time = "${moment().format("YYYY-MM-DD hh:mm:ss")}"`
                    }
                    if (updateQuery !== ``){
                      let tempsql = `UPDATE ${tableName} SET ${updateQuery} ${findQuery}`;
                      let nquery = db.query(tempsql, (err, row, fields) => {
                        if (err) {
                          res.json({ status: 0, msg: err });
                        } else {
                          if (row && row.affectedRows && row.affectedRows > 0) {
                            let sql = `SELECT * FROM ${tableName} WHERE Card_Number='${Card_Number}';                            `;
                            let query = db.query(sql, (err, row) => {
                                if (err) {
                                res.json({ status: 0, msg: err });
                                } else {
                                  if (row && row.length && row.length > 0) {
                                    let printData = row[0];
                                    //res.json({ status: 1, msg: "data updated", "print_data":row[0]});
                                    let html_file_path = appRoot + "/tmp/recipt.html";
                                    let htmlPol = fs.readFileSync(html_file_path, 'utf8');
                                    let replacedata={
                                      "___trip_no___":printData.hasOwnProperty('Trip_No') ? printData.Trip_No : '',
                                      "___material_type___":printData.hasOwnProperty('Material') ? printData.Material : '',
                                      "___consignee_name___":printData.hasOwnProperty('Consignee_Name') ? printData.Consignee_Name : '',
                                      "___vehicle_no___":printData.hasOwnProperty('VehicleNo') ? printData.VehicleNo : '',
                                      "___vehicle_type___":printData.hasOwnProperty('VehicleType') ? printData.VehicleType : '',
                                      "___net_weight___":printData.hasOwnProperty('Net_Weight') ? printData.Net_Weight : 0,
                                      "___gross_weight___":printData.hasOwnProperty('Gross_Weight') ? printData.Gross_Weight : 0,
                                      "___gross_date___":printData.hasOwnProperty('Gross_Wgh_Date_time') ? moment(printData.Gross_Wgh_Date_time).utcOffset("+05:30").format('YYYY-MM-DD') : '',
                                      "___gross_time___":printData.hasOwnProperty('Gross_Wgh_Date_time') ? moment(printData.Gross_Wgh_Date_time).utcOffset("+05:30").format('HH:MM') : '',
                                      "___tare_weight___":printData.hasOwnProperty('Tare_Weight') ? printData.Tare_Weight : '',
                                      "___tare_date___":printData.hasOwnProperty('Tare_Wgh_Date_time') ? moment(printData.Tare_Wgh_Date_time).utcOffset("+05:30").format('YYYY-MM-DD') : '',
                                      "___tare_time___":printData.hasOwnProperty('Tare_Wgh_Date_time') ? moment(printData.Tare_Wgh_Date_time).utcOffset("+05:30").format('HH:MM') : ''
                                    };
                                    var replaceString = htmlPol.toString();
                                    var regex;
                                    for (var key in replacedata) {
                                        if (replacedata.hasOwnProperty(key)) {
                                            var val = replacedata[key];
                                            regex = new RegExp(key, "g");
                                            replaceString = replaceString.replace(regex, val);
                                        }
                                    }
                                    htmlPol = replaceString;
                                    //var request_html_file = fs.writeFileSync(html_pdf_file_path, htmlPol);
                                    let options = { format: 'A4',  width: '900px',  height : '2000px', zoomFactor : .5 };
                                    pdf.create(htmlPol).toBuffer(function(err, buffer){
                                      res.json({ MT_WB_Post_Rec :{SUCCESS: 1, DATA_PRINT: buffer.toString('base64') }});
                                    });
                                  } else {
                                    res.json({ MT_WB_Post_Rec :{SUCCESS: 0, DATA_PRINT: `error in updating` }});
                                  }
                                }
                              });
                          } else {
                            res.json({ MT_WB_Post_Rec :{SUCCESS: 0, DATA_PRINT: `data not updated` }});
                          }
                        }
                      });
                    } else {
                      res.json({ MT_WB_Post_Rec :{SUCCESS: 0, DATA_PRINT: `Weight not updated` }});
                    }
                  }else {
                    res.json({ MT_WB_Post_Rec :{SUCCESS: 0, DATA_PRINT: `Weight not updated` }});
                  }
                }else {
                  res.json({ MT_WB_Post_Rec :{SUCCESS: 0, DATA_PRINT: `Weight not updated` }});
                }
              } else {
                res.json({MT_WB_Post_Rec : { SUCCESS: 0, DATA_PRINT: `Card_Number ${Card_Number} not exist` }});
              }
              }
          });
  }catch (ex) {
      res.json({MT_WB_Post_Rec : { SUCCESS: 100, DATA_PRINT: ex.stack }});
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
app.get("/history/card/out/:Card_Number", (req, res) => {
  try {
    const Card_Number = req.params.Card_Number ? req.params.Card_Number : '';
    let findQuery = ``;
    if (Card_Number !== ''){
        findQuery = ` where Card_Number = "${Card_Number}" AND ( Not Status = 'close' AND Not Status = 'completed')`;
    }
    let sql = `SELECT * FROM ${tableName}${findQuery}`;
    let query = db.query(sql, (err, row) => {
        if (err) {
        res.json({ status: 0, msg: err });
        } else {
        if (row && row.length && row.length > 0) {
            let Status = `close`;
            //res.json({ status: 1, msg: row});
            if (row[0].hasOwnProperty('Gross_Weight') && row[0]['Gross_Weight'] > 0 && row[0].hasOwnProperty('Tare_Weight') && row[0]['Tare_Weight'] > 0){
              Status = `completed`;
            }
            let tempsql = `UPDATE ${tableName} SET Status = '${Status}', Gate_Out_Date_time = '${moment().format("YYYY-MM-DD hh:mm:ss")}'  ${findQuery}`;
            let nquery = db.query(tempsql, (err, row, fields) => {
              if (err) {
                res.json({ status: 0, msg: err });
              } else {
                if (row && row.affectedRows && row.affectedRows > 0) {
                  res.json({ status: 1, msg: `status updated` });
                } else {
                  res.json({ status: 0, msg: `status not updated` });
                }
              }
            });
        } else {
            res.json({ status: 0, msg: `no record found` });
        }
        }
    });
  } catch (ex) {
    res.json({ status: 100, msg: ex.stack });
  }
});

app.get("/history/print_trip/:Trip_No", (req, res) => {
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
            //res.json({ status: 1, msg: row});
            let printData = row[0];
            let html_file_path = appRoot + "/tmp/recipt.html";
            let htmlPol = fs.readFileSync(html_file_path, 'utf8');
            let replacedata={
              "___trip_no___":printData.hasOwnProperty('Trip_No') ? printData.Trip_No : '',
              "___material_type___":printData.hasOwnProperty('Material') ? printData.Material : '',
              "___consignee_name___":printData.hasOwnProperty('Consignee_Name') ? printData.Consignee_Name : '',
              "___vehicle_no___":printData.hasOwnProperty('VehicleNo') ? printData.VehicleNo : '',
              "___vehicle_type___":printData.hasOwnProperty('VehicleType') ? printData.VehicleType : '',
              "___net_weight___":printData.hasOwnProperty('Net_Weight') ? printData.Net_Weight : 0,
              "___gross_weight___":printData.hasOwnProperty('Gross_Weight') ? printData.Gross_Weight : 0,
              "___gross_date___":printData.hasOwnProperty('Gross_Wgh_Date_time') ? moment(printData.Gross_Wgh_Date_time).utcOffset("+05:30").format('YYYY-MM-DD') : '',
              "___gross_time___":printData.hasOwnProperty('Gross_Wgh_Date_time') ? moment(printData.Gross_Wgh_Date_time).utcOffset("+05:30").format('HH:MM') : '',
              "___tare_weight___":printData.hasOwnProperty('Tare_Weight') ? printData.Tare_Weight : '',
              "___tare_date___":printData.hasOwnProperty('Tare_Wgh_Date_time') ? moment(printData.Tare_Wgh_Date_time).utcOffset("+05:30").format('YYYY-MM-DD') : '',
              "___tare_time___":printData.hasOwnProperty('Tare_Wgh_Date_time') ? moment(printData.Tare_Wgh_Date_time).utcOffset("+05:30").format('HH:MM') : ''
            };
            var replaceString = htmlPol.toString();
            var regex;
            for (var key in replacedata) {
                if (replacedata.hasOwnProperty(key)) {
                    var val = replacedata[key];
                    regex = new RegExp(key, "g");
                    replaceString = replaceString.replace(regex, val);
                }
            }
            htmlPol = replaceString;
            //var request_html_file = fs.writeFileSync(html_pdf_file_path, htmlPol);
            let options = { format: 'A4',  width: '900px',  height : '2000px', zoomFactor : .5 };
            pdf.create(htmlPol).toStream(function(err, stream){
              stream.pipe(fs.createWriteStream(appRoot+ '/tmp/pdf/'+printData.Trip_No+'.pdf'));
              res.json({ status: 1, msg: printData.Trip_No+'.pdf' });
            });
        } else {
            res.json({ status: 0, msg: `no record found` });
        }
        }
    });
  } catch (ex) {
    res.json({ status: 100, msg: ex.stack });
  }
});
app.post('/history/report', (req, res)=>{
  try{
      const reqObject = req.body;
      let fromDate = req.body.fromDate;
      let toDate = req.body.toDate;
      let status = req.body.status;
      let findQuery="";
      if(status == "completed")
      {
        findQuery =  ` where   Gate_In_Date_time >= Date('${fromDate}') AND Gate_In_Date_time <= Date('${toDate}')  AND Status = 'completed'`;
      }
      else if(status == "close")
      {
        findQuery =  ` where   Gate_In_Date_time >= Date('${fromDate}') AND Gate_In_Date_time <= Date('${toDate}')  AND Status = 'close'`;
      }
      else if(status == "In plant")
      {
        findQuery =  ` where   Gate_In_Date_time >= Date('${fromDate}') AND Gate_In_Date_time <= Date('${toDate}')  AND Status = 'In plant'`;
      }
      else if(status == 'In transit')
      {
        findQuery =  ` where   Gate_In_Date_time >= Date('${fromDate}') AND Gate_In_Date_time <= Date('${toDate}')  AND Status = 'In transit'`;
      }
      else 
      {
        findQuery =  ` where   Gate_In_Date_time >= Date('${fromDate}') AND Gate_In_Date_time <= Date('${toDate}')  AND (Status = 'close' or Status = 'completed' or Status = 'In plant' or Status = 'In transit')`;
      }
        let sql = `SELECT * FROM ${tableName}${findQuery}`;
        console.log(sql);
        let query = db.query(sql, (err, row) => {
            if (err) {
            res.json({ status: 0, msg: err });
            } else {
            if (row && row.length && row.length > 0) {
                res.json({ status: 1, msg: row});
            } else {
                res.json({ status: 0, msg: `No trip available` });
            }
            }
        });
}catch (ex) {
    res.json({ status: 100, msg: ex.stack });
  }
});
app.post('/history/getData', (req, res)=>{
  try{
        let sql = `SELECT * FROM ${tableName}`;
        console.log(sql);
        let query = db.query(sql, (err, row) => {
            if (err) {
            res.json({ status: 0, msg: err });
            } else {
            if (row && row.length && row.length > 0) {
                res.json({ status: 1, msg: row});
            } else {
                res.json({ status: 0, msg: `No trip available` });
            }
            }
        });
}catch (ex) {
    res.json({ status: 100, msg: ex.stack });
  }
});
app.get('/history/getFile/:Trip_No?', (req, res)=>{
  try{
      //if(req.params && req.params.VehicleNo){
          let Trip_No = req.params.Trip_No ? req.params.Trip_No : '';
          var ftpClient = require('ftp-client');
          var config_ftp = {
            host: 'ftpupload.net', // required
            user: 'epiz_31541721', // Optional. Use empty username for anonymous access.
            password: 'uMmiauoQDy', // Required if username is not empty, except when requiresPassword: false
            port: 21
          };
          var options_ftp = {
              logging: 'basic'
          };
          var client_ftp = new ftpClient(config_ftp, options_ftp);
          console.log('-------------------------------');
          console.log(Trip_No);
          client_ftp.connect(function () {
            client_ftp.download('/htdocs', appRoot + "/tmp/ftp/", {overwrite: 'all'}, function (result) {
                console.log(JSON.stringifyresult);
            });
        
        });
        //http://localhost:5000/Image/tmp/vehicles/6J61T5vbNczt6iNzfTntsQsk.png
        res.json({ status: 1, msg:"Success" });
  }catch (ex) {
      res.json({ status: 100, msg: ex.stack });
    }
});

    //code end here

};

