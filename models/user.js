const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(plm);
userSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', userSchema);