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


// router.delete("/complaint/:id", async (req, res) => {
//   const messageIdToDelete = req.params.id;
//   const messageIndexToDelete = -1; // Initialize with -1 as a flag if not found
//   //  const msgID = message._id
//    console.log(`messageIdToDelete : ${messageIdToDelete}`)
//   // Find the complaint by userRef
//   const complaint = await Complaint.findOne({ _id: req.params.id });
//   console.log(`complaint : ${complaint}`)

//   // Find the index of the message with the specified _id
//   if (complaint) {
//     messageIndexToDelete = complaint.Message.message.findIndex(
//       (message) => message._id === messageIdToDelete
//     );
//   }

//   // If the message is found, remove it from the array
//   if (messageIndexToDelete !== -1) {
//     complaint.Message.message.splice(messageIndexToDelete, 1);
//     await complaint.save();
//     res.send("Complaint has been deleted");
//   } else {
//     res.status(404).send("Complaint not found");
//   }
// });



// router.delete("/complaint/:id", async (req, res) => {
//     const complaint = await Complaint.findOneAndDelete({ _id: req.params.id });
//     res.send("complaint has been Deleted");
// });

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