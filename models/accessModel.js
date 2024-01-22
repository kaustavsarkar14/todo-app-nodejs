const mongoose = require("mongoose")

const accessSchema = new mongoose.Schema({
    sessionId : {
        type: String,
        require: true
    },
    time : {
        type: String,
        require : true
    }
})

module.exports = mongoose.model('access', accessSchema)