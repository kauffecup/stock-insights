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
  return { type: Constants.ADD_COMPANY, company: company };
  // company.symbol && getStockData(company.symbol);
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
