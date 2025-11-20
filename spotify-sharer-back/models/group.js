const mongoose = require('mongoose')
const { Schema, model } = mongoose;

const groupSchema = new Schema({
  name: {
    type: String,
    minlenth: [5, 'Group name must be at least 5 characters long'],
    maxlength: [20, 'Group name can be up to 20 characters long '],
    required: true
  },
  password: {
    type: String,
    required: true
  }
})

groupSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject.__v
    delete returnedObject.password
  }
})

module.exports = mongoose.model('Group', groupSchema)
