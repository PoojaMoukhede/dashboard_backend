const express = require("express");
const router = express.Router();
const multer = require("multer"); 
const Clearance = require("../../Model/Android/ClearanceForm"); 
const jwt = require("jsonwebtoken")
const secret ="SECRET"
const User = require("../../Model/Android/User")

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Both Checked
// GET all clearances
router.get("/form", async (req, res) => {

  // if (req.headers.token !== null) {
  //       jwt.verify(req.headers.token, secret, (err, user) => {
  //         if (err) console.log(err.message);
  //         else req.user = user.data;
  //       });
  //       try {
  //         const data = await Clearance.find({ userRef: req.user });
  //         res.status(200).json({
  //           status: "Sucess",
  //           message: data,
  //         });
  //       } catch (error) {
  //         res.status(500).json({
  //           status: "Failed",
  //           message: error.message,
  //         });
  //       }
  //     } else {
  //       res.status(500).json({
  //         status: "Failed",
  //         message: "Please Refresh the Page",
  //       });
  //     }
  console.log("hello clearance get call")

  try {
    const formRecord = await Clearance.find();

    if (!formRecord) {
      return res.status(404).json({ message: "No Record records found" });
    }

    res.status(200).json({
      status: "Success",
      message: formRecord,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
    console.log(e);
  }
});

// POST a new clearance
router.post("/form", upload.single("image"), async (req, res) => {
  console.log("hello attandance post call")
  try {
//     const decoded = jwt.verify(req.headers.token, secret);
//     console.log(decoded)
//     const userId = decoded.User; // Assuming JWT  contains Emp_ID
//  console.log(`userId ------ ${userId}`)
    // Find the user by Emp_ID to ensure it exists
    const userId = req.body.userId;
    const user = await User.findOne({ _id: userId });
    console.log(`user ------ ${user}`)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let clearance_data = await Clearance.findOne({ userRef: user._id });

    if (clearance_data) {
      // If clearance_data record exists, update it
      clearance_data.FormData.push(req.body);
      await clearance_data.save();
    } else {
      clearance_data = new Clearance({
        FormData: [req.body],
        userRef: user._id, // Ensure that user._id is correctly assigned
      });
      await clearance_data.save();
    }

    res.status(200).json({
      status: "Success",
      message: "Clearance form added successfully",
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});


router.get("/form/:Emp_ID", async (req, res) => {
  console.log("hello attandance get ID call")

  try {
    const userId = req.params.Emp_ID;
    const user = await User.findOne({ Emp_ID: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const Record = await Clearance.findOne({ userRef: user._id });

    if (!Record) {
      return res.status(404).json({ message: "Record record not found" });
    }

    res.status(200).json({
      status: "Success",
      message: Record,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});


module.exports = router;