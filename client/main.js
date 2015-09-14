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
import Constants         from './constants/Constants';
import CompaniesStore    from './stores/CompaniesStore';
import StockDataStore    from './stores/StockDataStore';
import NewsArticlesStore from './stores/NewsArticlesStore';
import PageStateStore    from './stores/PageStateStore';
import CompanyContainer  from './components/CompanyContainer';
import StockVisualizer   from './components/StockVisualizer';
import ArticleList       from './components/ArticleList';
import AnalysisToggle    from './components/AnalysisToggle';
import {
  getStockData
} from './Actions';

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
        <CompanyContainer companies={this.state.companies} potentialCompanies={this.state.potentialCompanies} condensed={this.state.condensedCompanies} />
        <StockVisualizer stockData={this.state.stockData} currentColorMode={this.state.currentColorMode} currentSizeMode={this.state.currentSizeMode} />
        {!!this.state.selectedCompany && <ArticleList selectedCompany={this.state.selectedCompany} articles={this.state.articles} /> }
        <AnalysisToggle analysisColorModes={this.state.analysisColorModes} analysisSizeModes={this.state.analysisSizeModes} />
      </div>
    );
  }

  /**
   * When mounting/unmounting add/remove change listeners to stores
   */
  componentDidMount() {
    CompaniesStore.addChangeListener(this._onChange);
    StockDataStore.addChangeListener(this._onChange);
    NewsArticlesStore.addChangeListener(this._onChange);
    PageStateStore.addChangeListener(this._onChange);
    // if we already have companies, request the stock data to populate
    // our visualizations
    if (this.state.companies.length) {
      getStockData(this.state.companies.map(c => c.symbol));
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
      stockData: StockDataStore.getStockData(),
      analysisColorModes: PageStateStore.getAnalysisColorModes(),
      analysisSizeModes: PageStateStore.getAnalysisSizeModes(),
      currentColorMode: PageStateStore.getCurrentAnalysisColorMode(),
      currentSizeMode: PageStateStore.getCurrentAnalysisSizeMode(),
      condensedCompanies: PageStateStore.getCondensedCompanies(),
      selectedCompany: NewsArticlesStore.getSelectedCompany(),
      articles: NewsArticlesStore.getArticles()
    }
  }
};

React.initializeTouchEvents(true);
React.render(<StockInsights />, document.body);
