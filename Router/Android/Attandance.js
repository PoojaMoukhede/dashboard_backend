const express = require("express");
const router = express.Router();
const Attandance = require("../../Model/Android/Attandance");
const User = require("../../Model/Android/User");
const LeaveBalance = require("../../Model/Android/LeaveBalance");

// Both checked
// get according to date

const moment = require("moment-timezone");

router.get("/attendance", async (req, res) => {
  console.log("hello attendance");
  try {
    const today = moment().tz("Asia/Kolkata").startOf("day");
    const todayUtc = today.clone().utc();
    // console.log(todayUtc.toDate());

    const attendanceRecords = await Attandance.find({
      Employee_attandance: todayUtc.toDate(),
    });

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res
        .status(404)
        .json({ message: "No attendance records found for today" });
    }

    res.status(200).json({
      status: "Success",
      message: attendanceRecords,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
    console.log(e);
  }
});

router.get("/attandance/:id", async (req, res) => {
  console.log("hello attandance get ID call");

  try {
    const userId = req.params.id; //mongo
    // console.log(userId);

    const user = await User.findOne({ _id: userId });
    // console.log(`user : ${user}`);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const attendance = await Attandance.findOne({ userRef: user._id });
    // console.log(`Employee attandance : ${attendance}`);

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

router.put("/attendance/:id", async (req, res) => {
  try {
    const userId = req.params.id; // User's _id from the route parameter
    console.log(userId);

    const user = await User.findOne({ _id: userId });
    // console.log(`user : ${user}`);

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
      return res.status(404).json({ error: "Attendance not found" });
    }

    res.status(200).json({ result: attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// without miss punch logic
// router.post("/attendance", async (req, res) => {
//   console.log("hello attendance post call");

//   try {
//     const userId = req.body.userId;
//     const user = await User.findOne({ _id: userId });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     let attendance = await Attandance.findOne({ userRef: user._id });

//     if (!attendance) {
//       attendance = new Attandance({
//         Employee_attandance: [],
//         userRef: user._id,
//       });
//     }

//     const isPunchIn = req.body.isPunchIn;
//     // const timer = req.body.timer; // Assuming you have timer in your request

//     let totalWorkedHours = 0; // Initialize totalWorkedHours to 0

//     if (isPunchIn) {
//       // Check if the user has already punched in today
//       const lastPunchInEntry = attendance.Employee_attandance
//         .slice()
//         .reverse()
//         .find((entry) => entry.action === "Punch In");

//       if (lastPunchInEntry) {
//         // User has already punched in today
//         return res.status(400).json({ message: "You have already punched in for today." });
//       }

//       // Handle Punch In
//       attendance.Employee_attandance.push({
//         action: "Punch In",
//         Emp_status: "On Site",
//         timer: 0, // Reset timer to 0 when Punch In
//         timestamp: new Date(),
//       });
//     } else {
//       // Handle Punch Out
//       const lastEntry = attendance.Employee_attandance[attendance.Employee_attandance.length - 1];
//       if (lastEntry && lastEntry.action === "Punch In") {
//         const punchInTime = lastEntry.timestamp.getTime();
//         const punchOutTime = new Date().getTime();
//         const timeSpent = punchOutTime - punchInTime;

//         // Calculate total worked hours
//         totalWorkedHours = timeSpent / (60 * 60 * 1000);

//         // Update the timer, Emp_status, and action for the last Punch In entry
//         lastEntry.timer = timeSpent;
//         lastEntry.Emp_status = "In Office";
//         lastEntry.action = "Punch Out";
//       } else {
//         // Handle Punch Out without a corresponding Punch In
//         return res.status(400).json({ message: "Punch Out without a Punch In entry." });
//       }
//     }

//     // Calculate overtime and below-time based on total worked hours
//     let overtimeHours = 0;
//     let belowTimeHours = 0;

//     if (totalWorkedHours > 9) {
//       overtimeHours = Math.floor(totalWorkedHours - 9);
//     } else if (totalWorkedHours < 9) {
//       belowTimeHours = Math.floor(9 - totalWorkedHours);
//     }

//     await attendance.save();

//     res.status(200).json({
//       status: "Success",
//       message: "Attendance updated successfully",
//       overtimeHours: overtimeHours,
//       belowTimeHours: belowTimeHours,
//     });
//   } catch (e) {
//     res.status(400).json({ message: e.message });
//     console.log(e);
//   }
// });

router.post("/attendance", async (req, res) => {
  console.log("Hello attendance post call");

  try {
    const userId = req.body.userId;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let attendance = await Attandance.findOne({ userRef: user._id });

    if (!attendance) {
      attendance = new Attandance({
        Employee_attandance: [],
        userRef: user._id,
      });
    }

    const isPunchIn = req.body.isPunchIn;
    // const timer = req.body.timer;

    let totalWorkedHours = 0;

    if (isPunchIn) {
      // Check if the user has already punched in today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastPunchInEntry = attendance.Employee_attandance.slice()
        .reverse()
        .find(
          (entry) => entry.action === "Punch In" && entry.timestamp >= today
        );

      if (lastPunchInEntry) {
        // User has already punched in today
        return res
          .status(400)
          .json({ message: "You have already punched in for today." });
      }

      // Handle Punch In
      attendance.Employee_attandance.push({
        action: "Punch In",
        Emp_status: "On Site",
        timer: 0, // Reset timer to 0 when Punch In
        timestamp: new Date(),
      });
    } else {
      // Handle Punch Out
      const lastPunchInEntry = attendance.Employee_attandance.slice()
        .reverse()
        .find((entry) => entry.action === "Punch In");

      if (lastPunchInEntry) {
        const punchInTime = lastPunchInEntry.timestamp.getTime();
        const punchOutTime = new Date().getTime();
        const timeSpent = punchOutTime - punchInTime;

        // Calculate total worked hours
        totalWorkedHours = timeSpent / (60 * 60 * 1000);

        // Update the timer, Emp_status, and action for the last Punch In entry
        lastPunchInEntry.timer = timeSpent;
        lastPunchInEntry.Emp_status = "In Office";
        lastPunchInEntry.action = "Punch Out";

        // Check if the user missed a Punch In
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const missedPunchIn = await Attandance.findOne({
          userRef: user._id,
          "Employee_attandance.action": "Punch In",
          "Employee_attandance.timestamp": { $lt: today },
        });

        if (missedPunchIn) {
          // Check if today is not a Sunday === 0 , & deduct leave for missed punch
          if (today.getDay() !== 0) {
            const leaveBalance = await LeaveBalance.findOne({
              userRef: user._id,
            });
            if (leaveBalance) {
              // Deduct a certain amount of leave
              const daysToDeduct = 1;
              leaveBalance.availableLeave -= daysToDeduct;

              await leaveBalance.save();
            }
          }

          // Update the missed punch entry
          missedPunchIn.Employee_attandance.push({
            action: "Misspunch Out",
            Emp_status: "Misspunch Out",
            timer: 0,
            timestamp: new Date(),
          });
          await missedPunchIn.save();
        }
      } else {
        // Check if today is not a Sunday & deduct leave for not punching in
        if (today.getDay() !== 0) {
          const leaveBalance = await LeaveBalance.findOne({
            userRef: user._id,
          });
          if (leaveBalance) {
            const daysToDeduct = 1;
            leaveBalance.availableLeave -= daysToDeduct;
            await leaveBalance.save();
          }
        }
      }
    }

    // Calculate overtime and below-time based on total worked hours
    let overtimeHours = 0;
    let belowTimeHours = 0;

    if (totalWorkedHours > 9) {
      overtimeHours = Math.floor(totalWorkedHours - 9);
    } else if (totalWorkedHours < 9) {
      belowTimeHours = Math.floor(9 - totalWorkedHours);
    }

    await attendance.save();

    res.status(200).json({
      status: "Success",
      message: "Attendance updated successfully",
      overtimeHours: overtimeHours,
      belowTimeHours: belowTimeHours,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});

module.exports = router;
