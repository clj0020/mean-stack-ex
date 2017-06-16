const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../config/database');
const utils = require('../utils');

// Tweet Schema
const TweetSchema = new Schema({
    body: {
        type: String,
        default: '',
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    comments: [{
        body: {
            type: String,
            default: ''
        },
        user: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        commenterName: {
            type: String,
            default: ''
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    favorites: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    favoriters: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    favoritesCount: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Tweet = module.exports = mongoose.model('Tweet', TweetSchema);

// Load tweets
module.exports.loadTweets = function(id, callback) {
    Tweet.findOne({
            _id: id
        }).populate('user', 'name username')
        .populate('comments.user')
        .exec(callback)
};


// List tweets
module.exports.listTweets = function(options, callback) {
    const criteria = options.criteria || {};
    Tweet.find(criteria).populate('user', 'name username')
        .sort({
            'createdAt': -1
        })
        .limit(options.perPage)
        .skip(options.perPage * options.page)
        .exec(callback);
};

// List limited num of Tweets
module.exports.listLimitedTweets = function(options, callback) {
    const criteria = options.criteria || {};
    Tweet.find(criteria)
        .populate('user', 'name username')
        .sort({
            'createdAt': -1
        })
        .limit(options.perPage)
        .skip(options.perPage * options.page)
        .exec(callback);
};

module.exports.addTweet = function(newTweet, callback) {
  newTweet.save(callback);
};

module.exports.updateTweet = function(tweet, callback) {
  Tweet.findOneAndUpdate({ _id: tweet._id }, tweet, callback);
};

// Tweets of User
module.exports.getUserTweets = function(id, callback) {
    Tweet.find({
            "user": ObjectId(id)
        })
        .toArray()
        .exec(callback);
};

// Count the number of tweets from user
module.exports.getUserTweetCount = function(id, callback) {
    Tweet.find({
            "user": ObjectId(id)
        })
        .length()
        .exec(callback);
};

// Add a comment
module.exports.addComment = function(user, comment, callback) {
  if (user.name) {
    Tweet.comments.push({
      body: comment.body,
      user: user._id,
      commenterName: user.name
    });
    Tweet.save(callback);
  } else {
    Tweet.comments.push({
      body: comment.body,
      user: user._id,
      commenterName: user.username
    });
    Tweet.save(callback);
  }
};

// Remove a comment
module.exports.removeComment = function(commentId, callback) {
  let index = utils.indexof(Tweet.comments, {id: commentId});
  if (~index) {
    Tweet.comments.splice(index, 1);
  } else {
    return callback('not found');
  }
  Tweet.save(callback);
};
