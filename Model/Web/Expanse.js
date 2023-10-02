const mongooose = require("mongoose");

const expanseSchema = new mongooose.Schema({
    month: { type: String },
    money: { type: Number },
    date: { type: Date, default: Date.now },

});

const Expanse = mongooose.model("expanses", expanseSchema);

module.exports = Expanse;