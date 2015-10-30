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
import moment         from 'moment';

/** @type {Object} A map of symbols to data about that symbol */
var _entities = [];
var _stockData = {};

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
  _entities = [];
}

/**
 * Remove a company - Clean up all of our data structures
 */
function removeCompany(symbol) {
  var symbol = symbol.symbol || symbol;
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
 * Map the entities into a format consumable by the react chart
 */
function addEntities(entities) {
  _entities = entities.map(e => ({
    _id: e.text,
    value: e.count,
    colorValue: e.averageSentiment
  }))
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
    return _entities;
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
      addEntities(action.news.entities);
      StockDataStore.emitChange();
      break;

    case Constants.CLOSE_ARTICLE_LIST:
      clearEntities();
      StockDataStore.emitChange();
      break;

    case Constants.DESELECT_COMPANY:
      _entities = [];
      StockDataStore.emitChange();
      break;

    default:
      // no op
  }
});

export default StockDataStore;
