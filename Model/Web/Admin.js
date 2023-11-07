const mongooose = require('mongoose');

const adminSchema = new mongooose.Schema({
    name:{ type: String},
    email: { type: String, required: true, unique: true },
    phone_no :{type: Number},
    admin_city:{type:String},
    admin_state:{type:String},
    admin_country:{type:String},
    password: { type: String, required: true },
    profileImage: {
        data: Buffer,
        contentType: String,
    },
})

const Admin = mongooose.model('admins', adminSchema);

module.exports = Admin;