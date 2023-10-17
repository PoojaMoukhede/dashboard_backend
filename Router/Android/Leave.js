const express = require("express");
const router = express.Router();
const Leave = require("../../Model/Android/Leave");
const User = require("../../Model/Android/User");
const LeaveBalance = require("../../Model/Android/LeaveBalance")

router.post("/leave/:id", async (req, res) => {
    console.log("POST CALL LEAVE");
    try {
      const userId = req.params.id;
      const user = await User.findOne({ _id: userId });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const { startDate, endDate, status } = req.body;
  
      // Check if a leave request for the user already exists
      let leave = await Leave.findOne({ userRef: user._id });
  
      if (leave) {
        // Update the existing leave request
        leave.startDate = startDate;
        leave.endDate = endDate;
        leave.status = status;
        leave.numberOfDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  
        await leave.save();
      } else {
        // Create a new leave request
        const newLeaveRequest = new Leave({
          userRef: user._id,
          startDate,
          endDate,
          status: 'pending',
          numberOfDays: Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)),
        });
  
        await newLeaveRequest.save();
      }
  
      res.status(200).json({
        status: "Success",
        message: "Leave request created or updated",
      });
    } catch (e) {
      res.status(400).json({ message: e.message });
      console.error(e);
    }
});
  

// Admin approves or rejects leave requests (PUT request)
// router.put("/admin/leave/:id", async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;

//   try {
//     const updatedLeave = await Leave.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!updatedLeave) {
//       res.status(404).json({ error: "Leave request not found" });
//       return;
//     }

//     res.json(updatedLeave);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to update leave status" });
//   }
// });
router.put("/leave/:id", async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
  
    try {
      const updatedLeave = await Leave.findById(id);
  
      if (!updatedLeave) {
        return res.status(404).json({ error: "Leave request not found" });
      }
  
      const user = await User.findOne({ _id: updatedLeave.userRef });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const leave = await LeaveBalance.findOne({ userRef: user._id }); // Find the LeaveBalance for the user
  
      if (!leave) {
        return res.status(404).json({ error: "Leave balance not found" });
      }
  
      if (status === "approved") {
        // Check if user has sufficient available leave days
        if (updatedLeave.numberOfDays > leave.availableLeave) {
          return res.status(400).json({ error: "User has insufficient available leaves" });
        }
  
        leave.availableLeave -= updatedLeave.numberOfDays; // Deduct leave days from LeaveBalance
      }
  
      updatedLeave.status = status;
      await Promise.all([updatedLeave.save(), leave.save()]); // Save both updatedLeave and LeaveBalance
  
      res.json(updatedLeave);
    } catch (error) {
      console.error(error); // Log the error
      res.status(500).json({ error: "Failed to update leave status" });
    }
  });
  
  
  
// Employee and Admin can view all leave requests (GET request)
router.get("/leave", async (req, res) => {
  try {
    const leaveApplications = await Leave.find({});
    res.json(leaveApplications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve leave applications" });
  }
});

module.exports = router;
