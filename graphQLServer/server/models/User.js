const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    createdAt: {type: String, default: new Date().toISOString()},
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    status: {
        type: String,
        enum: ['Online', 'Offline', 'DND'],
        default: 'Offline'
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;