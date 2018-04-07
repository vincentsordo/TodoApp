require('../config/config.js');

// third party includes
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
// local includes
const {ObjectID} = require('mongodb');
const {mongoose} = require('../db/mongoose.js');
const {Todo} = require('../model/todo');
const {User} = require('../model/user');
const {authenticate} = require('../middleware/authenticate');

const port = process.env.PORT;

let app = express();

app.use(bodyParser.json());

app.post('/todo', authenticate, async (req, res) => {
  let newTodo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  try {
    const doc = await newTodo.save();
    res.send(doc);
  } catch(e) {
    res.status(400).send(e);
  }
});

app.get('/todo', authenticate, async (req, res) => {
  try {
    const todos = await Todo.find({_creator: req.user._id});
    res.send({todos});
  } catch(e) {
    res.status(400).send(e);
  }
});

app.get('/todo/:id', authenticate, async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(404).send({errorMessage: 'Invalid id'});
  }

  try {
    const todo = await Todo.findOne({
          _id: req.params.id,
          _creator: req.user._id
    });
    if (!todo) {
      return res.status(404).send({errorMessage: 'Id not found'});
    }
    res.status(200).send({todo});
  } catch(e) {
    res.status(500).send({errorMessage: 'Internal Error'});
  }
});

app.delete('/todo/:id', authenticate, async (req, res) => {

  if (!ObjectID.isValid(req.params.id)) {
    return res.status(404).send();
  }

  try {
    const todo = await Todo.findOneAndRemove({
      _id: req.params.id,
      _creator: req.user._id
    });
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  } catch(e) {
    res.status(400).send();
  }
});

app.patch('/todo/:id', authenticate, async (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text','completed']);

  if (!ObjectID.isValid(req.params.id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  try {
    const todo = await Todo.findOneAndUpdate({
      _id: id,
      _creator: req.user._id
    }, {$set: body}, {new: true});
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  } catch(e) {
    res.status(400).send();
  }
});


app.post('/user', async (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  let user = new User(body);

  try {
    await user.save(body);
    const token = user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch(e) {
    res.status(400);
    res.send(e);
  }
});



app.get('/user/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/user/login', async (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);

  try {
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  }
  catch(e) {
    res.status(400).send()
  }
});

app.delete('/user/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send()
  } catch (e) {
    res.status(400).send()
  }
});

app.listen(port, () => {
  console.log(`Starting server on port ${port}`);
});

module.exports = {app};
