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

/** Configure the companies either from the url or from local storage */
var symbols = /[&?]symbols=([^&]+)/.exec(location.href);
symbols = symbols && symbols[1].split(',');
/** @type {Boolean} If we're running embedded or not. Right now determined by setting symbols in the URL */
var isEmbedded = symbols && symbols.length;
/** @type {Array.<Companies>} The array of companies initialized from url param or local storage */
var companies;
if (isEmbedded) {
  companies = symbols.map(c => ({ symbol: c }) );
} else {
  companies = localStorage.getItem(Constants.COMPANY_LOCAL_STORAGE);
  companies = companies ? JSON.parse(companies) : [];
}

/** @type {Array} The companies that are selected. Initialized blank unless passed in via URL */
var selectedCompanies = /[&?]articles=([^&]+)/.exec(location.href);
selectedCompanies = (selectedCompanies && selectedCompanies[1].split(',')) || [];

/** @type {string} can force a language by specifying it in the url */
var language = /[&?]language=([^&]+)/.exec(location.href);
language = language && language[1];

/** @type {boolean} if we want to see the articles and the stock color bubbles */
var forcebubbles = /[&?]forcebubbles=([^&]+)/.exec(location.href);
forcebubbles = forcebubbles && (forcebubbles[1] === 'true' || forcebubbles[1] === '1');

/** let the hackery commence, if there are symbols specified and forcebubbles is true,
  * select all of them by default */
if (forcebubbles && companies.length) {
  selectedCompanies = companies.map(c => c.symbol || c);
}

export default {
  isEmbedded: isEmbedded,
  language: language,
  forceBubbles: forcebubbles,
  strings: {},
  currentDate: moment(),
  selectedCompanies: selectedCompanies,
  companies: {
    condensed: false,
    companies: companies
  },
  potentialCompanies: {
    status: Constants.POTENTIAL_STATUS_CLEAR,
    companies: []
  },
  entities: {
    loading: false,
    entities: []
  },
  stockData: {
    map: {},
    flat: []
  },
  articles: {
    loading: false,
    articles:[]
  },
  tweets: {
    open: false,
    tweets: [],
    sentiment: {},
    description: {}
  }
}
