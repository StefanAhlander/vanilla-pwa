const express = require('express');
const firebaseAdmin = require('firebase-admin');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/storepostdata', (req, res, next) => {
  res.send('Storing data...');
  admin
    .database()
    .ref('posts')
    .push({
      id: res.body.id,
      title: res.body.title,
      location: res.body.location,
      image: res.body.image,
    })
    .then(() => {
      res.status(201).json({ message: 'Data stored', id: req.body.id });
    })
    .catch((err) => res.status(500).json({ error: err }));
});

app.listen(3000, console.log('listening on port: 3000'));
