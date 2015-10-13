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

import _Store         from './_Store';
import Dispatcher     from '../Dispatcher';
import Constants      from '../constants/Constants';
import assign         from 'object-assign';
import clone          from 'clone';
import PageStateStore from './PageStateStore';
import moment         from 'moment';

/** @type {Object} A map of symbols to data about that symbol */
var _stockData = {};
var _entityMap = {};

/**
 * Add stock data to our _stockData map
 */
function addStockData(newData) {
  for (var symbol in newData) {
    _stockData[symbol] = newData[symbol];
  }
}

/**
 * Clear our entity map
 */
function clearEntities() {
  _entityMap = {};
}

/**
 * Remove one symbol from our entity map
 */
function removeCompanyEntities(symbol) {
  delete _entityMap[symbol.toUpperCase()];
}

/**
 * Remove a company - Clean up all of our data structures
 */
function removeCompany(symbol) {
  var symbol = symbol.symbol || symbol;
  removeCompanyEntities(symbol);
  delete _stockData[symbol];
}

/**
 * Return the contents of our _stockData map as one flattened array
 * sorted by date containing objects with a date property and data array.
 */
function flattenStockData() {
  var stockDateArray = [];
  for (var symbol in _stockData) {
    var dateArr = _stockData[symbol];
    if (stockDateArray.length) {
      for (var i = 0; i < dateArr.length; i++) {
        var d = dateArr[i];
        stockDateArray[i].data.push({
          week_52_high: d.week_52_high,
          week_52_low: d.week_52_low,
          change: d.change,
          symbol: d.symbol,
          last: d.last,
          date: moment(d.date)
        });
      }
    } else {
      stockDateArray = dateArr.map(d => ({
        date: moment(d.date),
        data: [{
          week_52_high: d.week_52_high,
          week_52_low: d.week_52_low,
          change: d.change,
          symbol: d.symbol,
          last: d.last,
          date: moment(d.date)
        }]
      }))
    }
  }
  return stockDateArray;
}

/**
 * 
 */
function addEntities(articles, symbol) {
  var entityMap = {};
  for (var article of articles) {
    for (var {score, sentiment, text} of article.entities) {
      var cased = text.replace(/\w*/g, txt =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
      var multiplier;
      if (sentiment === 'positive') {
        multiplier = 1;
      } else if (sentiment === 'negative') {
        multiplier = -1;
      } else if (sentiment === 'neutral') {
        multiplier = 0;
      }
      if (!entityMap[cased]) {
        entityMap[cased] = [];
      }
      entityMap[cased].push(multiplier * score);
    }
  }
  _entityMap[symbol.toUpperCase()] = entityMap;
}

function reduceEntityMap() {
  var entityMap = {};
  for (var symbol in _entityMap) {
    var _smallMap = _entityMap[symbol];
    for (var entity in _smallMap) {
      if (entityMap[entity]) {
        entityMap[entity].concat(_smallMap[entity])
      } else {
        entityMap[entity] = _smallMap[entity];
      }
    }
  }
  var entities = [];
  for (var text in entityMap) {
    var __entities = entityMap[text];
    entities.push({_id: text, value: __entities.length, colorValue: __entities.reduce((s, it) => s+it, 0)/__entities.length})
  }
  return entities.sort((e1, e2) => e2.value - e1.value).slice(0, 50);
}

/**
 * The store we'll be exporting. Contains getter methods for
 * stock data, color modes and size modes
 */
var StockDataStore = assign({}, _Store, {
  getStockData: function () {
    return flattenStockData();
  },
  getEntities: function () {
    return reduceEntityMap();
  },
  getDataMap: function () {
    return _stockData;
  }
});

/**
 * Handle dispatched events.
 * Currently listens to REMOVE_COMPANY and STOCK_PRICE_DATA
 */
Dispatcher.register(function(action) {
  switch(action.actionType) {
    // remove a company
    case Constants.REMOVE_COMPANY:
      removeCompany(action.company);
      StockDataStore.emitChange();
      break;

    // add stock data to our map
    case Constants.STOCK_PRICE_DATA:
      addStockData(action.data);
      StockDataStore.emitChange();
      break;

    case Constants.NEWS_DATA:
      var scs = PageStateStore.getSelectedCompanies();
      if (scs.length && scs.indexOf(action.news.symbol.toUpperCase()) > -1) {
        addEntities(action.news.news, action.news.symbol);
        StockDataStore.emitChange();
      }
      break;

    case Constants.CLOSE_ARTICLE_LIST:
      clearEntities();
      StockDataStore.emitChange();
      break;

    case Constants.DESELECT_COMPANY:
      removeCompanyEntities(action.symbol);
      StockDataStore.emitChange();
      break;

    default:
      // no op
  }
});

export default StockDataStore;
