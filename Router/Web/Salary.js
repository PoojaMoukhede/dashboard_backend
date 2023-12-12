const express = require("express");
const router = express.Router();
const Salary = require("../../Model/Web/Salary");
const User = require("../../Model/Android/User");

router.get("/salary", async (req, res) => {
  try {
    const results = await Salary.find();
    res.json(results);
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});

router.get("/salary/:id", async (req, res) => {

  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salary = await Salary.findOne({ userRef: user._id });

    if (!salary) {
      return res.status(404).json({ message: "salary record not found" });
    }

    res.status(200).json({
      status: "Success",
      message: salary,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST salary or update existing salary
router.post("/salary", async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let salary = await Salary.findOne({ userRef: user._id });

    if (!salary) {
      salary = await Salary.create({
        userRef: user._id,
        bankName: req.body.bankName,
        bankCity:req.body.bankCity,
        ifscCode:req.body.ifscCode,
        acNumber: req.body.acNumber,
        rtgs: req.body.rtgs,
        panNumber: req.body.panNumber,
        basicSalary: req.body.basicSalary,
        hra: req.body.hra,
        profTax: req.body.profTax,
        pfNumber: req.body.pfNumber,
        increment:req.body.increment,
        pfAmount:req.body.pfAmount,
        dateOfIncrment:req.body.dateOfIncrment
      });
    } 


    res.status(200).json({
      status: "Success",
      message: "salary added/updated successfully",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Update salary by user ID
router.put("/salary/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salary = await Salary.findOneAndUpdate(
      { userRef: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!salary) {
      return res.status(404).json({ error: "salary not found" });
    }

    res.status(200).json({ result: salary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE salary by ID
router.delete("/salary/:id", async (req, res) => {
  const salaryId = req.params.id;

  try {
    await Salary.findOneAndDelete({ userRef: salaryId });
    res.status(200).json({ message: "salary data has been deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
