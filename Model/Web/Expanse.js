const mongooose = require("mongoose");

const expanseSchema = new mongooose.Schema({
    month:{type:String},
    money: { type: Number},

});

const Expanse = mongooose.model("expanses", expanseSchema);

module.exports = Expanse;
