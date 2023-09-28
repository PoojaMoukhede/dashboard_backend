const mongooose = require('mongoose');

const CanteenSchema = new mongooose.Schema({
    date: { type: Date, required: true },
    menu: { type: String, required: true },
    status: { type: String, default: 'pending' },

})

const Canteen = mongooose.model('canteens', CanteenSchema);

module.exports = Canteen;