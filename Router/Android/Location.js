const express = require("express");
const router = express.Router();
const Location = require("../../Model/Android/Location")
const jwt = require("jsonwebtoken")
const secret ="SECRET"
// import zipy from 'zipyai';
const zipy = require("zipyai")

zipy.init('b568edaa');


router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// Both Checked
router.get('/getlocation', async (req, res) => {  
    if (req.headers.token !== null) {
        jwt.verify(req.headers.token, secret, (err, user) => {
          if (err) console.log(err.message);
          else req.user = user.data;
        });
        try {
          const data = await Location.find({ userRef: req.user });
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

router.post('/location', async (req, res) => { 
    jwt.verify(req.headers.token, secret, (err, user) => {
        if (err) console.log(err.message);
        req.user = user.results;
      });
      try {
        let results = await Location.find({ userRef: req.user }); 
        if (results.length > 1) {
            results = await Location.updateOne(
              { userRef: req.user },
              {
                $push: {
                    Location_info: req.body,
                },
              }
            );
          } else {
            results = await Location.create({
                Location_info: req.body,
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