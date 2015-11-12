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

import _Store     from'./_Store';
import Dispatcher from'../Dispatcher';
import Constants  from'../constants/Constants';
import assign     from'object-assign';

/** @type {String} The local storage key */
const LOCAL_STORAGE_KEY = 'COMPANY_LOCAL_STORAGE';
/** @type {Array.<Companies>} The array of potential companies (for autocomplete) */
var _potentialCompanies = [];
/** @type {Boolean} Whether or not we're loading potential companies */
var _loadingStatus = Constants.POTENTIAL_STATUS_CLEAR;

/**
 * The store we'll be exporting. Contains getter methods for
 * companies, potential companies, and loading status.
 */
var CompaniesStore = assign({}, _Store, {
  getPotentialCompanies: function () {
    return _potentialCompanies;
  },

  getLoadingStatus: function () {
    return _loadingStatus;
  }
});

/**
 * Handle dispatched events.
 * Currently listens to COMPANY_DATA, CLEAR_POTENTIAL_COMPANIES,
 * ADD_COMPANY, and REMOVE_COMPANY
 */
Dispatcher.register(function(action) {
  switch(action.actionType) {
    // set the loading status... when we're uh... loading
    case Constants.COMPANIES_LOADING:
      _loadingStatus = Constants.POTENTIAL_STATUS_LOADING;
      CompaniesStore.emitChange();
      break;

    // when we get the company data, set our potential companies
    case Constants.COMPANY_DATA:
      _loadingStatus = Constants.POTENTIAL_STATUS_RECEIVED;
      _potentialCompanies = action.companies;
      CompaniesStore.emitChange();
      break;

    // clear the potential companies
    case Constants.CLEAR_POTENTIAL_COMPANIES:
      _loadingStatus = Constants.POTENTIAL_STATUS_CLEAR;
      _potentialCompanies = [];
      CompaniesStore.emitChange();
      break;

    default:
      // no op
  }
});

export default CompaniesStore;
