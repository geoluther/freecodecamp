
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username:  String,
    exercises: [ { description: String, duration: String, date: Date}]
})

const User = mongoose.model('User', userSchema);