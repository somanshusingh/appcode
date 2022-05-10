const path = require("path");
const moment = require("moment");
const appRoot = path.dirname(require.main.filename);
const multer = require("multer");
const fs = require("fs");

// get SQL DB driver connection
const db = require("../models/db");
const tableName = "vehicles";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, appRoot + "/tmp/vehicles/");
  },
  filename: function (req, recieved_file, cb) {
    const originalname = recieved_file.originalname;
    const extension = originalname.split(".");
    filename = originalname + "." + extension[extension.length - 1];
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart({ uploadDir: "./tmp/vehicles" });

module.exports.controller = function (app) {
  app.post(
    "/vehicle/upload_document",
    multipartMiddleware,
    (req, res, next) => {
      try {
        const reqObject = req.body;
        let file = req.files["null"];
        if (file && file.hasOwnProperty('originalFilename')){
          let tempFile = [];
          tempFile.push(file);
          file = tempFile;
        }
        if (file.length > 0) {
          const upload_document = {
            Doc1_Name: "",
            Doc1_Type: "",
            Doc1_Data: "",
            Doc2_Name: "",
            Doc2_Type: "",
            Doc2_Data: "",
          };
          for (let i in file) {
            if (file[i].hasOwnProperty("originalFilename")) {
              let fileName = file[i]["originalFilename"].toLowerCase();
              if (fileName.split(".").indexOf("rc") > -1) {
                upload_document["Doc1_Name"] = fileName;
                upload_document["Doc1_Type"] = file[i].type;
                upload_document["Doc1_Data"] = encodeURI(
                  "/Image/" + file[i].path
                );
              }
              if (fileName.split(".").indexOf("puc") > -1) {
                upload_document["Doc2_Name"] = fileName;
                upload_document["Doc2_Type"] = file[i].type;
                upload_document["Doc2_Data"] = encodeURI(
                  "/Image/" + file[i].path
                );
              }
            }
          }
          if (
            upload_document["Doc1_Data"] !== "" ||
            upload_document["Doc2_Data"] !== ""
          ) {
            let sql = `UPDATE ${tableName} SET Document = '${JSON.stringify(
              upload_document
            )}' WHERE VehicleNo = '${reqObject.VehicleNo}'`;
            let query = db.query(sql, (err, row) => {
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
            res.json({ status: 0, msg: "Please upload a file." });
          }
        } else {
          res.json({ status: 0, msg: "Please upload a file." });
        }
      } catch (ex) {
        res.json({ status: 100, msg: ex.stack });
      }
    }
  );

  app.post("/vehicle/registration", (req, res) => {
    try {
      let sql = `CREATE TABLE ${tableName}(VehicleNo VARCHAR(15) NOT NULL, Make VARCHAR(25), Model VARCHAR(25),Insurance_exp_date DATE, PUC_exp_date DATE, VehicleType VARCHAR(25), Status VARCHAR(10), Source VARCHAR(10), Created_By VARCHAR(50), Created_On DATE, Modified_By VARCHAR(50), Modified_On DATE, Document json, PRIMARY KEY(VehicleNo))`;
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
            Status: "Active",
            Source: reqObject.Source ? reqObject.Source : "InBound",
            Created_By: reqObject.Created_By ? reqObject.Created_By : "",
            Created_On: reqObject.Created_On
              ? reqObject.Created_On
              : moment().format("YYYY-MM-DD hh:mm:ss"),
            Modified_By: reqObject.Created_By ? reqObject.Created_By : "",
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

  app.get("/vehicle/view/:VehicleNo?", (req, res) => {
    try {
      //if(req.params && req.params.VehicleNo){
      const VehicleNo = req.params.VehicleNo ? req.params.VehicleNo : "";
      let findQuery = ` where VehicleNo = "${VehicleNo}"`;
      if (VehicleNo === "") {
        findQuery = "";
      }
      let sql = `SELECT * FROM ${tableName}${findQuery}`;
      let query = db.query(sql, (err, row) => {
        if (err) {
          res.json({ status: 0, msg: err });
        } else {
          if (row && row.length && row.length > 0) {
            for (let k in row) {
              if (row[k].hasOwnProperty("Document")) {
                row[k]["Document"] = JSON.parse(row[k]["Document"]);
              }
            }
            res.json({ status: 1, msg: row });
          } else {
            if (VehicleNo === "") {
              res.json({ status: 0, msg: `vehicle not exist` });
            } else {
              res.json({
                status: 0,
                msg: `vehicle no: ${VehicleNo} does not exist`,
              });
            }
          }
        }
      });
    } catch (ex) {
      res.json({ status: 100, msg: ex.stack });
    }
  });

  app.post("/vehicle/data/update", (req, res) => {
    try {
      const reqObject = req.body;
      let VehicleNo = reqObject.VehicleNo;
      let current_date = moment().format("YYYY-MM-DD hh:mm:ss");
      let updateQuery = `Modified_On = '${current_date}', Modified_By='${reqObject.Modified_By}',`;
      for (const k in reqObject) {
        if (k !== "Modified_On" || k !== "Modified_By") {
          updateQuery += `${k} = '${reqObject[k]}',`;
        }
      }
      updateQuery = updateQuery.substring(0, updateQuery.length - 1);
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
