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

import _Store     from'./_Store';
import Dispatcher from'../Dispatcher';
import Constants  from'../constants/Constants';
import assign     from'object-assign';

var _selectedCompany;
var _articles = [];

/**
 * Here are some setters
 */
function setSelectedCompany (newState) {
  _selectedCompany = newState;
}
function setArticles (newArticles) {
  _articles = newArticles.map(a => ({
    title: a.title,
    url: a.url
  }));
}

/**
 * The store we'll be exporting. Contains getter methods for
 * whether or not to display the article list, and the articles
 * themselves
 */
var NewsArticlesStore = assign({}, _Store, {
  getSelectedCompany: function () {
    return _selectedCompany
  },
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
    // clear existing articles if we're about to load a new symbol
    // only emit a change... if a change happened
    case Constants.NEWS_LOADING:
      if (action.symbol !== _selectedCompany) {
        setSelectedCompany(action.symbol);
        setArticles([]);
        NewsArticlesStore.emitChange();
      }
      break;

    // when we get the articles, only set and emit if an article is
    // still selected. otherwise we know the window has been closed.
    case Constants.NEWS_DATA:
      setArticles(action.news.news || action.news);
      NewsArticlesStore.emitChange();
      break;

    // when closing the article list, clear the selected company and
    // loaded articles
    case Constants.CLOSE_ARTICLE_LIST:
      setSelectedCompany(null);
      setArticles([]);
      NewsArticlesStore.emitChange();
      break;
  }
});

export default NewsArticlesStore;
