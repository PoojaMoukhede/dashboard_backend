const express = require("express");
const router = express.Router();
const multer = require("multer"); 
const Clearance = require("../../Model/Android/ClearanceForm"); 
const jwt = require("jsonwebtoken")
const secret ="SECRET"

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Both Checked
// GET all clearances
router.get("/form", async (req, res) => {

  if (req.headers.token !== null) {
        jwt.verify(req.headers.token, secret, (err, user) => {
          if (err) console.log(err.message);
          else req.user = user.data;
        });
        try {
          const data = await Clearance.find({ userRef: req.user });
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
});

// POST a new clearance
router.post("/apply", upload.single("image"), async (req, res) => {
  // try {
  //   const { Transport_type, Total_expense } = req.body;
  //   const newClearance = new Clearance({
  //     Transport_type,
  //     Total_expense,
  //     images: {
  //       data: req.file ? req.file.buffer : null,
  //       contentType: req.file ? req.file.mimetype : null, 
  //     },
  //   });

  //   const createdClearance = await newClearance.save();
  //   res.status(201).json(createdClearance);
  // } catch (err) {
  //   res.status(400).json({ message: err.message });
  // }
   jwt.verify(req.headers.token, secret, (err, user) => {
      if (err) console.log(err.message);
      req.user = user.results;
    });
    try {
      let results = await Clearance.find({ userRef: req.user }); // Use let here
      if (results.length > 1) {
          results = await Clearance.updateOne(
            { userRef: req.user },
            {
              $push: {
                FormData: req.body,
              },
            }
          );
        } else {
          results = await Clearance.create({
            FormData: req.body,
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

module.exports = router;