const express = require('express');
const router = express.Router();
//const dbo = require('../models/db');

router.post('/post_service', (req, res) => {
    res.send(req.body);
});
router.get('/get_service', (req, res) => {
    try{
        const testModel = require('../models/user');
        var obj_testModel  = new testModel({
            "username":"somanshu",
            "email":"somanshu@mail.com",
            "password":"test"            
        });
        obj_testModel.save( function (err, dbu) {
            try{
                if (err){
                    res.json(err)
                } else {
                    res.json(dbu)
                }
            }
            catch(ex){
                res.json(ex.stack)
            }
        });
    }
    catch(ex){
        res.json(ex.stack)
    }
});


module.exports = router;
