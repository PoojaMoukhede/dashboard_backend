const mongooose = require("mongoose");

const clearanceSchema = new mongooose.Schema(
  {
    FormData: [
      {
        Transport_type: { type: String },
        Total_expense: { type: String },
        images: {
          data: Buffer,
          contentType: String,
        }, 
        ImageName:{type: String},
        timestamp: { type: Date, default: Date.now }, 
      },
      
    ],
    userRef: { type: mongooose.Schema.Types.ObjectId, ref: "users" },
  },
  // { timestamps: true }
);

const Clearance = mongooose.model("clearances", clearanceSchema);
module.exports = Clearance;
