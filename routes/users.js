const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');

// Register
router.post('/register', (req, res, next) => {
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });

  User.addUser(newUser, (err, user) => {
    if (err) {
      res.json({success: false, msg: 'Failed to register user!'});
    }
    else {
      res.json({success: true, msg: 'User registered!'});
    }
  });

});

// Authenticate
router.post('/authenticate', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json({success: false, msg: 'User not found!'});
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        const token = jwt.sign(user, config.secret, {
            // options
            expiresIn: 604800 // 1 week
        });

        res.json({
          success: true,
          token: 'JWT '+token,
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        })
      }
      else {
        return res.json({success: false, msg: 'Wrong password!'});
      }
    });
  });
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
  res.json({user: req.user});
});

// Get a List of all users
router.get('/list', (req, res) => {
  const currentUserId = req.params._id;
  // const page = (req.body.page > 0 ? req.body.page : 1) - 1;
  // const perPage = 5;
  const options = {
    //criteria: {$nin: currentUserId}
    // perPage: perPage,
    // page: page
  };

  return User.list(options, (err, users) => {
    if (err) {
      return res.json({success: false, msg: 'Could not retrieve any users!'});
    }
    User.count().exec((err, count) => {
      if (err) {
        return res.json({success: false, msg: 'Could not retrieve any users!'});
      }
      return res.json({
        users: users,
        // page: page + 1,
        // pages: Math.ceil(count / perPage)
      });
    });
  });
});

router.get('/:username', (req, res) => {
  const username = req.params.username;

  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json({success: false, msg: 'User not found!'});
    }
    else {
      return res.json({success: true, msg: "User successfully found!", user: user});
    }
  });
})


module.exports = router;
