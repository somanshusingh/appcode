const path = require("path");
const moment = require("moment");
const appRoot = path.dirname(require.main.filename);

// get SQL DB driver connection
const db = require("../models/db");
const tableName = 'users';

module.exports.controller = function (app) {
  
  //validation start here

  let validateSignIn = (req, res, next)=>{
    try{
      if (req.url && req.url.includes('signin')){
        const reqObject = req.body;
        if (reqObject.hasOwnProperty('UserId') && reqObject.hasOwnProperty('Password')){
          if (reqObject.UserId){
            // if((reqObject.UserId).length < 3 || (reqObject.UserId).length > 10){
            //   res.json({ status: 0, msg: "UserId min 3 character and max 10 character"});
            // }else{
              if (reqObject.Password){
                // if((reqObject.Password).length < 5 || (reqObject.Password).length > 50){
                //     res.json({ status: 0, msg: "Password min 5 character and max 50 character"});
                //   }else{
                    return next();
                  // }
                } else{
                  res.json({ status: 0, msg: "Password value is null/undefined/blank"});
                }
            // }
          } else{
            res.json({ status: 0, msg: "UserId value is null/undefined/blank"});
          }
        } else{
          res.json({ status: 0, msg: "in request UserId/Password missing"});
        }
      } else{
        res.json({ status: 0, msg: {  error: 'Invalid request', url: req.url, req : req.body } });
      }
    } catch(ex) {
      res.json({ status: 100, msg: ex.stack });
    }
  }

  let validateUpdate = (req, res, next)=>{
      try{
        if (req.url && req.url.includes('update')){
          const reqObject = req.body;
          if (reqObject.hasOwnProperty('UserId') && reqObject.hasOwnProperty('Password') && reqObject.hasOwnProperty('Modified_By')){
            if (reqObject.UserId){
              if((reqObject.UserId).length < 3 || (reqObject.UserId).length > 10){
                res.json({ status: 0, msg: "UserId min 3 character and max 10 character"});
              }else{
                if (reqObject.Password){
                  if((reqObject.Password).length < 5 || (reqObject.Password).length > 50){
                      res.json({ status: 0, msg: "Password min 5 character and max 50 character"});
                    }else{
                      return next();
                    }
                  } else{
                    res.json({ status: 0, msg: "Password value is null/undefined/blank"});
                  }
              }
            } else{
              res.json({ status: 0, msg: "UserId value is null/undefined/blank"});
            }
          } else{
            res.json({ status: 0, msg: "in request UserId/Password/Modified_By missing"});
          }
        } else{
          res.json({ status: 0, msg: {  error: 'Invalid request', url: req.url, req : req.body } });
        }
      } catch(ex) {
        res.json({ status: 100, msg: ex.stack });
      }
    }

  //validation end here

  app.post("/registration/user", (req, res) => {
    try {
      let sql =
        `CREATE TABLE ${tableName}(UserId VARCHAR(50) NOT NULL, Password VARCHAR(25) NOT NULL, FirstName VARCHAR(50), LastName VARCHAR(50),Mobile BIGINT, Email VARCHAR(50),Address VARCHAR(150),Role VARCHAR(10), Status VARCHAR(10), Created_By VARCHAR(50),Created_On DATE,Modified_By VARCHAR(50),Modified_On DATE, Allowed_Menu json, PRIMARY KEY(UserId))`;
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
            UserId: reqObject.Email,
            Password: reqObject.Password,
            FirstName: reqObject.FirstName,
            LastName: reqObject.LastName,
            Mobile: reqObject.Mobile,
            Email: reqObject.Email,
            Address: reqObject.Address,
            Role: reqObject.Role ? reqObject.Role: "Admin",
            Status: "Active",
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
            Allowed_Menu: ((typeof reqObject.Allowed_Menu === "object") && reqObject.Allowed_Menu) ? JSON.stringify(reqObject.Allowed_Menu) : JSON.stringify({})
          };
          let sql = `INSERT INTO ${tableName} SET ?`;
          let query = db.query(sql, post, (err) => {
            if (err) {
              if (err && err.code && err.code === "ER_DUP_ENTRY") {
                res.json({
                  status: 0,
                  msg: `user ${reqObject.Email} already exist`,
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

  app.post("/registration/signin", validateSignIn, (req, res) => {
    try {
      const reqObject = req.body;
      let sql = `SELECT * FROM ${tableName} where  Status = "Active" AND UserId = "${reqObject.UserId}" AND Password = "${reqObject.Password}"`;
      let query = db.query(sql, (err, row) => {
        if (err) {
          res.json({ status: 0, msg: err });
        } else {
          if (row && row.length && row.length > 0) {
            let userResponse = {
              UserId : row[0].UserId,
              Role : row[0].Role,
              Name : row[0].FirstName +` `+row[0].LastName,
              Allowed_Menu : (row[0].Allowed_Menu) ? JSON.parse(row[0].Allowed_Menu) : {}
            }
            req.session.UserId =  userResponse.UserId;
            req.session.Role =  userResponse.Role;
            req.session.Name =  userResponse.Name;
            res.json({ status: 1, msg: userResponse });
          } else {
            res.json({ status: 0, msg: "UserID/Password not exist/active" });
          }
        }
      });
    } catch (ex) {
      res.json({ status: 100, msg: ex.stack });
    }
  });

  app.post("/registration/update", validateUpdate, (req, res) => {
    try {
      const reqObject = req.body;
      let newPassword = reqObject.Password;
      let current_date = moment().format("YYYY-MM-DD hh:mm:ss");
      let sql = `UPDATE ${tableName} SET Password = '${newPassword}',Modified_By = '${reqObject.Modified_By}',Modified_On = '${current_date}'  WHERE UserId = '${reqObject.UserId}'`;
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

  app.post("/registration/pwd/update", validateUpdate, (req, res) => {
    try {
      const reqObject = req.body;
      let newPassword = reqObject.Password;
      let current_date = moment().format("YYYY-MM-DD hh:mm:ss");
      let sql = `UPDATE ${tableName} SET Password = '${newPassword}',Modified_By = '${reqObject.Modified_By}',Modified_On = '${current_date}'  WHERE UserId = '${reqObject.UserId}'`;
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

  app.post("/registration/data/update", (req, res) => {
    try {
      const reqObject = req.body;
      let UserId = reqObject.UserId;
      let current_date = moment().format("YYYY-MM-DD hh:mm:ss");
      let updateQuery = `Modified_On = '${current_date}', Modified_By='${reqObject.Modified_By}',`;
      for (const k in reqObject){
        if (k === "Allowed_Menu"){
          updateQuery += `${k} = '${JSON.stringify(reqObject[k])}',`
        } else{   
          if (k !== "Modified_On" || k !== "Modified_By" || k !== "Allowed_Menu"){
            updateQuery += `${k} = '${reqObject[k]}',`
          }
        }
      }
      updateQuery = updateQuery.substring(0, updateQuery.length - 1);
      let sql = `UPDATE ${tableName} SET ${updateQuery} WHERE UserId = '${UserId}'`;
      let query = db.query(sql, (err, row) => {
        if (err) {
          res.json({ status: 0, msg: err });
        } else {
          if (row && row.affectedRows && row.affectedRows > 0) {
            res.json({ status: 1, msg: "User date updated" });
          } else {
            res.json({ status: 0, msg: "User data not updated" });
          }
        }
      });
    } catch (ex) {
      res.json({ status: 100, msg: ex.stack });
    }
  });
  
  app.get('/registration/user/view/:UserID?', (req, res)=>{
      try{
          //if(req.params && req.params.VehicleNo){
              const UserID = req.params.UserID ? req.params.UserID : '';
              let findQuery = ` where UserID = "${UserID}"`;
              if (UserID === ''){
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
                    if (UserID === ''){
                      res.json({ status: 0, msg: `User not exist` });
                    } else {
                      res.json({ status: 0, msg: `UserID ${UserID} not exist` });
                    }
                  }
                  }
              });
      }catch (ex) {
          res.json({ status: 100, msg: ex.stack });
        }
  });


  //code end here
  

};
