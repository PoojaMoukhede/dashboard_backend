
const mongooose = require("mongoose");

const expansedAYSchema = new mongooose.Schema({
    money: { type: Number },
    date: { type: Date, default: Date.now },

});

const ExpansedAY = mongooose.model("expanses", expansedAYSchema);

module.exports = Expanse;
