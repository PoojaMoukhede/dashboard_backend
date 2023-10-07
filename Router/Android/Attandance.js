const express = require("express");
const router = express.Router();
const Attandance = require("../../Model/Android/Attandance")
const jwt = require('jsonwebtoken')
const secret = "SECRET"
const User = require("../../Model/Android/User")
const mongoose = require("mongoose")

// Both checked
// router.get('/attandance', async (req, res) => {  
//   console.log("hello attandance")
//     try {
//       const attendanceRecords = await Attandance.find();
  
//       if (!attendanceRecords) {
//         return res.status(404).json({ message: "No attendance records found" });
//       }
  
//       res.status(200).json({
//         status: "Success",
//         message: attendanceRecords,
//       });
//     } catch (e) {
//       res.status(500).json({ message: e.message });
//       console.log(e);
//     }
   
// })



// get according to date

const moment = require('moment-timezone');

router.get('/attendance', async (req, res) => {  
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






// router.get('/attendance', async (req, res) => {  
//   console.log("hello attendance")
//   try {
//     const today = moment().tz('Asia/Kolkata').startOf('day');
//     const todayUtc = today.clone().utc();
//     console.log(todayUtc.toDate());
    
//     const attendanceRecords = await Attandance.find({ Employee_attandance:  todayUtc.toDate()
//     });
  
//     if (!attendanceRecords || attendanceRecords.length === 0) {
//       return res.status(404).json({ message: "No attendance records found for today" });
//     }
  
//     res.status(200).json({
//       status: "Success",
//       message: attendanceRecords,
//     });
//   } catch (e) {
//     res.status(500).json({ message: e.message });
//     console.log(e);
//   }
// })



router.post('/attendance', async (req, res) => { 
  console.log("hello attendance post call")

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
        userRef: user._id, 
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
// try {
//   const userId = req.body.userId;
//   const newStatus = req.body.newStatus; 

//   const user = await User.findOne({ _id: userId });
//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }
//   let attendance = await Attandance.findOne({ userRef: user._id });

//   if (!attendance) {
//     attendance = new Attandance({
//       Employee_attandance: [],
//       userRef: user._id,
//     });
//   }

//   const employeeAttendance = attendance.Employee_attandance.find(
//     (attendance) => attendance.Emp_status === "On-site" 
//   );

//   if (!employeeAttendance) {
//     return res.status(404).json({ message: "Employee attendance record not found"});
//   }

//   employeeAttendance.Emp_status = newStatus;

//   await attendance.save();

//   res.status(200).json({
//     status: "Success",
//     message: "Attendance updated successfully",
//   });
// } catch (e) {
//   res.status(400).json({ message: e.message });
//   console.error(e);
// }
});


router.get("/attandance/:id", async (req, res) => {
  console.log("hello attandance get ID call")

  try {
    const userId = req.params.id; //mongo
    console.log(userId)
   
    const user = await User.findOne({ _id: userId });
    console.log(`user : ${user}`)

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


router.put('/attendance/:id', async (req, res) => {
  try {
    const userId = req.params.id; // User's _id from the route parameter
    console.log(userId);
   
    const user = await User.findOne({ _id: userId });
    console.log(`user : ${user}`);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedStatus = req.body.Emp_status;

    const attendance = await Attandance.findOneAndUpdate(
      { userRef: userId },
      { Emp_status: updatedStatus },
      { new: true } 
    );

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance not found' });
    }

    res.status(200).json({ result: attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports= router