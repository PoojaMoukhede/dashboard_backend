const mongooose = require('mongoose');

const adminSchema = new mongooose.Schema({
    email: {type:String},
    password: {type:String},
    confirm_password: {type:String}
})

const Admin = mongooose.model('admins', adminSchema);

module.exports = Admin;