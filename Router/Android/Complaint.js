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
  console.log("hello Complaint get call")
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
// router.put("/complaint/:id", async (req, res) => {
//   try {
    
//     const complaint = await Complaint.findOneAndUpdate({ _id: req.params.id }, {status:"Resolved"});
//     if (!complaint) {
//       return res.status(404).json({ error: 'Complaint not found'});
//     }

//     res.status(200).json({result: complaint});
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
router.delete("/complaint/:id", async (req, res) => {
    const complaint = await Complaint.findOneAndDelete({ _id: req.params.id });
    res.send("complaint has been Deleted");
});

router.post('/complaint', async (req, res) => { 
  console.log("hello Complaint post call")

  try {
const userId = req.body.userId;
    const user = await User.findOne({ _id: userId });
    console.log(`user ------ ${user}`)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let complaint = await Complaint.findOne({ userRef: user._id }).populate('userRef', 'name');

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