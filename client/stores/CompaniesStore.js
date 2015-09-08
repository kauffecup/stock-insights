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
/** @type {Array.<Companies>} The array of companies initialized from local storage */
var _companies = localStorage.getItem(LOCAL_STORAGE_KEY);
_companies = _companies ? JSON.parse(_companies) : [];
/** @type {Array.<Companies>} The array of potential companies (for autocomplete) */
var _potentialCompanies = [];

/**
 * Add a company to our _companies array
 */
function addCompany (newCompany) {
  _companies.push(newCompany);
  _updateLocalStorage();
}

/**
 * Remove a company from our _companies array
 */
function removeCompany (company) {
  _companies = _companies.filter(c => (
    c !== company
  ));
  _updateLocalStorage();
}

/**
 * After we get our server response, populate the potential companies
 * for the autocomplete drop down
 */
function setPotentialCompanies (newPotentials) {
  _potentialCompanies = newPotentials;
}

/**
 * Helper method to store the companies in the browser's local storage
 */
function _updateLocalStorage () {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(_companies));
}

/**
 * Helper method to clear the browser's local storage
 */
function _clearLocalStorage () {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

/**
 * The store we'll be exporting. Contains getter methods for
 * companies and potential companies.
 */
var CompaniesStore = assign({}, _Store, {
  getCompanies: function () {
    return _companies;
  },

  getPotentialCompanies: function () {
    return _potentialCompanies;
  }
});

/**
 * Handle dispatched events.
 * Currently listens to COMPANY_DATA, CLEAR_POTENTIAL_COMPANIES,
 * ADD_COMPANY, and REMOVE_COMPANY
 */
Dispatcher.register(function(action) {
  switch(action.actionType) {
    // when we get the company data, set our potential companies
    case Constants.COMPANY_DATA:
      setPotentialCompanies(action.companies);
      CompaniesStore.emitChange();
      break;

    // clear the potential companies. only do so if they're
    // not already empty
    case Constants.CLEAR_POTENTIAL_COMPANIES:
      if (_potentialCompanies.length) {
        setPotentialCompanies([]);
        CompaniesStore.emitChange();
      }
      break;

    // add a company
    case Constants.ADD_COMPANY:
      addCompany(action.company);
      CompaniesStore.emitChange();
      break;

    // remove a company
    case Constants.REMOVE_COMPANY:
      removeCompany(action.company);
      CompaniesStore.emitChange();
      break;

    default:
      // no op
  }
});

export default CompaniesStore;
