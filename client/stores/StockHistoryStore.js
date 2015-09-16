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
import PageStateStore from './PageStateStore';

var _stockHistoriesMap = {};

function addHistories(histories, selectedCompanies) {
  if (selectedCompanies.length) {
    for (var symbol in histories) {
      if (selectedCompanies.indexOf(symbol) > -1) {
        _stockHistoriesMap[symbol.toUpperCase()] = histories[symbol];
      }
    }
  }
}

function removeHistory(symbol){
  delete _stockHistoriesMap[symbol.toUpperCase()];
}

function clearHistories() {
  _stockHistoriesMap = {};
}

/**
 * The store we'll be exporting. Contains getter methods for
 * whether or not to display the article list, and the articles
 * themselves
 */
var StockHistoryStore = assign({}, _Store, {
  getStockHistories: function () {
    return _stockHistoriesMap;
  }
});

/**
 * Handle dispatched events.
 * Currently listens to NEWS_LOADING, NEWS_DATA, and CLOSE_ARTICLE_LIST
 */
Dispatcher.register(function(action) {
  switch(action.actionType) {
    case Constants.STOCK_HISTORY_DATA:
      addHistories(action.histories, PageStateStore.getSelectedCompanies());
      StockHistoryStore.emitChange();
      break;

    case Constants.CLOSE_ARTICLE_LIST:
      clearHistories();
      StockHistoryStore.emitChange();
      break;

    case Constants.DESELECT_COMPANY:
      removeHistory(action.symbol);
      StockHistoryStore.emitChange();
      break;
  }
});

export default StockHistoryStore;
