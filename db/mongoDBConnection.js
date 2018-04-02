// object destructing
const {MongoClient, ObjectID} = require('mongodb');
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'todo_app';

// Use connect method to connect to the server
MongoClient.connect(url, (err, client) => {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  db.collection('todos').insertOne({
    text: 'First todo entry',
    completed: false
  }, (err, result) => {
    assert.equal(null, err);
    console.log(JSON.stringify(result.ops, undefined, 2));
  });

  db.collection('users').insertOne({
    name: 'Vincent Sordo',
    username: 'vincentsordo',
    age: 29,
    location: 'Santa Cruz'
  }, (err, result) => {
    assert.equal(null, err);
    console.log(JSON.stringify(result.ops, undefined, 2));
    console.log(result.ops[0]._id.getTimestamp());
  });

  client.close();
});
