const mongoose = require('mongoose');
let User = mongoose.model('user', {
  email: {
    type: String,
    required: true,
    minLength: 1,
    trim: true
  },
  username: {
    type: String,
    required: true,
    minLength: 1,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minLength: 1
  }
});
module.exports = {User};
