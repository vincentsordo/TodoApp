const mongoose = require('mongoose');

// set mongoose to use Javascript Promise, since ES6 Promises are supported in JS
mongoose.Promise = global.Promise;
// connect to mongo db
mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};
