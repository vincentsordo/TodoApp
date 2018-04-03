// third party includes
const express = require('express');
const bodyParser = require('body-parser');
// local includes
const {mongoose} = require('../db/mongoose.js');
const {Todo} = require('../model/todo');
const {User} = require('../model/user');

let port = process.env.PORT || 3000;

let app = express();

app.use(bodyParser.json());

app.post('/todo', (req, res) => {
  let newTodo = new Todo({
    text: req.body.text
  });

  newTodo.save().then((doc) => {
    console.log('Saved todo', doc);
    res.send(doc);
  }, (e) => {
    console.log('Unable to save todo');
    res.status(400);
    res.send(e);
  });
})

app.listen(port, () => {
  console.log(`Starting server on port ${port}`);
});

module.exports = {app};
