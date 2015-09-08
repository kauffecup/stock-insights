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

var _stockData = {};

function addStockData(newData) {
  for (var data of newData) {
    _stockData[data.symbol] = data;
  }
}

function removeCompany(company) {
  var symbol = company.symbol || company;
  delete _stockData[symbol];
}

function flattenStockData() {
  var stockData = [];
  for (var symbol in _stockData) {
    stockData.push(_stockData[symbol]);
  }
  return stockData;
}

/**
 * The store we'll be exporting. Contains getter methods for
 * stock data
 */
var StockDataStore = assign({}, _Store, {
  getStockData: function () {
    return flattenStockData();
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

    case Constants.STOCK_PRICE_DATA:
      addStockData(action.data);
      StockDataStore.emitChange();
      break;

    default:
      // no op
  }
});

export default StockDataStore;
