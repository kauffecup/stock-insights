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

import React, { Component, PropTypes } from 'react'
import { connect }       from 'react-redux'
import classNames        from 'classnames';
import Constants         from './constants/Constants';

import CompaniesStore    from './stores/CompaniesStore';
import StockDataStore    from './stores/StockDataStore';
import NewsArticlesStore from './stores/NewsArticlesStore';
import PageStateStore    from './stores/PageStateStore';
import TweetStore        from './stores/TweetStore';

import CompanyContainer  from './components/CompanyContainer';
import StockVisualizer   from './components/StockVisualizer';
import ArticleList       from './components/ArticleList';
import GraphTown         from './components/GraphTown';
import DateSlider        from './components/DateSlider';
import TweetViewer       from './components/TweetViewer';

import {
  addCompany,
  removeCompany,
  toggleCondensedCompanies
} from './actions/actions';

import {
  getStockData,
  getStrings,
  getNews,
  closeTweets
} from './Actions';

// get our inline-able svg
var fs = require('fs');
var path = require('path');
var IBMsvg = fs.readFileSync(path.resolve(__dirname, './IBM.svg'));

/**
 * The app entry point
 */
class StockInsights extends Component {
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
    // injected by connect call
    var {dispatch, isEmbedded, language, forceBubbles, strings, currentDate, potentialCompanies,
      companies, entities, stockData, selectedCompanies, articles} = this.props;

    var classes = classNames('stock-insights', {
      embedded: isEmbedded
    });
    var showDateSlider = !this.state.selectedCompanies.length || forceBubbles;
    var showGraph = this.state.selectedCompanies.length;
    var showArticles = this.state.selectedCompanies.length;
    return (
      <div className={classes} onClick={closeTweets}>
        <div className="stock-insights-title">
          <div className="da-logo" dangerouslySetInnerHTML={{__html: IBMsvg}}></div>
          <h1 className="stock-insights-title">{this.state.strings.stockInsights}</h1>
          <a href="https://bluemix.net" target="_blank">{this.state.strings.built}</a>
        </div>
        <CompanyContainer
          companies={companies.companies}
          potentialCompanies={this.state.potentialCompanies}
          loadingStatus={this.state.potentialCompaniesLoading}
          condensed={companies.condensed}
          selectedCompanies={this.state.selectedCompanies}
          strings={this.state.strings}
          language={language}
          onCompanyRemove={c => dispatch(removeCompany(c))}
          onCompanyAdd={c => dispatch(addCompany(c))}
          onToggle={() => dispatch(toggleCondensedCompanies())} />
        {showDateSlider &&
          <DateSlider stockData={this.state.stockData} currentDate={this.state.currentDate} language={language} />
        }
        <div className="cool-stuff">
          <StockVisualizer
            stockData={this.state.stockData}
            entityData={this.state.entityData}
            currentDate={this.state.currentDate}
            dataMap={this.state.stockDataMap}
            strings={this.state.strings}
            language={language}
            forceBubbles={forceBubbles}
            selectedCompanies={this.state.selectedCompanies} />
          {this.state.tweetsOpen &&
            <TweetViewer description={this.state.tweetDescription}
              tweets={this.state.tweets}
              sentiment={this.state.tweetSentiment}
              strings={this.state.strings} />
          }
          {!!this.state.selectedCompanies.length && 
            <ArticleList selectedCompanies={this.state.selectedCompanies}
              articles={this.state.articles} />
          }
        </div>
        {showGraph &&
          <GraphTown dataMap={this.state.stockDataMap} selectedCompanies={this.state.selectedCompanies} />
        }
      </div>
    );
  }

  /**
   * When mounting/unmounting add/remove change listeners to stores
   */
  componentDidMount() {
    getStrings(this.props.language);
    CompaniesStore.addChangeListener(this._onChange);
    StockDataStore.addChangeListener(this._onChange);
    NewsArticlesStore.addChangeListener(this._onChange);
    PageStateStore.addChangeListener(this._onChange);
    TweetStore.addChangeListener(this._onChange);
    // if we already have selected companies, request their articles to populate
    // nah mean nah mean?
    if (this.state.selectedCompanies.length) {
      for (var company of this.state.selectedCompanies) {
        getNews(this.props.language, company);
      }
    } 
    // if we already have companies, request the stock data to populate
    // our visualizations
    if (this.props.companies.companies.length) {
      var symbols = this.props.companies.companies.map(c => c.symbol)
      getStockData(symbols);
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
      potentialCompanies: CompaniesStore.getPotentialCompanies(),
      potentialCompaniesLoading: CompaniesStore.getLoadingStatus(),
      stockData: StockDataStore.getStockData(),
      stockDataMap: StockDataStore.getDataMap(),
      entityData: StockDataStore.getEntities(),
      strings: PageStateStore.getStrings(),
      currentDate: PageStateStore.getDate(),
      selectedCompanies: PageStateStore.getSelectedCompanies(),
      articles: NewsArticlesStore.getArticles(),
      tweetsOpen: TweetStore.getStatus(),
      tweetDescription: TweetStore.getDescription(),
      tweets: TweetStore.getTweets(),
      tweetSentiment: TweetStore.getSentiment()
    }
  }
};

// for now, we want it all! and maybe forever honestly, iuno
var select = state => state;

// Wrap the component to inject dispatch and state into it
export default connect(select)(StockInsights)
