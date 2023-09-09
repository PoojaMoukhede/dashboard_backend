const express = require("express");
const router = express.Router();
const Complaint = require("../../Model/Android/Complaint")
const jwt = require("jsonwebtoken")
const secret ="SECRET"

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Both Checked
router.get('/getcomplaint', async (req, res) => {  
    // try {
    //     const results = await Complaint.find();
    //     res.json(results);
    // } catch (e) {
    //     res.status(400).json({ message: e.message });
    //     console.log(e);
    // }
    if (req.headers.token !== null) {
        jwt.verify(req.headers.token, secret, (err, user) => {
          if (err) console.log(err.message);
          else req.user = user.data;
        });
        try {
          const data = await Complaint.find({ userRef: req.user });
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

router.post('/complaint', async (req, res) => { 
    // try {
    //     const complaint = await Complaint.create({
    //         ...req.body
    //     });
    //     res.status(201).json(complaint);
    // } catch (e) {
    //     res.status(400).json({ message: e.message });
    // }
    jwt.verify(req.headers.token, secret, (err, user) => {
        if (err) console.log(err.message);
        req.user = user.results;
      });
      try {
        let results = await Complaint.find({ userRef: req.user }); // Use let here
        if (results.length > 1) {
            results = await Complaint.updateOne(
              { userRef: req.user },
              {
                $push: {
                  Message: req.body,
                },
              }
            );
          } else {
            results = await Complaint.create({
              Message: req.body,
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