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

import React             from 'react';
import classNames        from 'classnames';
import Constants         from './constants/Constants';
import {
  Router,
  Route,
  IndexRoute
} from 'react-router';

import CompaniesStore    from './stores/CompaniesStore';
import NewsArticlesStore from './stores/NewsArticlesStore';
import PageStateStore    from './stores/PageStateStore';
import StockHistoryStore from './stores/StockHistoryStore';

import CompanyContainer  from './components/CompanyContainer';
import StockVisualizer   from './components/StockVisualizer';
import ArticleList       from './components/ArticleList';
import GraphTown         from './components/GraphTown';
import {
  getStockData
} from './Actions';

// make sure all es6 things work correctly in all browsers
require('babel/polyfill');

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
    var classes = classNames('stock-insights', {
      embedded: this.state.isEmbedded
    });
    return (
      <div className={classes}>
        <div className="stock-insights-title">
          <h1 className="stock-insights-title">Stock Insights</h1>
        </div>
        <CompanyContainer companies={this.state.companies}
          potentialCompanies={this.state.potentialCompanies}
          condensed={this.state.condensedCompanies}
          selectedCompanies={this.state.selectedCompanies} />
        {this.props.children}
      </div>
    );
  }

  /**
   * When mounting/unmounting add/remove change listeners to stores
   */
  componentDidMount() {
    CompaniesStore.addChangeListener(this._onChange);
    NewsArticlesStore.addChangeListener(this._onChange);
    PageStateStore.addChangeListener(this._onChange);
    StockHistoryStore.addChangeListener(this._onChange);
    // if we already have companies, request the stock data to populate
    // our visualizations
    if (this.state.companies.length) {
      getStockData(this.state.companies.map(c => c.symbol));
    }
  }
  componentWillUnmount() {
    CompaniesStore.removeChangeListener(this._onChange);
    NewsArticlesStore.removeChangeListener(this._onChange);
    PageStateStore.removeChangeListener(this._onChange);
    StockHistoryStore.removeChangeListener(this._onChange);
  }

  /**
   * Get the main state for the application from the various stores
   */
  _getStateObj() {
    return {
      companies: CompaniesStore.getCompanies(),
      potentialCompanies: CompaniesStore.getPotentialCompanies(),
      isEmbedded: PageStateStore.getEmbeddedMode(),
      condensedCompanies: PageStateStore.getCondensedCompanies(),
      selectedCompanies: NewsArticlesStore.getSelectedCompanies(),
      articles: NewsArticlesStore.getArticles(),
      histories: StockHistoryStore.getStockHistories()
    }
  }
};

React.initializeTouchEvents(true);
React.render((
  <Router>
    <Route path="/" component={StockInsights}>
      <IndexRoute component={StockVisualizer} />
    </Route>
  </Router>
), document.body);
