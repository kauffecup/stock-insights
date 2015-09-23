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
/** @type {Array.<Companies>} The array of companies initialized from url param or local storage */
var _companies;
/** @type {Boolean} Whether or not we're loading potential companies */
var _loadingStatus = Constants.POTENTIAL_STATUS_CLEAR;

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

/**
 * Add a company to our _companies array
 */
function addCompany(newCompany) {
  _companies.push(newCompany);
  _updateLocalStorage();
}

/**
 * Remove a company from our _companies array
 */
function removeCompany(company) {
  _companies = _companies.filter(c => (
    c !== company
  ));
  _updateLocalStorage();
}

function setLoadingStatus(newStatus) {
  _loadingStatus = newStatus;
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
  if (!setFromUrlParam) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(_companies));
  }
}

/**
 * Helper method to clear the browser's local storage
 */
function _clearLocalStorage () {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

/**
 * The store we'll be exporting. Contains getter methods for
 * companies, potential companies, and loading status.
 */
var CompaniesStore = assign({}, _Store, {
  getCompanies: function () {
    return _companies;
  },

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
      setLoadingStatus(Constants.POTENTIAL_STATUS_LOADING);
      CompaniesStore.emitChange();
      break;

    // when we get the company data, set our potential companies
    case Constants.COMPANY_DATA:
      setLoadingStatus(Constants.POTENTIAL_STATUS_RECEIVED);
      setPotentialCompanies(action.companies);
      CompaniesStore.emitChange();
      break;

    // clear the potential companies
    case Constants.CLEAR_POTENTIAL_COMPANIES:
      setLoadingStatus(Constants.POTENTIAL_STATUS_CLEAR);
      setPotentialCompanies([]);
      CompaniesStore.emitChange();
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
