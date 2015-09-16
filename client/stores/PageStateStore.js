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

var _selectedCompanies = [];

/** @type {Boolean} When condensed, only display the ticker symbol */
var _condensedCompanies = false;

/** @type {String} The id for the current selected color mode */
var _selectedColorMode = '_am_color_change';
/** @type {Array} The possible color modes - each has a label and id */
var _analysisColorModes = [{
  label: 'Today\'s Change',
  id: '_am_color_change'
}, {
  label: 'Current Value Relative to 52 Week',
  id: '_am_color_52week'
}];

/** @type {Boolean} If we're running embedded or not. Right now determined by setting symbols in the URL */
var _match = /[&?]symbols=([^&]+)/.exec(location.href);
var _urlCompanies = _match && _match[1].split(',');
var _isEmbedded = _urlCompanies && _urlCompanies.length;

/**
 * Set a new selected color mode
 */
function setSelectedColorMode(newMode) {
  _selectedColorMode = newMode;
}
function toggleCondensedCompanies() {
  _condensedCompanies = !_condensedCompanies;
}
function selectCompany (company) {
  _selectedCompanies.push(company);
}
function clearCompanies () {
  _selectedCompanies = [];
}
function removeCompany (symbol) {
  _selectedCompanies.splice(_selectedCompanies.indexOf(symbol), 1);
}

/**
 * The store we'll be exporting. Contains getter methods for
 * stock data, color modes and size modes
 */
var PageStateStore = assign({}, _Store, {
  getEmbeddedMode: function () {
    return !!_isEmbedded;
  },

  getCondensedCompanies: function () {
    return _condensedCompanies;
  },

  getAnalysisColorModes: function () {
    return _analysisColorModes.map((am => {
      var amr = clone(am);
      amr.selected = amr.id === _selectedColorMode;
      return amr;
    }));
  },
  getCurrentAnalysisColorMode: function () {
    return _selectedColorMode;
  },
  getSelectedCompanies: function () {
    return _selectedCompanies
  }
});

/**
 * Handle dispatched events.
 * Currently listens to  SWITCH_ANALYSIS_COLOR_MODE, and SWITCH_ANALYSIS_SIZE_MODE
 */
Dispatcher.register(function(action) {
  switch(action.actionType) {
    // change the selected color mode
    // only emit a change if something has changed
    case Constants.SWITCH_ANALYSIS_COLOR_MODE:
      if (action.id !== _selectedColorMode) {
        setSelectedColorMode(action.id);
        PageStateStore.emitChange();
      }
      break;

    // toggle the state of the company chiclets
    case Constants.TOGGLE_CONDENSED_COMPANIES:
      toggleCondensedCompanies();
      PageStateStore.emitChange();
      break;

    case Constants.SELECT_COMPANY:
      selectCompany(action.symbol);
      PageStateStore.emitChange();
      break;

    case Constants.DESELECT_COMPANY:
      removeCompany(action.symbol);
      PageStateStore.emitChange();
      break;

    // when closing the article list, clear the selected company and
    // loaded articles
    case Constants.CLOSE_ARTICLE_LIST:
      clearCompanies();
      PageStateStore.emitChange();
      break;

    default:
      // no op
  }
});

export default PageStateStore;
