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

import Constants from '../constants/Constants';
import {
  companyLookup,
  stockPrice,
  stockNews,
  tweets,
  strings
} from '../requester';

/** Toggle the company condensed-ness */
export function toggleCondensedCompanies() {
  return { type: Constants.TOGGLE_CONDENSED_COMPANIES };
}

/** Change the date */
export function setDate(date) {
  return { type: Constants.SWITCH_DATE, date: date };
}

/** Close the article list */
export function closeArticleList() {
  return { type: Constants.CLOSE_ARTICLE_LIST };
}

/** Clear potential companies */
export function clearPotentialCompanies() {
  return { type: Constants.CLEAR_POTENTIAL_COMPANIES };
}

/** Close the tweet window */
export function closeTweets() {
  return { type: Constants.CLOSE_TWEETS };
}

/** Search for companies */
export function searchCompany(companyName) {
  return dispatch => {
    dispatch({ type: Constants.COMPANIES_LOADING });
    companyLookup(companyName).then(companies => {
      dispatch({ type: Constants.COMPANY_DATA, companies: companies });
    });
  }
}

/** Toggle a company's selected-ness */
export function toggleSelect(symbol) {
  return (dispatch, getState) => {
    symbol = symbol.symbol || symbol._id || symbol;
    var { selectedCompanies, language } = getState();
    if (selectedCompanies.indexOf(symbol) === -1) {
      dispatch({ type: Constants.SELECT_COMPANY, symbol: symbol });
    } else {
      dispatch({ type: Constants.DESELECT_COMPANY, symbol: symbol });
    }
    selectedCompanies = getState().selectedCompanies;
    _getNews(selectedCompanies, language, dispatch);
  }
}

/** Add a company */
export function addCompany(company) {
  return dispatch => {
    dispatch({ type: Constants.ADD_COMPANY, company: company });
    if (company.symbol) {
      dispatch({ type: Constants.STOCK_PRICE_LOADING, symbols: company.symbol });
      stockPrice(company.symbol).then(data => {
        dispatch({ type: Constants.STOCK_PRICE_DATA, data: data });
      });
    }
  }
}

/** Remove a company */
export function removeCompany(company) {
  return (dispatch, getState) => {
    dispatch({ type: Constants.REMOVE_COMPANY, company: company });
    var { selectedCompanies, language } = getState();
    _getNews(selectedCompanies, language, dispatch);
  }
}

/** Get the globalized strings */
export function getStrings(language) {
  return dispatch => {
    strings(language).then(strings => {
      dispatch({ type: Constants.STRING_DATA, strings: strings });
    });
  }
}

/** Get the stock data for a given array of companies */
export function getStockData(symbols) {
  return dispatch => {
    dispatch({ type: Constants.STOCK_PRICE_LOADING, symbols: symbols });
    stockPrice(symbols).then(data => {
      dispatch({ type: Constants.STOCK_PRICE_DATA, data: data });
    });
  }
}

/** Get the most recent tweets about a symbol/entity combo */
export function getTweets(symbols, entity) {
  return (dispatch, getState) => {
    var { language } = getState();
    dispatch({ type: Constants.TWEETS_LOADING, symbols: symbols, entity: entity });
    tweets(symbols, entity, language).then(data => {
      dispatch({ type: Constants.TWEETS_DATA, data: data });
    });
  }
}

/** Get the news for everything that's currently selected */
export function getSelectedNews() {
  return (dispatch, getState) => {
    var { selectedCompanies, language } = getState();
    _getNews(selectedCompanies, language, dispatch);
  }
}

/** Helper method - fetch stock news for an array of companies */
function _getNews(companies, language, dispatch) {
  if (companies.length) {
    dispatch({ type: Constants.NEWS_LOADING });
    stockNews(companies, language).then(news => {
      dispatch({ type: Constants.NEWS_DATA, news: news });
    }).catch(e => {
      dispatch({ type: Constants.NEWS_ERROR });
    });
  }
}
