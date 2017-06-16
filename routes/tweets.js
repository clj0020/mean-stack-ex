const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const Tweet = require('../models/tweet');

router.post('/add', (req, res) => {
    let newTweet = new Tweet({
      body: req.body.body,
      user: req.body.user
    });

    //newTweet.user._id = newTweet.user._id.toString();

    Tweet.addTweet(newTweet, (err, tweet) => {
        console.log(tweet);
        if (err) {
          res.json({success: false, msg: 'Failed to add tweet!'});
        }
        else {
          res.json({success: true, msg: 'Successfully added tweet!', tweet: tweet});
        }
    });
});

router.post('/update', (req, res) => {
  let tweet = req.body.tweet;
  Tweet.updateTweet(tweet, (err, tweet) => {
    if (err) {
      res.json({success: false, msg: 'Failed to update tweet!'});
    }
    else {
      res.json({success: true, msg: 'Successfully updated tweet!'});
    }
  });
});

router.post('/', (req, res) => {
  const page = (req.body.page > 0 ? req.body.page : 1) - 1;
  const perPage = 15;
  const options = {
    perPage: perPage,
    page: page
  };

  Tweet.listTweets(options, (err, tweets) => {
    if (err) {
      return res.json({success: false, msg: 'Failed to retrieve tweets: ' + err});
    }
    Tweet.count().exec((err, count) => {
      if (err) {
        return res.json({success: false, msg: 'Failed to retrieve tweets: ' + err});
      }
      //let followingCount = req.body.user.following.length;
      //let followerCount = req.body.user.followers.length;
      res.json({
        success: true,
        msg: 'Got your tweets',
        tweets: tweets,
        page: page + 1,
        pages: Math.ceil(count / perPage),
        // followerCount: followerCount,
        // followingCount: followingCount
      });
    });
  })
});


module.exports = router;
