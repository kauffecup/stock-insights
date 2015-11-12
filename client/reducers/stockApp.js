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

import moment    from 'moment';
import Constants from '../constants/Constants';
import assign    from 'object-assign';

/** @type {String} The local storage key */
const LOCAL_STORAGE_KEY = 'COMPANY_LOCAL_STORAGE';

/** @type {Array.<Companies>} The array of companies initialized from url param or local storage */
var _companies;
/** Configure the companies either from the url or from local storage */
var match = /[&?]symbols=([^&]+)/.exec(location.href);
var urlCompanies = match && match[1].split(',');
var setFromUrlParam = urlCompanies && urlCompanies.length;
if (setFromUrlParam) {
  _companies = urlCompanies.map(c => ({
    symbol: c
  }));
} else {
  _companies = localStorage.getItem(LOCAL_STORAGE_KEY);
  _companies = _companies ? JSON.parse(_companies) : [];
}

/** @type {Boolean} If we're running embedded or not. Right now determined by setting symbols in the URL */
var _match = /[&?]symbols=([^&]+)/.exec(location.href);
var _urlCompanies = _match && _match[1].split(',');
var _isEmbedded = _urlCompanies && _urlCompanies.length;

/** @type {Array} The companies that are selected. Initialized blank unless passed in via URL */
var _matchTake2 = /[&?]articles=([^&]+)/.exec(location.href);
var _urlSelected = _matchTake2 && _matchTake2[1].split(',');
var _selectedCompanies = _urlSelected || [];

/** @type {string} can force a language by specifying it in the url */
var _matchTake3 = /[&?]language=([^&]+)/.exec(location.href);
var _language = _matchTake3 && _matchTake3[1];

/** @type {boolean} if we want to see the articles and the stock color bubbles */
var _matchTake4 = /[&?]forcebubbles=([^&]+)/.exec(location.href);
var _forceBubbles = _matchTake4 && (_matchTake4[1] === 'true' || _matchTake4[1] === '1');

// let the hackery commence, if there are symbols specified and forcebubbles is true,
// select all of them by default
if (_forceBubbles && _urlCompanies.length) {
  _selectedCompanies = _urlCompanies;
}

/**
 * Helper method to store the companies in the browser's local storage
 */
function _updateLocalStorage (companies) {
  if (!setFromUrlParam) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(companies));
  }
}

const defaultState = {
  isEmbedded: _isEmbedded,
  language: _language,
  forceBubbles: _forceBubbles,
  strings: {},
  currentDate: moment(),
  potentialCompanies: {
    status: Constants.POTENTIAL_STATUS_CLEAR,
    companies: []
  },
  companies: {
    condensed: false,
    companies: _companies
  },
  entities: [],
  stockData: {
    flat: [],
    map: {}
  },
  selectedCompanies: _selectedCompanies,
  articles: []
}


export default function reduce (state = defaultState, action) {
  switch(action.type) {
    case Constants.ADD_COMPANY:
      var newCompanies = [...state.companies.companies, action.company];
      _updateLocalStorage(newCompanies);
      return assign({}, state, {
        companies: {
          condensed: state.companies.condensed,
          companies: newCompanies
        }
      });
      break;

    case Constants.REMOVE_COMPANY:
      // filter returns a new array, so we all good hurrr
      var newCompanies = state.companies.companies.filter(c => c !== action.company);
      _updateLocalStorage(newCompanies);
      return assign({}, state, {
        companies: {
          condensed: state.companies.condensed,
          companies: newCompanies
        }
      });
      break;

    default:
      return state;
      break;
  }
}
