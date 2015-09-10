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

import React           from 'react';
import CompanySearcher from './CompanySearcher';
import {
  removeCompany
} from '../Actions';

/**
 * An individual company. Displays the description, ticker symbol, and an `x` that you can
 * click on to remove the company
 */
class Company extends React.Component {
  render () {
    var c = this.props.company;
    return (
      <div className="company">
        <span className="company-description">{c.description + ' (' + c.symbol + ')'}</span>
        <span className="company-close" onClick={removeCompany.bind(null, c)}>x</span>
      </div>
    );
  }
}

/**
 * The actual company container that we will export. Instantiates one company for each...
 * company, and instantiates a CompanySearcher
 */
export default class CompanyContainer extends React.Component {
  render () {
    return (
      <div className="company-container">
        {this.props.companies.map(c =>
          <Company company={c} key={c.symbol} />
        )}
        <CompanySearcher {...this.props} />
      </div>
    );
  }
}
