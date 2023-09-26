// const { toString } = require('express-validator/src/utils');
const mongooose = require('mongoose');

const managerSchema = new mongooose.Schema({
    name:{ type: String},
    email: { type: String},
    contact_no: { type: String },
    city:{type: String },
    state:{type: String },
    blood_group:{type: String },
    department:{type:String},
})

const Manager = mongooose.model('managers', managerSchema);

module.exports = Manager;