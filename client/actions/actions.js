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

/** Toggle a company's selected-ness */
export function toggleSelect(symbol) {
  return (dispatch, getState) => {
    symbol = symbol.symbol || symbol;
    var { selectedCompanies, language } = getState();
    if (selectedCompanies.indexOf(symbol) === -1) {
      dispatch({type: Constants.SELECT_COMPANY, symbol: symbol});
    } else {
      dispatch({type: Constants.DESELECT_COMPANY, symbol: symbol});
    }
    selectedCompanies = getState().selectedCompanies;
    return _getNews(selectedCompanies, language, dispatch);
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
    dispatch({type: Constants.REMOVE_COMPANY, company: company});
    var { selectedCompanies, language } = getState();
    return _getNews(selectedCompanies, language, dispatch);
  }
}

/** Helper method - fetch stock news for an array of companies */
function _getNews(companies, language, dispatch) {
  if (companies.length) {
    dispatch({ type: Constants.NEWS_LOADING });
    return stockNews(companies, language).then(news => {
      return dispatch({ type: Constants.NEWS_DATA, news: news });
    }).catch(e => {
      return dispatch({ type: Constants.NEWS_ERROR });
    });
  }
}
