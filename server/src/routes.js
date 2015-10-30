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
import gaas         from 'gaas';
import locale       from 'locale';
import vcapServices from './vcapServices';

var router = express.Router();
var gaasClient = gaas.getClient({credentials: vcapServices.globalization.credentials});
var gaasStock = Promise.promisifyAll(gaasClient.project('stockinsights'));
var request = Promise.promisifyAll(require('request'));

var supportedLocales = new locale.Locales([
  'en', 'zh-Hant', 'zh-Hans', 'fr', 'de', 'it', 'ja', 'pt-br', 'es'
]);

/* GET strings. */
var stringCache = {};
router.get('/strings', (req, res) => {
  // if a language is specified in the request, prioritize that
  var locales = new locale.Locales(req.headers['accept-language']);
  var langCode = req.query.language || locales.best(supportedLocales).code;
  // first we check our cache - if there return immediately
  if (stringCache[langCode]) {
    res.json(stringCache[langCode]);
  // otherwise we're gonna go off to the globalization service
  // once we get the new data object, we hold on to it for quicker
  // second requests
  } else {
    gaasStock.getResourceDataAsync({
      languageID: langCode
    }).then(([{data}, body]) => {
      stringCache[langCode] = data;
      res.json(data);
    }).catch(e => {
      res.status(500);
      res.json(e);
    });
  }
});

/* Company Lookup. query takes company */
router.get('/companylookup', (req, res) => {
  var company = req.query.company;
  var {client_id, client_secret, url} = vcapServices.companyLookup.credentials;
  return _doGet(url, '/markets/find', {client_id: client_id, name: company}, res);
});

/* Stock News. query takes symbol */
router.get('/stocknews', (req, res) => {
  // if a language is specified in the request, prioritize that
  var locales = new locale.Locales(req.headers['accept-language']);
  var langCode = req.query.language || locales.best(supportedLocales).code;
  var symbol = req.query.symbol;
  var {client_id, client_secret, url} = vcapServices.stockNews.credentials;
  return _doGet(url, '/news/find', {client_id: client_id, symbol: symbol, language: langCode}, res);
});

/* Stock Price. query takes symbols */
router.get('/stockprice', (req, res) => {
  var symbols = req.query.symbols;

  var {client_id: client_id1, client_secret: client_secret1, url: url1} = vcapServices.stockPrice.credentials;
  var {client_id: client_id2, client_secret: client_secret2, url: url2} = vcapServices.stockHistory.credentials;

  var priceArgs, historyArgs;
  if (vcapServices.BYPASS_URL) {
    var auth = "Basic " + new Buffer(vcapServices.BYPASS_UN + ":" + vcapServices.BYPASS_PW).toString('base64');
    priceArgs = {url: vcapServices.BYPASS_URL + '/markets/quote', headers: {Authorization: auth}, qs: {symbols: symbols}};
    historyArgs = {url: vcapServices.BYPASS_URL + '/markets/history', headers: {Authorization: auth}, qs: {symbols: symbols}};
  } else {
    priceArgs = {url: url1 + '/markets/quote',   qs: {client_id: client_id1, symbols: symbols}};
    historyArgs = {url: url2 + '/markets/history', qs: {client_id: client_id2, symbols: symbols}};
  }
  var pricePromise   = request.getAsync(priceArgs);
  var historyPromise = request.getAsync(historyArgs);

  Promise.join(pricePromise, historyPromise, ([pR, pB], [hR, hB]) => {
    pB = (!!pB && typeof pB === 'string') ? JSON.parse(pB) : pB;
    hB = (!!hB && typeof hB === 'string') ? JSON.parse(hB) : hB;

    // build a map of symbol -> price objects
    var priceMap = {};
    for (var price of pB) {
      priceMap[price.symbol] = price;
    }

    // if all of the current change values are falsy, we'll want to use yesterday's
    var usePreviousChangeValues = pB.every(p => !p.change);

    // iterate over the history map and convert to expected data type
    // additionallyalally, add today's price values to the array in one nice
    // happy array family
    for (var symbol in hB) {
      var price = priceMap[symbol];
      hB[symbol] = hB[symbol].map(h => ({
        change: h.close - h.open,
        symbol: symbol,
        last: h.close,
        date: h.date,
        week_52_high: price.week_52_high,
        week_52_low: price.week_52_low
      }));
      var d = new Date();
      var previousSymbol = hB[symbol][hB[symbol].length-1];
      hB[symbol].push({
        change: usePreviousChangeValues ? previousSymbol.change : price.change,
        symbol: symbol,
        last: price.last,
        date: '' + d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate(),
        week_52_high: price.week_52_high,
        week_52_low: price.week_52_low
      });
    }
    res.json(hB);
  }).catch(e => {
    console.error(e);
    res.status(500);
    res.json(e);
  });
});

/* Sentiment. query takes symbol and/or entity */
router.get('/sentiment', (req, res) => {
  var {symbol, entity} = req.query;
  var {client_id, client_secret, url} = vcapServices.stockSentiment.credentials;
  return _doGet(url, '/sentiment/find', {client_id: client_id, symbol: symbol, entity: entity}, res);
});

/* Helper GET method for companylookup and stockprice similarities */
function _doGet(baseUrl, extension, qs, res) {
  var args;
  if (vcapServices.BYPASS_URL) {
    delete qs.client_id;
    var auth = "Basic " + new Buffer(vcapServices.BYPASS_UN + ":" + vcapServices.BYPASS_PW).toString('base64');
    args = {url: vcapServices.BYPASS_URL + extension, headers: {Authorization: auth}, qs: qs};
  } else {
    args = {url: baseUrl + extension, qs: qs};
  }
  return request.getAsync(args).then(([response, body]) => {
    var parsedResponse = (!!body && typeof body === 'string') ? JSON.parse(body) : body;
    parsedResponse.httpCode && res.status(parseInt(parsedResponse.httpCode));
    res.json(parsedResponse);
  }).catch(e => {
    res.status(500);
    res.json(e);
  });
}

// ----------------------------------------------------------------------
// ---------------------- Start Endpoints for Demo ----------------------
// ----------------------------------------------------------------------

/** Get stocks with positive change from a list of symbols, sorted by change */
router.get('/demo/positive', (req, res) => {
  var symbols = req.query.symbols || req.query.symbol;

  var {client_id: client_id1, client_secret: client_secret1, url: url1} = vcapServices.stockPrice.credentials;
  var {client_id: client_id2, client_secret: client_secret2, url: url2} = vcapServices.stockHistory.credentials;

  var pricePromise   = request.getAsync({url: url1 + '/markets/quote',   qs: {client_id: client_id1, symbols: symbols}});
  var historyPromise = request.getAsync({url: url1 + '/markets/history', qs: {client_id: client_id2, symbols: symbols}});

  Promise.join(pricePromise, historyPromise, ([pR, pB], [hR, hB]) => {
    pB = (!!pB && typeof pB === 'string') ? JSON.parse(pB) : pB;
    hB = (!!hB && typeof hB === 'string') ? JSON.parse(hB) : hB;

    // if all of the current change values are falsy, we'll want to use yesterday's
    var usePreviousChangeValues = pB.every(p => !p.change);

    var prevSymbolMap = {};
    for (var symbol in hB) {
      var prevSymbol = hB[symbol][hB[symbol].length-1];
      prevSymbolMap[symbol] = prevSymbol.close - prevSymbol.open;
    }

    res.json(pB.map(s => ({
      change: usePreviousChangeValues ? prevSymbolMap[s.symbol] : s.change,
      symbol: s.symbol,
      description: s.description,
      value: s.value
    }))
    .filter(s => s.change > 0)
    .sort((s1, s2) => s2.change - s1.change));
  }).catch(e => {
    console.error(e);
    res.status(500);
    res.json(e);
  });
});

/** Get stocks with negative change from a list of symbols, sorted by change */
router.get('/demo/negative', (req, res) => {
  var symbols = req.query.symbols || req.query.symbol;

  var {client_id: client_id1, client_secret: client_secret1, url: url1} = vcapServices.stockPrice.credentials;
  var {client_id: client_id2, client_secret: client_secret2, url: url2} = vcapServices.stockHistory.credentials;

  var priceArgs, historyArgs;
  if (vcapServices.BYPASS_URL) {
    var auth = "Basic " + new Buffer(vcapServices.BYPASS_UN + ":" + vcapServices.BYPASS_PW).toString('base64');
    priceArgs = {url: vcapServices.BYPASS_URL + '/markets/quote', headers: {Authorization: auth}, qs: {symbols: symbols}};
    historyArgs = {url: vcapServices.BYPASS_URL + '/markets/history', headers: {Authorization: auth}, qs: {symbols: symbols}};
  } else {
    priceArgs = {url: url1 + '/markets/quote',   qs: {client_id: client_id1, symbols: symbols}};
    historyArgs = {url: url2 + '/markets/history', qs: {client_id: client_id2, symbols: symbols}};
  }
  var pricePromise   = request.getAsync(priceArgs);
  var historyPromise = request.getAsync(historyArgs);

  Promise.join(pricePromise, historyPromise, ([pR, pB], [hR, hB]) => {
    pB = (!!pB && typeof pB === 'string') ? JSON.parse(pB) : pB;
    hB = (!!hB && typeof hB === 'string') ? JSON.parse(hB) : hB;

    // if all of the current change values are falsy, we'll want to use yesterday's
    var usePreviousChangeValues = pB.every(p => !p.change);

    var prevSymbolMap = {};
    for (var symbol in hB) {
      var prevSymbol = hB[symbol][hB[symbol].length-1];
      prevSymbolMap[symbol] = prevSymbol.close - prevSymbol.open;
    }

    res.json(pB.map(s => ({
      change: usePreviousChangeValues ? prevSymbolMap[s.symbol] : s.change,
      symbol: s.symbol,
      description: s.description,
      value: s.value
    }))
    .filter(s => s.change < 0)
    .sort((s1, s2) => s1.change - s2.change));
  }).catch(e => {
    console.error(e);
    res.status(500);
    res.json(e);
  });
});

/** Get an array of entities w/ average sentiment sorted by count about a company or list of companies */
router.get('/demo/entities', (req, res) => {
  // if the user passes in a language, use that otherwise get it from the request header
  var locales = new locale.Locales(req.headers['accept-language']);
  var langCode = req.query.language || locales.best(supportedLocales).code;
  var {client_id, client_secret, url} = vcapServices.stockSentiment.credentials;
  // companies can be in symbol or symbols field
  var symbols = req.query.symbol || req.query.symbols;

  var args;
  if (vcapServices.BYPASS_URL) {
    var auth = "Basic " + new Buffer(vcapServices.BYPASS_UN + ":" + vcapServices.BYPASS_PW).toString('base64');
    args = {url: vcapServices.BYPASS_URL + '/news/find', headers: {Authorization: auth}, qs: {
      symbols: symbols, language: langCode, elimit: 50, alimit: 0
    }};
  } else {
    args = {url: url + '/news/find', qs: {
      client_id: client_id, symbols: symbols, language: langCode, elimit: 50, alimit: 0
    }}
  }
  // request time!
  request.getAsync(args).then(([eaRequest, eaBody]) => {
    eaBody = (!!eaBody && typeof eaBody === 'string') ? JSON.parse(eaBody) : eaBody;
    res.json(eaBody.entities);
  }).catch(e => {
    res.status(500);
    res.json(e);
  });
});

/** Get an array of articles + relations for a company or list of companies */
router.get('/demo/articles', (req, res) => {
  // if the user passes in a language, use that otherwise get it from the request header
  var locales = new locale.Locales(req.headers['accept-language']);
  var langCode = req.query.language || locales.best(supportedLocales).code;
  var {client_id, client_secret, url} = vcapServices.stockSentiment.credentials;
  // companies can be in symbol or symbols field
  var symbols = req.query.symbol || req.query.symbols;
  var args;
  if (vcapServices.BYPASS_URL) {
    var auth = "Basic " + new Buffer(vcapServices.BYPASS_UN + ":" + vcapServices.BYPASS_PW).toString('base64');
    args = {url: vcapServices.BYPASS_URL + '/news/find', headers: {Authorization: auth}, qs: {
      symbols: symbols, language: langCode, elimit: 50, alimit: 0
    }};
  } else {
    args = {url: url + '/news/find', qs: {
      client_id: client_id, symbols: symbols, language: langCode, elimit: 50, alimit: 0
    }};
  }
  // request time!
  request.getAsync(args).then(([eaRequest, eaBody]) => {
    eaBody = (!!eaBody && typeof eaBody === 'string') ? JSON.parse(eaBody) : eaBody;
    res.json(eaBody.articles);
  }).catch(e => {
    res.status(500);
    res.json(e);
  });
});

export default router;
