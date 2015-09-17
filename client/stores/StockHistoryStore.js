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

var _stockHistoriesMap = {};
var _dateHistories = [];

/**
 * Build both the stock histories map and the date histories
 * array from the server response.
 */
function addHistories(histories) {
  for (var symbol in histories) {
    var dateArr = histories[symbol];
    _stockHistoriesMap[symbol.toUpperCase()] = dateArr;
    if (_dateHistories.length) {
      for (var i = 0; i < _dateHistories.length; i++) {
        var daa = clone(dateArr[i]);
        delete daa.symbol;
        delete daa.date;
        _dateHistories[i].valueMap[dateArr[i].symbol] = daa;
      }
    } else {
      _dateHistories = dateArr.map(a => {
        var aa = clone(a);
        delete aa.symbol;
        delete aa.date;
        var valueMap = {};
        valueMap[a.symbol] = aa;
        return {
          date: a.date,
          valueMap: valueMap
        }
      });
    }
  }
}

function removeCompany(symbol) {
  var symbol = symbol.symbol || symbol;
  delete _stockHistoriesMap[symbol.toUpperCase()];
  for (var i = 0; i < _dateHistories.length; i++) {
    delete _dateHistories[i].valueMap[symbol.toUpperCase()];
  }
}

/**
 * The store we'll be exporting. Contains getter methods for
 * the stock histories map and date array
 */
var StockHistoryStore = assign({}, _Store, {
  getStockHistories: function () {
    return _stockHistoriesMap;
  },
  getHistoriesByDate: function () {
    return _dateHistories;
  }
});

/**
 * Handle dispatched events.
 * Currently listens to STOCK_HISTORY_DATA and REMOVE_COMPANY
 */
Dispatcher.register(function(action) {
  switch(action.actionType) {
    case Constants.STOCK_HISTORY_DATA:
      addHistories(action.histories);
      StockHistoryStore.emitChange();
      break;

    // remove a company
    case Constants.REMOVE_COMPANY:
      removeCompany(action.company);
      StockHistoryStore.emitChange();
      break;
  }
});

export default StockHistoryStore;
