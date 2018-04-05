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

app.post('/todo', (req, res) => {
  let newTodo = new Todo({
    text: req.body.text
  });

  newTodo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400);
    res.send(e);
  });
});

app.get('/todo', (req, res) => {
  Todo.find().then((todos) => {
    res.send({
      todos
    })
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todo/:id', (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(404).send({errorMessage: 'Invalid id'});
  }
  Todo.findById(req.params.id).then((todo) => {
    if (!todo) {
      return res.status(404).send({errorMessage: 'Id not found'});
    }
    res.status(200).send({todo});
  }).catch((e) => res.status(500).send({errorMessage: 'Internal Error'}));
});

app.delete('/todo/:id', (req, res) => {

  if (!ObjectID.isValid(req.params.id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(req.params.id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/todo/:id', (req, res) => {
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

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
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

app.get('/user', (req, res) => {
  User.find().then((users) => {
    res.send({
      users
    })
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/user/:id', (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send({errorMessage: 'Invalid id'});
  }
  User.findById(req.params.id).then((user) => {
    if (!user) {
      return res.status(400).send({errorMessage: 'Id not found'});
    }
    res.status(200).send(user);
  }).catch((e) => res.status(500).send(e));
});

app.listen(port, () => {
  console.log(`Starting server on port ${port}`);
});

module.exports = {app};
