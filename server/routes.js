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

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index');
});

/* Company Lookup */
router.get('/companylookup', (req, res) => {
  var company = req.query.company;
  var {client_id, client_secret, url} = vcapServices.companyLookup.credentials;
  console.log(url + '/markets/find');
  return _doGet(url + '/markets/find', {client_id: client_id, name: company}, res);
});

/* Stock Price */
router.get('/stockprice', (req, res) => {
  var symbol = req.query.symbol;
  var {client_id, client_secret, url} = vcapServices.stockPrice.credentials;
  return _doGet(url + '/markets/quote', {client_id: client_id, symbol: symbol}, res);
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

export default router;
