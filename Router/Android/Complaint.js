const express = require("express");
const router = express.Router();
const Complaint = require("../../Model/Android/Complaint")
const jwt = require("jsonwebtoken")
const secret ="SECRET"
const User = require("../../Model/Android/User")

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Both Checked
router.get('/getcomplaint', async (req, res) => {  

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

// router.post('/complaint', async (req, res) => { 
//   try {
//     const decoded = jwt.verify(req.headers.token, secret);
//     const empId = decoded.Emp_ID; 

//     const user = await User.findOne({ Emp_ID: empId });
//         console.log(`user : ${user}`)
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     let complaint_user = await Complaint.findOne({ userRef: user._id });
//     console.log(`complaint_user : ${complaint_user}`)
 
//     if (complaint_user) {
  
//       complaint_user.Message.push(req.body);
//       await complaint_user.save();
//     } else {
//       complaint_user = new Complaint({
//         Message: [req.body],
//         userRef: user._id,
//       });
//       await complaint_user.save();
//     }

//     res.status(200).json({
//       status: "Success",
//       message: "complaint_user added successfully",
//     });
//   } catch (e) {
//     res.status(400).json({ message: e.message });
//     console.log(e);
//   }
//   });

router.post('/complaint', async (req, res) => { 
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
    let attendance = await Complaint.findOne({ userRef: user._id });

    if (attendance) {
      // If attendance record exists, update it
      attendance.Message.push(req.body);
      await attendance.save();
    } else {
      attendance = new Complaint({
        Message: [req.body],
        userRef: user._id, // Ensure that user._id is correctly assigned
      });
      await attendance.save();
    }

    res.status(200).json({
      status: "Success",
      message: "Complaint added successfully",
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});

   
module.exports= router