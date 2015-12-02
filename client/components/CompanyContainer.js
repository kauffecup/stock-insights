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

import React, { Component, PropTypes } from 'react';
import classNames      from 'classnames';
import CompanySearcher from './CompanySearcher';
import Company         from './Company';

/**
 * The actual company container that we will export. Instantiates one company for each...
 * company, and instantiates a CompanySearcher
 */
export default class CompanyContainer extends Component {
  render() {
    var classes = classNames('company-container', {
      condensed: this.props.condensed
    });
    var selected = {};
    for (var sym of this.props.selectedCompanies) {
      selected[sym] = true;
    }
    return (
      <div className={classes}>
        {this.props.companies.map(c =>
          <Company company={c}
            key={c.symbol}
            condensed={this.props.condensed}
            selected={!!selected[c.symbol]}
            language={this.props.language}
            onRemoveClick={this.props.onCompanyRemove}
            onClick={this.props.onSelect.bind(null, c)} />
        )}
        {this.props.companies.length ? <button onClick={this.props.onToggle}>
          {this.props.condensed ? this.props.strings.showNames : this.props.strings.hideNames}
        </button> : null}
        <CompanySearcher {...this.props} />
      </div>
    );
  }
}

CompanyContainer.propTypes = {
  companies: PropTypes.array.isRequired,
  strings: PropTypes.object.isRequired,
  selectedCompanies: PropTypes.array.isRequired,
  condensed: PropTypes.bool.isRequired,
  language: PropTypes.string,
  onCompanyRemove: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired
};
