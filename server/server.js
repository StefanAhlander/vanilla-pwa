require('dotenv').config();
const express = require('express');
const firebase = require('firebase/app');
require('firebase/database');
require('firebase/storage');
const cors = require('cors');

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.post('/storepostdata', (req, res) => {
  const postData = {
    id: req.body.id,
    title: req.body.title,
    location: req.body.location,
    image: req.body.image,
  };

  const newPostKey = firebase.database().ref().child('posts').push().key;

  const updates = {};
  updates['/posts/' + newPostKey] = postData;

  firebase
    .database()
    .ref()
    .update(updates)
    .then(() => {
      res.status(201).json({ message: 'Data stored', id: req.body.id });
    })
    .catch((err) => res.status(500).json({ error: err }));
});

app.listen(3000, console.log('listening on port: 3000'));
