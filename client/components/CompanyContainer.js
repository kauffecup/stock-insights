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
import classNames      from 'classnames';
import CompanySearcher from './CompanySearcher';
import {
  getNews,
  removeCompany,
  deselectCompany,
  toggleCondensedCompanies
} from '../Actions';

/**
 * An individual company. Displays the description, ticker symbol, and an `x` that you can
 * click on to remove the company
 */
class Company extends React.Component {
  toggleSelected() {
    if (this.props.selected) {
      deselectCompany(this.props.company);
    } else {
      getNews(this.props.company);
    }
  }
  render() {
    var c = this.props.company;
    var classes = classNames('company', {
      selected: this.props.selected
    });
    return (
      <div className={classes} onClick={this.toggleSelected.bind(this)}>
        <span className="company-description">{c.description}</span>
        <span className="company-symbol">{c.symbol}</span>
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
  render() {
    var classes=classNames('company-container', {
      condensed: this.props.condensed
    });
    var selected = {};
    for (var sym of this.props.selectedCompanies) {
      selected[sym] = true;
    }
    return (
      <div className={classes}>
        {this.props.companies.map(c =>
          <Company company={c} key={c.symbol} condensed={this.props.condensed} selected={!!selected[c.symbol]} />
        )}
        {this.props.companies.length ? <button onClick={toggleCondensedCompanies}>
          {this.props.condensed ? "Show" : "Hide Company Names"}
        </button> : null}
        <CompanySearcher {...this.props} />
      </div>
    );
  }
}
