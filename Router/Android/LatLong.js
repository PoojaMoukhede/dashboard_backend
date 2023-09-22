const express = require("express");
const router = express.Router();
const LatLong = require("../../Model/Android/LatLong")
const jwt = require('jsonwebtoken')
const secret = "SECRET"
const User = require("../../Model/Android/User")

// Both checked
router.get('/latLong', async (req, res) => {  
  console.log("hello LatLong")
    try {
      const attendanceRecords = await LatLong.find();
  
      if (!attendanceRecords) {
        return res.status(404).json({ message: "No attendance records found" });
      }
  
      res.status(200).json({
        status: "Success",
        message: attendanceRecords,
      });
    } catch (e) {
      res.status(500).json({ message: e.message });
      console.log(e);
    }
   
})


router.post('/latLong', async (req, res) => { 
  console.log("hello LatLong post call")

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
    let attendance = await LatLong.findOne({ userRef: user._id });

    if (attendance) {
      // If attendance record exists, update it
      attendance.Details_location.push(req.body);
      await attendance.save();
    } else {
      attendance = new LatLong({
        Details_location: [req.body],
        userRef: user._id, // Ensure that user._id is correctly assigned
      });
      await attendance.save();
    }

    res.status(200).json({
      status: "Success",
      message: "Attendance added successfully",
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});


router.get("/latLong/:Emp_ID", async (req, res) => {
  console.log("hello LatLong get ID call")

  try {
    const userId = req.params.Emp_ID;
    const user = await User.findOne({ Emp_ID: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const attendance = await LatLong.findOne({ userRef: user._id });

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.status(200).json({
      status: "Success",
      message: attendance,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});


module.exports= router