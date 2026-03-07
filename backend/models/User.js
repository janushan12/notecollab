const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema  = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
},
    { timestamps: true }
);

UserSchema .pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.toJSON = function () {
    const obj = this.toObjext();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', UserSchema);
