const mongoose = require('mongoose')
const todoSchema = new mongoose.Schema({
    todoText:{
        type:String,
    },
    username : {
        type:String,
        require:true
    }
}, {timestamps:true})

module.exports = mongoose.model('todo', todoSchema)