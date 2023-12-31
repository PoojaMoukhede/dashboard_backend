const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  
    Coupon_Count: [
      {
        numberOfCoupons: {
            type: Number,
            required: true,
          },
          purchaseDate: {
            type: Date,
            default: Date.now,
          },
          menuRef: { type: mongoose.Schema.Types.ObjectId, ref: "canteens" }
      }
    ],
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: "users" }
  
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;