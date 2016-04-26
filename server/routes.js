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
'use strict';

const express      = require('express');
const Promise      = require('bluebird');
const g11nPipeline = require('g11n-pipeline');
const locale       = require('locale');
const vcapServices = require('./vcapServices');

const router = new express.Router();
const gpClient = g11nPipeline.getClient({credentials: vcapServices.globalization.credentials});
const gpStrings = Promise.promisifyAll(gpClient.bundle('stock_strings'));
const request = Promise.promisifyAll(require('request'));

const supportedLocales = new locale.Locales([
  'en', 'zh-Hant', 'zh-Hans', 'fr', 'de', 'it', 'ja', 'pt-br', 'es'
]);

/* GET strings. */
const stringCache = {};
router.get('/strings', (req, res) => {
  // if a language is specified in the request, prioritize that
  const locales = new locale.Locales(req.headers['accept-language']);
  const langCode = req.query.language || locales.best(supportedLocales).code;
  // first we check our cache - if there return immediately
  if (stringCache[langCode]) {
    res.json(stringCache[langCode]);
  // otherwise we're gonna go off to the globalization service
  // once we get the new data object, we hold on to it for quicker
  // second requests
  } else {
    gpStrings.getStringsAsync({
      languageId: langCode
    }).then(({resourceStrings}) => {
      stringCache[langCode] = resourceStrings;
      res.json(resourceStrings);
    }).catch(e => {
      res.status(500);
      res.json(e);
    });
  }
});

/* Company Lookup. query takes company */
router.get('/companylookup', (req, res) => {
  const company = req.query.company;
  const {client_id, url} = vcapServices.companyLookup.credentials;
  return _doGet(url + '/markets/find', {client_id: client_id, name: company}, res);
});

/* Stock News. query takes symbol */
router.get('/stocknews', (req, res) => {
  // if a language is specified in the request, prioritize that
  const locales = new locale.Locales(req.headers['accept-language']);
  const langCode = req.query.language || locales.best(supportedLocales).code;
  const symbol = [].concat(req.query.symbol);
  const {client_id, url} = vcapServices.stockNews.credentials;
  return _doGet(url + '/news/find', {client_id: client_id, symbol: symbol.join(','), language: langCode}, res);
});

/* Stock Price. query takes symbols */
router.get('/stockprice', (req, res) => {
  const symbols = [].concat(req.query.symbols);

  const {client_id: client_id1, url: url1} = vcapServices.stockPrice.credentials;
  const {client_id: client_id2, url: url2} = vcapServices.stockHistory.credentials;

  const pricePromise   = request.getAsync({url: url1 + '/markets/quote',   qs: {client_id: client_id1, symbols: symbols.join(',')}, json: true});
  const historyPromise = request.getAsync({url: url2 + '/markets/history', qs: {client_id: client_id2, symbols: symbols.join(',')}, json: true});

  Promise.join(pricePromise, historyPromise, ({body: pB}, {body: hB}) => {
    // build a map of symbol -> price objects
    const priceMap = {};
    for (let price of pB) {
      priceMap[price.symbol] = price;
    }

    // if all of the current change values are falsy, we'll want to use yesterday's
    const usePreviousChangeValues = pB.every(p => !p.change);

    // iterate over the history map and convert to expected data type
    // additionallyalally, add today's price values to the array in one nice
    // happy array family
    for (const symbol in hB) {
      if (hB.hasOwnProperty(symbol)) {
        const price = priceMap[symbol];
        hB[symbol] = hB[symbol].map(h => ({
          change: h.close - h.open,
          symbol: symbol,
          last: h.close,
          date: h.date,
          week_52_high: price.week_52_high,
          week_52_low: price.week_52_low
        }));
        const d = new Date();
        const previousSymbol = hB[symbol][hB[symbol].length - 1];
        hB[symbol].push({
          change: usePreviousChangeValues ? previousSymbol.change : price.change,
          symbol: symbol,
          last: price.last,
          date: '' + d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate(),
          week_52_high: price.week_52_high,
          week_52_low: price.week_52_low
        });
      }
    }
    res.json(hB);
  }).catch(e => {
    console.error(e);
    res.status(500);
    res.json(e);
  });
});

/* Get tweets and sentiment about an entity and topic */
router.get('/tweets', (req, res) => {
  // if a language is specified in the request, prioritize that
  const locales = new locale.Locales(req.headers['accept-language']);
  const langCode = req.query.language || locales.best(supportedLocales).code;
  // proceed with business as usual
  const symbols = [].concat(req.query.symbol || req.query.symbols);
  const entity = req.query.entity;

  // issue requests for the tweets and the sentiment
  const {client_id: client_id1, url: url1} = vcapServices.stockTweets.credentials;
  const {client_id: client_id2, url: url2} = vcapServices.stockSentiment.credentials;
  const tweetProm = request.getAsync({url: url1 + '/twitter/find',   qs: {client_id: client_id1, symbol: symbols.join(','), entity: entity, language: langCode}, json: true});
  const sentProm  = request.getAsync({url: url2 + '/sentiment/find', qs: {client_id: client_id2, symbol: symbols.join(','), entity: entity}, json: true});

  // only return one object
  Promise.join(tweetProm, sentProm, ({body: tB}, {body: sB}) => {
    res.json({
      tweets: tB,
      sentiment: sB
    });
  }).catch(e => {
    console.error(e);
    res.status(500);
    res.json(e);
  });
});

/* Helper GET method for companylookup and stockprice similarities */
function _doGet(url, qs, res) {
  return request.getAsync({url: url, qs: qs, json: true}).then(({ body }) => {
    if (body.httpCode) {
      res.status(parseInt(body.httpCode, 10));
    }
    res.json(body);
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
  const symbols = [].concat(req.query.symbols || req.query.symbol);

  const {client_id: client_id1, url: url1} = vcapServices.stockPrice.credentials;
  const {client_id: client_id2, url: url2} = vcapServices.stockHistory.credentials;

  const pricePromise   = request.getAsync({url: url1 + '/markets/quote',   qs: {client_id: client_id1, symbols: symbols.join(',')}, json: true});
  const historyPromise = request.getAsync({url: url2 + '/markets/history', qs: {client_id: client_id2, symbols: symbols.join(',')}, json: true});

  Promise.join(pricePromise, historyPromise, ({body: pB}, {body: hB}) => {
    // if all of the current change values are falsy, we'll want to use yesterday's
    const usePreviousChangeValues = pB.every(p => !p.change);

    const prevSymbolMap = {};
    for (const symbol in hB) {
      if (hB.hasOwnProperty(symbol)) {
        const prevSymbol = hB[symbol][hB[symbol].length - 1];
        prevSymbolMap[symbol] = prevSymbol.close - prevSymbol.open;
      }
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
  const symbols = [].concat(req.query.symbols || req.query.symbol);

  const {client_id: client_id1, url: url1} = vcapServices.stockPrice.credentials;
  const {client_id: client_id2, url: url2} = vcapServices.stockHistory.credentials;

  const pricePromise   = request.getAsync({url: url1 + '/markets/quote',   qs: {client_id: client_id1, symbols: symbols.join(',')}, json: true});
  const historyPromise = request.getAsync({url: url2 + '/markets/history', qs: {client_id: client_id2, symbols: symbols.join(',')}, json: true});

  Promise.join(pricePromise, historyPromise, ({body: pB}, {body: hB}) => {
    // if all of the current change values are falsy, we'll want to use yesterday's
    const usePreviousChangeValues = pB.every(p => !p.change);

    const prevSymbolMap = {};
    for (var symbol in hB) {
      if (hB.hasOwnProperty(symbol)) {
        var prevSymbol = hB[symbol][hB[symbol].length - 1];
        prevSymbolMap[symbol] = prevSymbol.close - prevSymbol.open;
      }
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
  const locales = new locale.Locales(req.headers['accept-language']);
  const langCode = req.query.language || locales.best(supportedLocales).code;
  const {client_id, url} = vcapServices.stockSentiment.credentials;
  // companies can be in symbol or symbols field
  const symbols = [].concat(req.query.symbol || req.query.symbols);
  // request time!
  request.getAsync({url: url + '/news/find', json: true, qs: {
    client_id: client_id, symbols: symbols.join(','), language: langCode, elimit: 50, alimit: 0
  }}).then(({ body }) => {
    res.json(body.entities);
  }).catch(e => {
    res.status(500);
    res.json(e);
  });
});

/** Get an array of articles + relations for a company or list of companies */
router.get('/demo/articles', (req, res) => {
  // if the user passes in a language, use that otherwise get it from the request header
  const locales = new locale.Locales(req.headers['accept-language']);
  const langCode = req.query.language || locales.best(supportedLocales).code;
  const {client_id, url} = vcapServices.stockSentiment.credentials;
  // companies can be in symbol or symbols field
  const symbols = [].concat(req.query.symbol || req.query.symbols);
  // request time!
  request.getAsync({url: url + '/news/find', json: true, qs: {
    client_id: client_id, symbols: symbols.join(','), language: langCode, elimit: 50, alimit: 0
  }}).then(({ body }) => {
    res.json(body.articles);
  }).catch(e => {
    res.status(500);
    res.json(e);
  });
});

module.exports = router;
