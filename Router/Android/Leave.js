const express = require("express");
const router = express.Router();
const Leave = require("../../Model/Android/Leave");
const User = require("../../Model/Android/User");
const LeaveBalance = require("../../Model/Android/LeaveBalance");
const Notification = require('../../Model/Web/Notification')

router.post("/leave/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { startDate, endDate } = req.body;
    let numberOfDays = 1; // Default to 1 day

    // Check if start and end dates are the same, and calculate the number of days accordingly
    if (startDate !== endDate) {
      numberOfDays = Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      );
    }
    const newLeaveRequest = {
      startDate,
      endDate,
      numberOfDays,
    };

    const leave = await Leave.findOne({ userRef: user._id });
    if (leave) {
      leave.Leave_info.push(newLeaveRequest);
      await leave.save();
    } else {
      const newLeaveDocument = new Leave({
        Leave_info: [newLeaveRequest],
        userRef: user._id,
      });
      await newLeaveDocument.save();
    }
    const newNotification = new Notification({
      userId: user._id, 
      message: `${user.Emp_name} has applied for leave.`,
    });
    
    // Save the notification to the database
    await newNotification.save();

    res.status(200).json({
      status: "Success",
      message: "Leave request created",
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.error(e);
  }
});

// Admin approves or rejects leave requests (PUT request)
router.put("/leave/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;

    const updatedLeave = await Leave.findOne({ "Leave_info._id": requestId });

    if (!updatedLeave) {
      return res.status(404).json({ error: `Leave request not found with id ${requestId}` });
    }

    // Find the leave info within Leave_info by its _id
    const leaveInfo = updatedLeave.Leave_info.id(requestId);

    if (!leaveInfo) {
      return res.status(404).json({ error: `Leave info not found with id ${requestId}` });
    }

    if (leaveInfo.status === "approved" && status === "approved") {
      return res.status(400).json({ error: `Leave request with id ${requestId} is already approved` });
    }

    if (leaveInfo.status === "rejected" && status === "rejected") {
      return res.status(400).json({ error: `Leave request with id ${requestId} is already rejected` });
    }

    const user = await User.findOne({ _id: updatedLeave.userRef });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const leave = await LeaveBalance.findOne({ userRef: user._id });

    if (!leave) {
      return res.status(404).json({ error: "Leave balance not found" });
    }

    // Validate that availableLeave is not NaN
    if (!isNaN(leave.availableLeave)) {
      const leaveDays = leaveInfo.numberOfDays;

      if (status === "approved") {
        // Check if user has sufficient available leave days
        if (leaveDays > leave.availableLeave) {
          return res.status(400).json({ error: "User has insufficient available leaves" });
        }

        leave.availableLeave -= leaveDays; // Deduct leave days from LeaveBalance
      } else if (status === "rejected") {
        // Mark the leave request as rejected (if it's not already rejected)
        if (!leaveInfo.rejected) {
          leaveInfo.status = status;
          leaveInfo.rejected = true;
          leave.availableLeave += leaveDays; // Refund the deducted leave days
        }
      }
    } else {
      return res.status(400).json({ error: "Invalid value for availableLeave" });
    }

    leaveInfo.status = status;
    await Promise.all([updatedLeave.save(), leave.save()]);
    res.json(leaveInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update leave status" });
  }
});

// Employee and Admin can view all leave requests (GET request)
router.get("/leave", async (req, res) => {
  try {
    const leaveApplications = await Leave.find({}).populate("userRef");

    res.json(leaveApplications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve leave applications" });
  }
});

router.get("/leave/:id", async (req, res) => {

  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const leaveApplications = await Leave.findOne({ userRef: user._id });
    if (!leaveApplications) {
      return res
        .status(404)
        .json({ message: "No leave applications found for this user" });
    }

    const totalNumberOfDays = leaveApplications.Leave_info.reduce(
      (total, leave) => {
        return total + leave.numberOfDays;
      },
      0
    );

    res.json({
      totalNumberOfDays: totalNumberOfDays,
      leaveApplications: leaveApplications.Leave_info,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to retrieve leave applications for this user" });
  }
});



module.exports = router;
 