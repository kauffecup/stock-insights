//------------------------------------------------------------------------------
// Copyright IBM Corp. 2015
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------

import _Store         from './_Store';
import Dispatcher     from '../Dispatcher';
import Constants      from '../constants/Constants';
import assign         from 'object-assign';
import PageStateStore from './PageStateStore';

var _tweets = [];
var _sentiment = {};
var _open = false;
var _description = {};

/**
 * The store we'll be exporting. Contains getter methods for
 * whether or not to display the article list, and the articles
 * themselves
 */
var TweetStore = assign({}, _Store, {
  getStatus: function () {
    return _open;
  },
  getDescription: function () {
    return _description;
  },
  getTweets: function () {
    return _tweets;
  },
  getSentiment: function () {
    return _sentiment;
  }
});

/**
 * Handle dispatched events.
 * Currently listens to NEWS_LOADING, NEWS_DATA, and CLOSE_ARTICLE_LIST
 */
Dispatcher.register(function(action) {
  switch(action.actionType) {
    // right now dont do anything. eventually we'll have some kind of loading state
    case Constants.TWEETS_LOADING:
      _tweets = [];
      _sentiment = {};
      _open = true;
      _description = {
        symbols: action.symbols,
        entity: action.entity
      }
      TweetStore.emitChange();
      break;

    // get dem articles
    case Constants.TWEETS_DATA:
      if (_open) {
        var tweets = action.data.tweets;
        _tweets = typeof tweets.length === 'undefined' ? [] : tweets;
        _sentiment = action.data.sentiment;
        TweetStore.emitChange();
      }
      break;

    // when closing the article list, clear the loaded articles
    case Constants.CLOSE_TWEETS:
      if (_open) {
        _open = false;
        _tweets = [];
        _sentiment = {};
        _description = {};
        TweetStore.emitChange();
      }
      break;
  }
});

export default TweetStore;
