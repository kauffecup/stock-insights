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

import React            from 'react';
import Constants        from './constants/Constants';
import CompaniesStore   from './stores/CompaniesStore';
import CompanyContainer from './components/CompanyContainer';

/**
 * The app entry point
 */
class StockInsights extends React.Component {
  constructor(props) {
    super(props);
    this.state = this._getStateObj();
    // need to initialize the function this way so that we have a reference
    // to the arrow function. this way we can add/remove it properly
    this._onChange = e => this.setState(this._getStateObj());
  }

  /**
   * Currently the app consists of a header and a CompanyContainer
   */
  render() {
    return (
      <div className="stock-insights">
        <h1 className="stock-insights-title">Stock Insights</h1>
        <CompanyContainer companies={this.state.companies} potentialCompanies={this.state.potentialCompanies} />
      </div>
    );
  }

  /**
   * When mounting/unmounting add/remove change listeners to stores
   */
  componentDidMount() {
    CompaniesStore.addChangeListener(this._onChange);
  }
  componentWillUnmount() {
    CompaniesStore.removeChangeListener(this._onChange);
  }

  /**
   * Get the main state for the application from the various stores
   */
  _getStateObj() {
    return {
      companies: CompaniesStore.getCompanies(),
      potentialCompanies: CompaniesStore.getPotentialCompanies()
    }
  }
};

React.render(<StockInsights />, document.body);
