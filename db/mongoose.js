const mongoose = require('mongoose');

// set mongoose to use Javascript Promise, since ES6 Promises are supported in JS
mongoose.Promise = global.Promise;
// connect to mongo db
let dbUrl = 'mongodb://localhost:27017/todo_app';
mongoose.connect(dbUrl);

module.exports = {mongoose};
