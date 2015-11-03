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

var _articles = [];

/**
 * The store we'll be exporting. Contains getter methods for
 * whether or not to display the article list, and the articles
 * themselves
 */
var NewsArticlesStore = assign({}, _Store, {
  getArticles: function () {
    return _articles;
  }
});

/**
 * Handle dispatched events.
 * Currently listens to NEWS_LOADING, NEWS_DATA, and CLOSE_ARTICLE_LIST
 */
Dispatcher.register(function(action) {
  switch(action.actionType) {
    // right now dont do anything. eventually we'll have some kind of loading state
    case Constants.NEWS_LOADING:
      break;

    // get dem articles
    case Constants.NEWS_DATA:
      _articles = action.news.articles;
      NewsArticlesStore.emitChange();
      break;

    // when closing the article list, clear the loaded articles
    case Constants.CLOSE_ARTICLE_LIST:
      _articles = [];
      NewsArticlesStore.emitChange();
      break;

    case Constants.DESELECT_COMPANY:
      if (PageStateStore.getSelectedCompanies().length === 0) {
        _articles = [];
        NewsArticlesStore.emitChange();
      }
      break;
  }
});

export default NewsArticlesStore;
