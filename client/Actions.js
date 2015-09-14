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

import Dispatcher from './Dispatcher';
import Constants  from './constants/Constants';
import {
  companyLookup,
  stockPrice,
  stockNews,
  stockHistory,
  sentiment
} from './requester'

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

/** Add a company */
export function addCompany(company) {
  Dispatcher.dispatch({actionType: Constants.ADD_COMPANY, company: company});
  company.symbol && getStockData(company.symbol);
}

/** Remove a company */
export function removeCompany(company) {
  Dispatcher.dispatch({actionType: Constants.REMOVE_COMPANY, company: company});
}

/** Get the stock data for a given array of companies */
export function getStockData(symbols) {
  Dispatcher.dispatch({actionType: Constants.STOCK_PRICE_LOADING, symbols: symbols});
  stockPrice(symbols).then(data => {
    Dispatcher.dispatch({actionType: Constants.STOCK_PRICE_DATA, data: data});
  });
}

/** Get the stock history data for a given array of companies */
export function getStockHistory(symbols) {
  Dispatcher.dispatch({actionType: Constants.STOCK_HISTORY_LOADING, symbols: symbols});
  stockHistory(symbols).then(history => {
    Dispatcher.dispatch({actionType: Constants.STOCK_HISTORY_DATA, history: history});
  });
}

/** Get the sentiment around a symbol and/or entity */
export function getSentiment(symbol, entity) {
  Dispatcher.dispatch({actionType: Constants.SENTIMENT_LOADING, symbol: symbol, entity: entity});
  sentiment(symbol, entity).then(data => {
    Dispatcher.dispatch({actionType: Constants.SENTIMENT_DATA, data: data});
  })
}

/** Get the articles for a given company */
export function getNews(symbol) {
  symbol = symbol._id || symbol.symbol || symbol;
  Dispatcher.dispatch({actionType: Constants.NEWS_LOADING, symbol: symbol});
  stockNews(symbol).then(news => {
    Dispatcher.dispatch({actionType: Constants.NEWS_DATA, news: news});
  });
}

/** Close the article list */
export function closeArticleList() {
  Dispatcher.dispatch({actionType: Constants.CLOSE_ARTICLE_LIST});
}

/** Switch the analysis color mode */
export function switchAnalysisColorMode(id) {
  Dispatcher.dispatch({actionType: Constants.SWITCH_ANALYSIS_COLOR_MODE, id: id});
}

/** Switch the analysis size mode */
export function switchAnalysisSizeMode(id) {
  Dispatcher.dispatch({actionType: Constants.SWITCH_ANALYSIS_SIZE_MODE, id: id});
}

/** Toggle the company condensed-ness */
export function toggleCondensedCompanies() {
  Dispatcher.dispatch({actionType: Constants.TOGGLE_CONDENSED_COMPANIES});
}
