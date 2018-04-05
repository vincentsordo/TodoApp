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

app.post('/todo', authenticate, (req, res) => {
  let newTodo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  newTodo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400);
    res.send(e);
  });
});

app.get('/todo', authenticate, (req, res) => {
  Todo.find({_creator: req.user._id}).then((todos) => {
    res.send({
      todos
    })
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todo/:id', authenticate, (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(404).send({errorMessage: 'Invalid id'});
  }
  Todo.findOne({
        _id: req.params.id,
        _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send({errorMessage: 'Id not found'});
    }
    res.status(200).send({todo});
  }).catch((e) => res.status(500).send({errorMessage: 'Internal Error'}));
});

app.delete('/todo/:id', authenticate, (req, res) => {

  if (!ObjectID.isValid(req.params.id)) {
    return res.status(404).send();
  }

  Todo.findOneAndRemove({
    _id: req.params.id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/todo/:id', authenticate, (req, res) => {
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

  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  }, {$set: body}, {new: true}).then((todo) => {
    if (!todo) return res.status(404).send();

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});


app.post('/user', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  let user = new User(body);

  user.save(body).then(() => {
    return user.generateAuthToken()
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400);
    res.send(e);
  });
});



app.get('/user/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/user/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => res.status(400).send());
});

app.delete('/user/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch((e) => res.statu(400).send());
});

app.listen(port, () => {
  console.log(`Starting server on port ${port}`);
});

module.exports = {app};
