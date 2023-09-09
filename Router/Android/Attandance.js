const express = require("express");
const router = express.Router();
const Attandance = require("../../Model/Android/Attandance")
const jwt = require('jsonwebtoken')
const secret = "SECRET"


// Both checked
router.get('/getAttandance', async (req, res) => {  
    if (req.headers.token !== null) {
        jwt.verify(req.headers.token, secret, (err, user) => {
          if (err) console.log(err.message);
          else req.user = user.data;
        });
        try {
          const data = await Attandance.find({ userRef: req.user });
          res.status(200).json({
            status: "Sucess",
            message: data,
          });
        } catch (error) {
          res.status(500).json({
            status: "Failed",
            message: error.message,
          });
        }
      } else {
        res.status(500).json({
          status: "Failed",
          message: "Please Refresh the Page",
        });
      }
   
})



router.post('/addAttandance', async (req, res) => { 
  jwt.verify(req.headers.token, secret, (err, user) => {
      if (err) console.log(err.message);
      req.user = user.results;
    });
    try {
      let results = await Attandance.find({ userRef: req.user }); // Use let here
      if (results.length > 1) {
          results = await Attandance.updateOne(
            { userRef: req.user },
            {
              $push: {
                Employee_attandance: req.body,
              },
            }
          );
        } else {
          results = await Attandance.create({
            Employee_attandance: req.body,
            userRef: req.user,
          });
        }
        res.status(200).json({
          status: "Success",
          message: results,
        });
  } catch (e) {
      res.status(400).json({ message: e.message });
      console.log(e);
  }
});


module.exports= router