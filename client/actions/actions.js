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

import Constants from '../constants/Constants';

/** Add a company */
export function addCompany(company) {
  return {type: Constants.ADD_COMPANY, company: company};
  // company.symbol && getStockData(company.symbol);
}

/** Remove a company */
export function removeCompany(company) {
  return {type: Constants.REMOVE_COMPANY, company: company};
  // getNews();
}