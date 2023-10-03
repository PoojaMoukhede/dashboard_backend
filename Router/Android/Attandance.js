const express = require("express");
const router = express.Router();
const Attandance = require("../../Model/Android/Attandance")
const jwt = require('jsonwebtoken')
const secret = "SECRET"
const User = require("../../Model/Android/User")

// Both checked
router.get('/attandance', async (req, res) => {  
  console.log("hello attandance")
    try {
      const attendanceRecords = await Attandance.find();
  
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


router.post('/attandance', async (req, res) => { 
  console.log("hello attandance post call")

  try {
//     const decoded = jwt.verify(req.headers.token, secret);
//     console.log(decoded)
//     const userId = decoded.User; // Assuming JWT  contains Emp_ID
//  console.log(`userId ------ ${userId}`)
const userId = req.body.userId;
    // Find the user by Emp_ID to ensure it exists
    const user = await User.findOne({ _id: userId });
    console.log(`user ------ ${user}`)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let attendance = await Attandance.findOne({ userRef: user._id });

    if (attendance) {
      // If attendance record exists, update it
      attendance.Employee_attandance.push(req.body);
      await attendance.save();
    } else {
      attendance = new Attandance({
        Employee_attandance: [req.body],
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


router.get("/attandance/:Emp_ID", async (req, res) => {
  console.log("hello attandance get ID call")

  try {
    const userId = req.params.Emp_ID; // employee ID - 1477
    console.log(userId)
    const user = await User.findOne({ Emp_ID: userId });
    console.log(user)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const attendance = await Attandance.findOne({ userRef: user._id });
    console.log(`Employee attandance : ${attendance}`)

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