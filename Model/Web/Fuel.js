// 32, 35, 48, 35, 42, 44, 55, 45, 36, 52, 46, 43
const mongooose = require("mongoose");

const fuelSchema = new mongooose.Schema({
    month:{type:String},
    // Liters: { type: Number},
   
  Liters: {
    type: Number,
    // required: true,
  },
  date: { type: Date, default: Date.now },
});

const Fuel = mongooose.model("fuels", fuelSchema);
module.exports = Fuel;

