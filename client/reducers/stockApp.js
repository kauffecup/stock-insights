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

import moment       from 'moment';
import clone        from 'clone';
import assign       from 'object-assign';
import Constants    from '../constants/Constants';
import initialState from './initialState';

/**
 * Helper method to store the companies in the browser's local storage
 */
function _updateLocalStorage (companies) {
  localStorage.setItem(Constants.COMPANY_LOCAL_STORAGE, JSON.stringify(companies));
}

/**
 * Return the contents of our _stockData map as one flattened array
 * sorted by date containing objects with a date property and data array.
 */
function flattenStockData(stockData) {
  var stockDateArray = [];
  for (var symbol in stockData) {
    var dateArr = stockData[symbol];
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

export default function reduce (state = initialState, action) {
  switch(action.type) {
    case Constants.TOGGLE_CONDENSED_COMPANIES:
      return assign({}, state, {
        companies: assign({}, state.companies, {
          condensed: !state.companies.condensed
        })
      });
      break;

    case Constants.ADD_COMPANY:
      var newCompanies = [...state.companies.companies, action.company];
      !state.isEmbedded && _updateLocalStorage(newCompanies);
      return assign({}, state, {
        companies: assign({}, state.companies, {
          companies: newCompanies
        })
      });
      break;

    case Constants.REMOVE_COMPANY:
      var symbol = action.company.symbol || action.company;
      var stockDataMap = clone(state.stockData.map);
      delete stockDataMap[symbol];
      var newCompanies = state.companies.companies.filter(c => c !== action.company);
      !state.isEmbedded &&  _updateLocalStorage(newCompanies);
      return assign({}, state, {
        selectedCompanies: state.selectedCompanies.filter(c => c !== (action.company.symbol || action.company)),
        companies: assign({}, state.companies, {
          companies: newCompanies
        }),
        stockData: assign({}, state.stockData, {
          map: stockDataMap,
          flat: flattenStockData(stockDataMap)
        })
      });
      break;

    case Constants.SELECT_COMPANY:
      return assign({}, state, {
        selectedCompanies: [...state.selectedCompanies, action.symbol]
      });
      break;

    case Constants.DESELECT_COMPANY:
      var newCompanies = state.selectedCompanies.filter(c => c !== action.symbol);
      var newArticles = newCompanies.length ? state.articles.articles : [];
      var newEntities = newCompanies.length ? state.entities.entities : [];
      return assign({}, state, {
        selectedCompanies: state.selectedCompanies.filter(c => c !== action.symbol),
        articles: assign({}, state.articles, {
          articles: newArticles
        }),
        entities: assign({}, state.entities, {
          entities: newEntities
        })
      });
      break;

    case Constants.STOCK_PRICE_DATA:
      var stockDataMap = clone(state.stockData.map);
      for (var symbol in action.data) {
        stockDataMap[symbol] = action.data[symbol];
      }
      return assign({}, state, {
        stockData: assign({}, state.stockData, {
          map: stockDataMap,
          flat: flattenStockData(stockDataMap)
        })
      })
      break;

    case Constants.SWITCH_DATE:
      return assign({}, state, {
        currentDate: action.date
      });
      break;

    case Constants.NEWS_LOADING:
      return assign({}, state, {
        articles: assign({}, state.articles, {
          loading: true
        })
      });
      break;

    case Constants.NEWS_DATA:
      return assign({}, state, {
        articles: assign({}, state.articles, {
          loading: false,
          articles: action.news.articles
        }),
        entities: assign({}, state.entities, {
          loading: false,
          entities: action.news.entities.map(e => ({
            _id: e.text,
            value: e.count,
            colorValue: e.averageSentiment,
            symbols: e.symbols
          }))
        })
      });
      break;

    case Constants.CLOSE_ARTICLE_LIST:
      return assign({}, state, {
        selectedCompanies: [],
        articles: assign({}, state.articles, {
          loading: false,
          articles: []
        }),
        entities: assign({}, state.entities, {
          loading: false,
          entities: []
        })
      });
      break;

    case Constants.COMPANIES_LOADING:
      return assign({}, state, {
        potentialCompanies: assign({}, state.potentialCompanies, {
          status: Constants.POTENTIAL_STATUS_LOADING
        })
      });
      break;

    case Constants.COMPANY_DATA:
      return assign({}, state, {
        potentialCompanies: assign({}, state.potentialCompanies, {
          status: Constants.POTENTIAL_STATUS_RECEIVED,
          companies: action.companies
        })
      });
      break;

    case Constants.CLEAR_POTENTIAL_COMPANIES:
      return assign({}, state, {
        potentialCompanies: assign({}, state.potentialCompanies, {
          status: Constants.POTENTIAL_STATUS_CLEAR,
          companies: []
        })
      });
      break;

    case Constants.TWEETS_LOADING:
      return assign({}, state, {
        tweets: assign({}, state.tweets, {
          open: true,
          tweets: [],
          sentiment: {},
          description: {
            symbols: action.symbols,
            entity: action.entity
          }
        })
      });
      break;

    case Constants.TWEETS_DATA:
      if (state.tweets.open) {
        var tweets = action.data.tweets;
        return assign({}, state, {
          tweets: assign({}, state.tweets, {
            tweets: typeof tweets.length === 'undefined' ? [] : tweets,
            sentiment: action.data.sentiment
          })
        });
      } else {
        return state;
      }
      break;

    case Constants.CLOSE_TWEETS:
      if (state.tweets.open) {
        return assign({}, state, {
          tweets: assign({}, state.tweets, {
            open: false,
            tweets: [],
            sentiment: {},
            description: {}
          })
        });
      } else {
        return state;
      }
      break;

    case Constants.STRING_DATA:
      return assign({}, state, {
        strings: action.strings
      })
      break;

    default:
      return state;
      break;
  }
}
