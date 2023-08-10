const mongooose = require('mongoose');

const managerSchema = new mongooose.Schema({
    name:{ type: String},
    email: { type: String, required: true, unique: true },
    contact_no: { type: String },
    city:{type: String },
    state:{type: String },

})

const Manager = mongooose.model('managers', managerSchema);

module.exports = Manager;