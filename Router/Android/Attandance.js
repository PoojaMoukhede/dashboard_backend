const express = require("express");
const router = express.Router();
const Attandance = require("../../Model/Android/Attandance")
const jwt = require('jsonwebtoken')
const secret = "SECRET"
const User = require("../../Model/Android/User")


// Both checked
router.get('/getAttandance', async (req, res) => {  
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

router.post('/addAttandance', async (req, res) => { 
  try {
    const decoded = jwt.verify(req.headers.token, secret);
    console.log(decoded)
    const empId = decoded.User; // Assuming JWT  contains Emp_ID
 console.log(`empID ------ ${empId}`)
    // Find the user by Emp_ID to ensure it exists
    const user = await User.findOne({ _id: empId });
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



router.get("/getAttandance/:Emp_ID", async (req, res) => {
  try {
    const empId = req.params.Emp_ID;
    const user = await User.findOne({ Emp_ID: empId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const attendance = await Attandance.findOne({ userRef: user._id });

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