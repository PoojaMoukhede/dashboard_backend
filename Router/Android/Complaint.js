const express = require("express");
const router = express.Router();
const Complaint = require("../../Model/Android/Complaint")
const jwt = require("jsonwebtoken")
const secret ="SECRET"
const User = require("../../Model/Android/User")

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Both Checked
router.get('/complaint', async (req, res) => {  
  console.log("hello Complaint post call")

    // if (req.headers.token !== null) {
    //     jwt.verify(req.headers.token, secret, (err, user) => {
    //       if (err) console.log(err.message);
    //       else req.user = user.data;
    //     });
    //     try {
    //       const data = await Complaint.find({ userRef: req.user });
    //       res.status(200).json({
    //         status: "Sucess",
    //         message: data,
    //       });
    //     } catch (error) {
    //       res.status(500).json({
    //         status: "Failed",
    //         message: error.message,
    //       });
    //     }
    //   } else {
    //     res.status(500).json({
    //       status: "Failed",
    //       message: "Please Refresh the Page",
    //     });
    //   }

    try {
      const formRecord = await Complaint.find();
  
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
   
}) 


router.get("/complaint/:Emp_ID", async (req, res) => {
  console.log("hello Complaint get Emp_ID call")

  try {
    const userId = req.params.Emp_ID;
    const user = await User.findOne({ Emp_ID: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const complaint = await Complaint.findOne({ userRef: user._id });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint record not found" });
    }
    res.status(200).json({
      status: "Success",
      message: complaint,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});

// router.post('/complaint', async (req, res) => { 
//   try {
//     const decoded = jwt.verify(req.headers.token, secret);
//     const userId = decoded.Emp_ID; 

//     const user = await User.findOne({ Emp_ID: userId });
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
  console.log("hello Complaint post call")

  try {
//     const decoded = jwt.verify(req.headers.token, secret);
//     console.log(decoded)
//     const userId = decoded.User; 
//  console.log(`userId ------ ${userId}`)
const userId = req.body.userId;
  
    const user = await User.findOne({ _id: userId });
    console.log(`user ------ ${user}`)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let complaint = await Complaint.findOne({ userRef: user._id });

    if (complaint) {
      complaint.Message.push(req.body);
      await complaint.save();
    } else {
      complaint = new Complaint({
        Message: [req.body],
        userRef: user._id,
      });
      await complaint.save();
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