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

import _Store     from './_Store';
import Dispatcher from '../Dispatcher';
import Constants  from '../constants/Constants';
import assign     from 'object-assign';
import clone      from 'clone';
import moment     from 'moment';

var _strings = {};
// initialize current date at today
var _currentDate = moment();

/** @type {Array} The companies that are selected. Initialized blank unless passed in via URL */
var _matchTake2 = /[&?]articles=([^&]+)/.exec(location.href);
var _urlSelected = _matchTake2 && _matchTake2[1].split(',');
var _selectedCompanies = _urlSelected || [];

// let the hackery commence, if there are symbols specified and forcebubbles is true,
// select all of them by default
// if (_forceBubbles && _urlCompanies.length) {
//   _selectedCompanies = _urlCompanies;
// }

/**
 * Set a new selected color mode
 */
function selectCompany(company) {
  if (_selectedCompanies.indexOf(company) === -1) {
    _selectedCompanies.push(company);
  }
}
function removeCompany(symbol) {
  symbol = symbol._id || symbol.symbol || symbol;
  _selectedCompanies.splice(_selectedCompanies.indexOf(symbol), 1);
}

/**
 * The store we'll be exporting. Contains getter methods for
 * stock data, color modes and size modes
 */
var PageStateStore = assign({}, _Store, {
  getSelectedCompanies: function () {
    return _selectedCompanies;
  },
  getDate: function () {
    return _currentDate;
  },
  getStrings: function () {
    return _strings;
  }
});

/**
 * Handle dispatched events.
 * Currently listens to  SWITCH_ANALYSIS_COLOR_MODE, and SWITCH_ANALYSIS_SIZE_MODE
 */
Dispatcher.register(function(action) {
  switch(action.actionType) {
    case Constants.SELECT_COMPANY:
      var currentNumberOfCompanies = _selectedCompanies.length;
      selectCompany(action.symbol);
      var newNumberOfCompanies = _selectedCompanies.length;
      if (currentNumberOfCompanies !== newNumberOfCompanies) {
        PageStateStore.emitChange();
      }
      break;

    case Constants.DESELECT_COMPANY:
      removeCompany(action.symbol);
      PageStateStore.emitChange();
      break;

    case Constants.REMOVE_COMPANY:
      var prevLength = _selectedCompanies.length;
      removeCompany(action.company)
      if (_selectedCompanies.length != prevLength) {
        PageStateStore.emitChange();
      }
      break;

    // when closing the article list, clear the selected company and
    // loaded articles
    case Constants.CLOSE_ARTICLE_LIST:
      _selectedCompanies = [];
      PageStateStore.emitChange();
      break;

    case Constants.SWITCH_DATE:
      _currentDate = action.date;
      PageStateStore.emitChange();
      break;

    case Constants.STRING_DATA:
      _strings = action.strings;
      PageStateStore.emitChange();
      break;

    default:
      // no op
  }
});

export default PageStateStore;
