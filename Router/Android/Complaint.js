const express = require("express");
const router = express.Router();
const Complaint = require("../../Model/Android/Complaint")
const jwt = require("jsonwebtoken")
const secret ="SECRET"
const User = require("../../Model/Android/User")
const Notification = require('../../Model/Web/Notification')

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Both Checked
router.get('/complaint', async (req, res) => {  
  console.log("hello Complaint get call")
    try {
      const formRecord = await Complaint.find()
      // .populate('userRef');
  
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


// router.delete("/complaint/:Emp_ID/:complaint_id", async (req, res) => {
//   console.log("Hello Complaint Delete Emp_ID call");

//   try {
//     const userId = req.params.Emp_ID;
//     const user = await User.findOne({ _id: userId });
//     console.log(userId)
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const complaintIdToDelete = req.params.complaint_id;
//     const complaint = await Complaint.findOne({ userRef: user._id });
//     console.log(`complaint: ${complaint}`)

//     if (!complaint) {
//       return res.status(404).json({ message: "Complaint record not found" });
//     }


//     const messageIndexToDelete = complaint.Message.findIndex(
//       (message) => message._id === complaintIdToDelete
//     );

//     // If the message is found, remove it from the array
//     if (messageIndexToDelete !== -1) {
//       complaint.Message.splice(messageIndexToDelete, 1);
//       await complaint.save();
//       return res.status(200).json({ message: "Complaint has been deleted" });
//     } else {
//       return res.status(404).json({ message: "Complaint not found" });
//     }
//   } catch (e) {
//     res.status(400).json({ message: e.message });
//     console.error(e);
//   }
// });


// router.delete("/complaint/:id", async (req, res) => {
//     const complaint = await Complaint.findOneAndDelete({ _id: req.params.id });
//     res.send("complaint has been Deleted");
// });


router.delete("/complaint/:complaint_id/message/:message_id", async (req, res) => {
  console.log("Hello Message Delete call");

  try {
    const complaintIdToDelete = req.params.complaint_id;
    const messageToDeleteId = req.params.message_id;
    console.log(`complaintIdToDelete : ${complaintIdToDelete}`);
    console.log(`messageToDeleteId : ${messageToDeleteId}`);

    const complaint = await Complaint.findOne({ _id: complaintIdToDelete });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Use $pull to remove the message from the array
    await Complaint.updateOne(
      { _id: complaintIdToDelete },
      { $pull: { Message: { _id: messageToDeleteId } } }
    );

    return res.status(200).json({ message: "Message has been deleted" });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.error(e);
  }
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
    const newNotification = new Notification({
      userId: user._id, 
      message: `${user.Emp_name} file a complaint.`,
    });
    
    // Save the notification to the database
    await newNotification.save();


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