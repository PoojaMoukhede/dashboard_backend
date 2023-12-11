const express = require("express");
const router = express.Router();
const CompanyProperty = require("../../Model/Android/CompanyProperty");
const User = require("../../Model/Android/User");

router.get("/property", async (req, res) => {
  try {
    const results = await CompanyProperty.find();
    res.json(results);
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});

router.get("/property/:id", async (req, res) => {

  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const property = await CompanyProperty.findOne({ userRef: user._id });

    if (!property) {
      return res.status(404).json({ message: "Property record not found" });
    }

    res.status(200).json({
      status: "Success",
      message: property,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST property or update existing property
router.post("/property", async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let property = await CompanyProperty.findOne({ userRef: user._id });

    if (!property) {
      property = await CompanyProperty.create({
        userRef: user._id,
        ID_card: req.body.ID_card,
        Phone: req.body.Phone,
        laptop: req.body.laptop,
        mouse: req.body.mouse,
        carryBag: req.body.carryBag,
        blazer: req.body.blazer,
        toolkit: req.body.toolkit,
        mBatch: req.body.mBatch,
        trollyBag: req.body.trollyBag,
        Brochure: req.body.Brochure,
        Catalog: req.body.Catalog,
        hardware: req.body.hardware,
      });
    } 


    res.status(200).json({
      status: "Success",
      message: "Property added/updated successfully",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Update property by user ID
router.put("/property/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const property = await CompanyProperty.findOneAndUpdate(
      { userRef: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.status(200).json({ result: property });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE property by ID
router.delete("/property/:id", async (req, res) => {
  const propertyId = req.params.id;

  try {
    await CompanyProperty.findOneAndDelete({ userRef: propertyId });
    res.status(200).json({ message: "Property data has been deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
