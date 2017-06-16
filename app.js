const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); // parses incoming request bodies
const cors = require('cors'); // cors allows us to make a request to our api from a different domain name because it would be blocked if you didn't
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');

// Connect to database
mongoose.connect(config.database);

// On Connection
mongoose.connection.on('connected', () => {
  console.log('Connected to database ' + config.database);
});

// On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error: ' + err);
});

const app = express();

const users = require('./routes/users');
const tweets = require('./routes/tweets');

// Port Number
const port = process.env.PORT || 8080;

// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));


// Body Parser Middleware
app.use(bodyParser.json());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use('/users', users);
app.use('/tweets', tweets);

// Index Route
app.get('/', (req, res) => {
  res.send('Invalid endpoint.');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});


// Start Server
app.listen(port, () => {
  console.log('Server started on port ' + port);
});
