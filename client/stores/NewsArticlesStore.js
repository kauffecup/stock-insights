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

var _articleMap = {};

/**
 * Here are some setters
 */
function removeCompany (symbol) {
  delete _articleMap[symbol.toLowerCase()];
}
function addArticles (newArticles, symbol) {
  _articleMap[symbol.toLowerCase()] = newArticles.map(a => ({
    title: a.title,
    url: a.url,
    relations: a.relations
  }));
}
function clearArticles () {
  _articleMap = {};
}
function flattenArticles () {
  var articles = [];
  for (var symbol in _articleMap) {
    articles = articles.concat(_articleMap[symbol]);
  }
  return articles;
}

/**
 * The store we'll be exporting. Contains getter methods for
 * whether or not to display the article list, and the articles
 * themselves
 */
var NewsArticlesStore = assign({}, _Store, {
  getArticles: function () {
    return flattenArticles();
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

    // when we get the articles, only set and emit if an article is
    // still selected. otherwise we know the window has been closed.
    case Constants.NEWS_DATA:
      var scs = PageStateStore.getSelectedCompanies();
      if (scs.length && scs.indexOf(action.news.symbol.toUpperCase()) > -1) {
        addArticles(action.news.news, action.news.symbol);
        NewsArticlesStore.emitChange();
      }
      break;

    // when closing the article list, clear the selected company and
    // loaded articles
    case Constants.CLOSE_ARTICLE_LIST:
      clearArticles();
      NewsArticlesStore.emitChange();
      break;

    case Constants.DESELECT_COMPANY:
      removeCompany(action.symbol);
      NewsArticlesStore.emitChange();
      break;
  }
});

export default NewsArticlesStore;
