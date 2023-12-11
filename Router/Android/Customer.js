const express = require("express");
const router = express.Router();
const Customer = require("../../Model/Android/Customer");


router.get("/customer", async (req, res) => {
  try {
    const results = await Customer.find();
    res.json(results);
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});


router.get("/customer/:id", async (req, res) => {
  const customerId = req.params.id;
  try {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.error(e);
  }
});


router.post("/customer", async (req, res) => {
  try {
    let customer_data = await Customer.create({
      ...req.body,
    });
    console.log("Employee_data", customer_data);
    res.status(201).json(customer_data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});


router.put("/customer/:id", async (req, res) => {
  try {
    const data = req.body;
    const customer_data = await Customer.updateOne(
      { _id: req.params.id },
      data
    );
    res.json({ result: customer_data });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});


router.delete("/customer/:id", async (req, res) => {
  const ID = req.params.id;
  const customer_data = await Customer.findOneAndDelete({ _id: ID });
  res.send("Customer's data has been Deleted");
});


module.exports = router;
