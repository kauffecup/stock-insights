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
  return new Promise(function (resolve, reject) {
    request.get('/companylookup')
      .query({company: company})
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

/**
 * Hit the stockprice endpoint with the proper query.
 * Return a promise that resolves with the response.
 */
export function stockPrice(symbol) {
  return new Promise(function (resolve, reject) {
    request.get('/stockprice')
      .query({symbol: symbol})
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