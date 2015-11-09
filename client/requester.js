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

import request from 'superagent';

/**
 * Hit the companylookup endpoint with the proper query.
 * Return a promise that resolves with the response.
 */
export function companyLookup(company) {
  return _queryHelper('/companylookup', {company: company});
}

/**
 * Hit the stockprice endpoint with the proper query.
 * Return a promise that resolves with the response.
 */
export function stockPrice(symbols) {
  return _queryHelper('/stockprice', {symbols: symbols});
}

/**
 * Hit the stocknews endpoint with the proper query.
 * Return a promise that resolves with the response.
 */
export function stockNews(symbols, language) {
  return _queryHelper('/stocknews', {symbol: symbols, language: language});
}

export function tweets(symbol, entity, language) {
  return _queryHelper('/tweets', {symbol: symbol, entity: entity, language: language});
}

/**
 * Hit the strings endpoint with no query.
 * Return a promise that resolves with the response.
 */
export function strings(language) {
  return _queryHelper('/strings', {language: language});
}

/**
 * Helper method that handles promise creation, resolution
 * and rejection for a given endpoint and query.
 */
function _queryHelper(url, query) {
  return new Promise((resolve, reject) => {
    request.get(url)
      .query(query)
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      }
    );
  });
}