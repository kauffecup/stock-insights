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

import Dispatcher     from './Dispatcher';
import Constants      from './constants/Constants';
import PageStateStore from './stores/PageStateStore';
import {
  companyLookup,
  stockPrice,
  stockNews,
  tweets,
  strings
} from './requester'

var _lastLanguage;

/** Search for companies */
export function searchCompany(companyName) {
  Dispatcher.dispatch({actionType: Constants.COMPANIES_LOADING});
  companyLookup(companyName).then(companies => {
    Dispatcher.dispatch({actionType: Constants.COMPANY_DATA, companies: companies});
  });
}

/** Clear potential companies */
export function clearPotentialCompanies() {
  Dispatcher.dispatch({actionType: Constants.CLEAR_POTENTIAL_COMPANIES})
}

/** Get the stock data for a given array of companies */
export function getStockData(symbols) {
  Dispatcher.dispatch({actionType: Constants.STOCK_PRICE_LOADING, symbols: symbols});
  stockPrice(symbols).then(data => {
    Dispatcher.dispatch({actionType: Constants.STOCK_PRICE_DATA, data: data});
  });
}

/** Get the most recent tweets about a symbol/entity combo */
export function getTweets(symbols, entity, language) {
  Dispatcher.dispatch({actionType: Constants.TWEETS_LOADING, symbols: symbols, entity: entity});
  tweets(symbols, entity, language).then(data => {
    Dispatcher.dispatch({actionType: Constants.TWEETS_DATA, data: data});
  });
}

/** Close the tweet window */
export function closeTweets() {
  Dispatcher.dispatch({actionType: Constants.CLOSE_TWEETS});
}

/** Get the articles for a given company. This also selects the company and gets its stock history. */
export function getNews(language, symbol) {
  language = language || _lastLanguage;
  _lastLanguage = language;
  symbol = symbol && (symbol._id || symbol.symbol || symbol);
  var symbols = PageStateStore.getSelectedCompanies().map(c => typeof c === 'string' ? c : (c._id || c.symbol));
  if (symbol){
    symbols = symbols.concat(symbol);
  }
  if (symbols.length) {
    Dispatcher.dispatch({actionType: Constants.NEWS_LOADING});
    stockNews(symbols, language).then(news => {
      Dispatcher.dispatch({actionType: Constants.NEWS_DATA, news: news});
    });
  }
  if (symbol) {
    selectCompany(symbol);
  }
}

/* Select a company */
export function selectCompany(symbol) {
  Dispatcher.dispatch({actionType: Constants.SELECT_COMPANY, symbol: symbol});
}

/* Deselect a company */
export function deselectCompany(company) {
  var symbol = company._id || company.symbol || symbol;
  Dispatcher.dispatch({actionType: Constants.DESELECT_COMPANY, symbol: symbol});
  getNews();
}

/** Close the article list */
export function closeArticleList() {
  Dispatcher.dispatch({actionType: Constants.CLOSE_ARTICLE_LIST});
}

/** Switch the analysis color mode */
export function switchAnalysisColorMode(id) {
  Dispatcher.dispatch({actionType: Constants.SWITCH_ANALYSIS_COLOR_MODE, id: id});
}

/** Toggle the company condensed-ness */
export function toggleCondensedCompanies() {
  Dispatcher.dispatch({actionType: Constants.TOGGLE_CONDENSED_COMPANIES});
}

/** Change the date */
export function setDate(date) {
  Dispatcher.dispatch({actionType: Constants.SWITCH_DATE, date: date});
}

/** Get the globalized strings */
export function getStrings(language) {
  strings(language).then(strings => {
    Dispatcher.dispatch({actionType: Constants.STRING_DATA, strings: strings});
  });
}
