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
  'en', 'zh-Hant', 'zh-Hans', 'fr', 'de', 'it', 'ja', 'pt', 'es'
]);

/* GET strings. */
router.get('/strings', (req, res) => {
  var locales = new locale.Locales(req.headers['accept-language']);
  var best = locales.best(supportedLocales);
  gaasStock.getResourceDataAsync({
    languageID: best.code
  }).then(([{data}, body]) => {
    res.json(data);
  }).catch(e => {
    res.status(500);
    res.json(e);
  });
});

/* Company Lookup. query takes company */
router.get('/companylookup', (req, res) => {
  var company = req.query.company;
  var {client_id, client_secret, url} = vcapServices.companyLookup.credentials;
  return _doGet(url + '/markets/find', {client_id: client_id, name: company}, res);
});

/* Stock News. query takes symbol */
router.get('/stocknews', (req, res) => {
  var symbol = req.query.symbol;
  var {client_id, client_secret, url} = vcapServices.stockPrice.credentials;
  return _doGet(url + '/news/find', {client_id: client_id, symbol: symbol}, res);
});

/* Stock Price. query takes symbols */
router.get('/stockprice', (req, res) => {
  var symbols = req.query.symbols;
  var {client_id, client_secret, url} = vcapServices.stockPrice.credentials;
  return _doGet(url + '/markets/quote', {client_id: client_id, symbols: symbols}, res);
});

/* Stock History. query takes symbols */
router.get('/stockhistory', (req, res) => {
  var symbols = req.query.symbols;
  var {client_id, client_secret, url} = vcapServices.stockHistory.credentials;
  return _doGet(url + '/markets/history', {client_id: client_id, symbols: symbols}, res);
});

/* Sentiment. query takes symbol and/or entity */
router.get('/sentiment', (req, res) => {
  var {symbol, entity} = req.query;
  var {client_id, client_secret, url} = vcapServices.stockSentiment.credentials;
  return _doGet(url + '/sentiment/find', {client_id: client_id, symbol: symbol, entity: entity}, res);
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

// ----------------------------------------------------------------------
// ---------------------- Start Endpoints for Demo ----------------------
// ----------------------------------------------------------------------

/** Get stocks with positive change from a list of symbols, sorted by change */
router.get('/demo/positive', (req, res) => {
  var symbols = req.query.symbols;
  var {client_id, client_secret, url} = vcapServices.stockPrice.credentials;
  request.getAsync({url: url + '/markets/quote', qs: {client_id: client_id, symbols: symbols}}).then(([response, body]) => {
    var parsedResponse = typeof body === 'string' ? JSON.parse(body) : body;
    res.json(parsedResponse.filter(s => s.change > 0)
      .sort((s1, s2) => s2.change - s1.change)
      .map(s => ({
        change: s.change,
        symbol: s.symbol,
        description: s.description,
        value: s.value
      })));
  }).catch(e => {
    res.status(500);
    res.json(e);
  });
});

/** Get stocks with negative change from a list of symbols, sorted by change */
router.get('/demo/negative', (req, res) => {
  var symbols = req.query.symbols;
  var {client_id, client_secret, url} = vcapServices.stockPrice.credentials;
  request.getAsync({url: url + '/markets/quote', qs: {client_id: client_id, symbols: symbols}}).then(([response, body]) => {
    var parsedResponse = typeof body === 'string' ? JSON.parse(body) : body;
    res.json(parsedResponse.filter(s => s.change < 0)
      .sort((s1, s2) => s1.change - s2.change)
      .map(s => ({
        change: s.change,
        symbol: s.symbol,
        description: s.description,
        value: s.value
      })));
  }).catch(e => {
    res.status(500);
    res.json(e);
  });
});

/** Get an array of entities w/ average sentiment sorted by count about a company */
router.get('/demo/entities', (req, res) => {
  var symbol = req.query.symbol;
  var {client_id, client_secret, url} = vcapServices.stockSentiment.credentials;
    request.getAsync({url: url + '/news/find', qs: {client_id: client_id, symbol: symbol}}).then(([response, body]) => {
    var parsedResponse = typeof body === 'string' ? JSON.parse(body) : body;
    // step 1: map
    var entityMap = {};
    for (var article of parsedResponse.news) {
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
    // step 2: reduce
    var entities = [];
    for (var text in entityMap) {
      var __entities = entityMap[text];
      entities.push({
        text: text,
        count: __entities.length,
        averageSentiment: __entities.reduce((s, it) => s+it, 0)/__entities.length
      })
    }
    // step 3: party
    res.json(entities.sort((e1, e2) => e2.count - e1.count));
  }).catch(e => {
    res.status(500);
    res.json(e);
  });
});

/** Get an array of articles + relations for a company */
router.get('/demo/articles', (req, res) => {
  var symbol = req.query.symbol;
  var {client_id, client_secret, url} = vcapServices.stockSentiment.credentials;
    request.getAsync({url: url + '/news/find', qs: {client_id: client_id, symbol: symbol}}).then(([response, body]) => {
    var parsedResponse = typeof body === 'string' ? JSON.parse(body) : body;
    res.json(parsedResponse.news.map(n => ({
      title: n.title,
      url: n.url,
      relations: n.relations
    })));
  }).catch(e => {
    res.status(500);
    res.json(e);
  });
});

export default router;
