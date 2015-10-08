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

import CompaniesStore    from './stores/CompaniesStore';
import StockDataStore    from './stores/StockDataStore';
import NewsArticlesStore from './stores/NewsArticlesStore';
import PageStateStore    from './stores/PageStateStore';

import CompanyContainer  from './components/CompanyContainer';
import StockVisualizer   from './components/StockVisualizer';
import ArticleList       from './components/ArticleList';
import AnalysisToggle    from './components/AnalysisToggle';
import GraphTown         from './components/GraphTown';
import DateSlider        from './components/DateSlider';

import {
  getStockData,
  getStockHistory,
  getStrings,
  getNews
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
          <h1 className="stock-insights-title">{this.state.strings.stockInsights}</h1>
        </div>
        <CompanyContainer
          companies={this.state.companies}
          potentialCompanies={this.state.potentialCompanies}
          loadingStatus={this.state.potentialCompaniesLoading}
          condensed={this.state.condensedCompanies}
          selectedCompanies={this.state.selectedCompanies}
          strings={this.state.strings} />
        {!this.state.selectedCompanies.length &&
          <DateSlider stockData={this.state.stockData} currentDate={this.state.currentDate} />
        }
        <div className="cool-stuff">
          <StockVisualizer
            stockData={this.state.stockData}
            entityData={this.state.entityData}
            currentColorMode={this.state.currentColorMode}
            currentDate={this.state.currentDate}
            histories={this.state.histories}
            strings={this.state.strings} />
          {!!this.state.selectedCompanies.length && 
            <ArticleList selectedCompanies={this.state.selectedCompanies}
              articles={this.state.articles} />
          }
        </div>
        {this.state.selectedCompanies.length ?
          <GraphTown histories={this.state.histories} selectedCompanies={this.state.selectedCompanies} />
          :
          <AnalysisToggle analysisColorModes={this.state.analysisColorModes} strings={this.state.strings} />
        }
      </div>
    );
  }

  /**
   * When mounting/unmounting add/remove change listeners to stores
   */
  componentDidMount() {
    getStrings();
    CompaniesStore.addChangeListener(this._onChange);
    StockDataStore.addChangeListener(this._onChange);
    NewsArticlesStore.addChangeListener(this._onChange);
    PageStateStore.addChangeListener(this._onChange);
    // if we already have selected companies, request their articles to populate
    // nah mean nah mean?
    if (this.state.selectedCompanies.length) {
      for (var company of this.state.selectedCompanies) {
        getNews(company);
      }
    } 
    // if we already have companies, request the stock data to populate
    // our visualizations
    if (this.state.companies.length) {
      var symbols = this.state.companies.map(c => c.symbol)
      getStockData(symbols)
      getStockHistory(symbols);
    }
  }
  componentWillUnmount() {
    CompaniesStore.removeChangeListener(this._onChange);
    StockDataStore.removeChangeListener(this._onChange);
    NewsArticlesStore.removeChangeListener(this._onChange);
    PageStateStore.removeChangeListener(this._onChange);
  }

  /**
   * Get the main state for the application from the various stores
   */
  _getStateObj() {
    return {
      companies: CompaniesStore.getCompanies(),
      potentialCompanies: CompaniesStore.getPotentialCompanies(),
      potentialCompaniesLoading: CompaniesStore.getLoadingStatus(),
      stockData: StockDataStore.getStockData(),
      entityData: StockDataStore.getEntities(),
      histories: StockDataStore.getStockHistories(),
      strings: PageStateStore.getStrings(),
      isEmbedded: PageStateStore.getEmbeddedMode(),
      currentDate: PageStateStore.getDate(),
      analysisColorModes: PageStateStore.getAnalysisColorModes(),
      currentColorMode: PageStateStore.getCurrentAnalysisColorMode(),
      condensedCompanies: PageStateStore.getCondensedCompanies(),
      selectedCompanies: PageStateStore.getSelectedCompanies(),
      articles: NewsArticlesStore.getArticles()
    }
  }
};

React.initializeTouchEvents(true);
React.render(<StockInsights />, document.body);
