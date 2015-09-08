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

import express      from 'express';
import path         from 'path';
import Promise      from 'bluebird';
import vcapServices from './vcapServices';
var router = express.Router();
var request = Promise.promisify(require('request'));
Promise.promisifyAll(request);

/**
 * An object that we'll cache stock prices in.
 * @type {
 *         symbol: {
 *           timestamp: number, // when we cached the data
 *           data: Object       // the data we get back from our endpoint
 *         }
 *       }
 */
var _stockPriceCache = {};

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index');
});

/* Company Lookup */
router.get('/companylookup', (req, res) => {
  var company = req.query.company;
  var {client_id, client_secret, url} = vcapServices.companyLookup.credentials;
  return _doGet(url + '/markets/find', {client_id: client_id, name: company}, res);
});

/* Stock News */
router.get('/stocknews', (req, res) => {
  var symbol = req.query.symbol;
  var {client_id, client_secret, url} = vcapServices.stockPrice.credentials;
  return _doGet(url + '/news/find', {client_id: client_id, symbol: symbol}, res);
});

/* Stock Price. Holds on to a value for each stock for 10m */
router.get('/stockprice', (req, res) => {
  _pruneStockPriceCache();

  // initialize the response with what we already have in our
  // 10 minute cache
  var futureResponse = [];
  var symbols = req.query.symbols.split(',');
  for (var symbol of symbols) {
    if (_stockPriceCache[symbol]) {
      futureResponse.push(_stockPriceCache[symbol].data);
    }
  }

  // build an array of promises tracking the requests for each of the stocks that
  // we don't have yet
  var stockPromises = [];
  var symbolsToLookUp = symbols.filter(s => !_stockPriceCache[s]);
  var {client_id, client_secret, url} = vcapServices.stockPrice.credentials;
  for (var symbol of symbolsToLookUp) {
    stockPromises.push(request.getAsync({
      url: url + '/markets/quote',
      qs: {client_id: client_id, symbol: symbol}
    }));
  }

  // once all of the promises resolve, add the new data to our response array,
  // and cache it for later
  Promise.all(stockPromises).then(stockResponses => {
    for (var [response, body] of stockResponses) {
      var parsedResponse = typeof body === 'string' ? JSON.parse(body) : body;
      futureResponse.push(parsedResponse);
      _stockPriceCache[parsedResponse.symbol] = {
        time: new Date().getTime(),
        data: parsedResponse
      }
    }
    res.json(futureResponse);
  }).catch(e => {
    res.status(500);
    res.json(e);
  })
});

/* Helper GET method for companylookup and stockprice similarities */
function _doGet(url, qs, res) {
  return request.getAsync({url: url, qs: qs}).then(([response, body]) => {
    var parsedResponse = typeof body === 'string' ? JSON.parse(body) : body;
    parsedResponse.httpCode && res.status(parseInt(parsedResponse.httpCode));
    res.json(parsedResponse);
  }).catch(e => {
    res.status(500);
    res.json(e);
  });
}

/* Helper method to remove anything older than 10m from the cache */
function _pruneStockPriceCache() {
  var currentTime = new Date().getTime();
  for (var stock in _stockPriceCache) {
    var cachedData = _stockPriceCache[stock];
    if (currentTime - cachedData.time > 10*60*1000) {
      delete _stockPriceCache[stock];
    }
  }
}

export default router;
