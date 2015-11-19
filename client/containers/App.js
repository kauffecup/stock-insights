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
import Constants         from '../constants/Constants';

import CompanyContainer  from '../components/CompanyContainer';
import StockVisualizer   from '../components/StockVisualizer';
import ArticleList       from '../components/ArticleList';
import GraphTown         from '../components/GraphTown';
import DateSlider        from '../components/DateSlider';
import TweetViewer       from '../components/TweetViewer';

// get our inline-able svg
import IBMsvg from '../IBM.svg';

import {
  addCompany,
  removeCompany,
  toggleSelect,
  toggleCondensedCompanies,
  getStrings,
  setDate,
  closeArticleList,
  clearPotentialCompanies,
  searchCompany,
  getStockData,
  getTweets,
  closeTweets,
  getSelectedNews
} from '../actions/actions';

/**
 * The app entry point
 */
class StockInsights extends Component {
  /**
   * Currently the app consists of a header and a CompanyContainer
   */
  render() {
    // injected by connect call
    var {dispatch, isEmbedded, language, forceBubbles, strings, currentDate, potentialCompanies,
      companies, entities, stockData, selectedCompanies, articles, tweets} = this.props;

    var classes = classNames('stock-insights', {
      embedded: isEmbedded
    });
    var showDateSlider = !selectedCompanies.length || forceBubbles;
    var showGraph = selectedCompanies.length;
    var showArticles = selectedCompanies.length;
    return (
      <div className={classes} onClick={() => tweets.open && dispatch(closeTweets())}>
        <div className="stock-insights-title">
          <div className="da-logo" dangerouslySetInnerHTML={{__html: IBMsvg}}></div>
          <h1 className="stock-insights-title">{strings.stockInsights}</h1>
          <a href="https://bluemix.net" target="_blank">{strings.built}</a>
        </div>
        <CompanyContainer
          companies={companies.companies}
          potentialCompanies={potentialCompanies.companies}
          loadingStatus={potentialCompanies.status}
          condensed={companies.condensed}
          selectedCompanies={selectedCompanies}
          strings={strings}
          language={language}
          onCompanyRemove={c => dispatch(removeCompany(c))}
          onCompanyAdd={c => dispatch(addCompany(c))}
          onToggle={() => dispatch(toggleCondensedCompanies())}
          onSelect={c => dispatch(toggleSelect(c))}
          onSearch={v => dispatch(searchCompany(v))}
          onClear={() => dispatch(clearPotentialCompanies())} />
        {showDateSlider &&
          <DateSlider stockData={stockData.flat} currentDate={currentDate}
            language={language} onChange={d => dispatch(setDate(d))}/>
        }
        <div className="cool-stuff">
          <StockVisualizer
            stockData={stockData.flat}
            entityData={entities.entities}
            currentDate={currentDate}
            dataMap={stockData.map}
            strings={strings}
            language={language}
            forceBubbles={forceBubbles}
            selectedCompanies={selectedCompanies}
            onCompanyClick={c => dispatch(toggleSelect(c))}
            onEntityClick={(symbols, entity) => dispatch(getTweets(symbols, entity))} />
          {tweets.open &&
            <TweetViewer description={tweets.description}
              tweets={tweets.tweets}
              sentiment={tweets.sentiment}
              strings={strings} />
          }
          {!!selectedCompanies.length && 
            <ArticleList selectedCompanies={selectedCompanies}
              loading={articles.loading}
              articles={articles.articles}
              onClose={() => dispatch(closeArticleList())} />
          }
        </div>
        {showGraph &&
          <GraphTown dataMap={stockData.map} selectedCompanies={selectedCompanies} />
        }
      </div>
    );
  }

  /**
   * When mounting/unmounting add/remove change listeners to stores
   */
  componentDidMount() {
    this.props.dispatch(getStrings(this.props.language));
    // if we already have selected companies, request their articles to populate
    if (this.props.selectedCompanies.length) {
      this.props.dispatch(getSelectedNews());
    } 
    // if we already have companies, request the stock data to populate
    // our visualizations
    if (this.props.companies.companies.length) {
      var symbols = this.props.companies.companies.map(c => c.symbol)
      this.props.dispatch(getStockData(symbols));
    }
  }
};

// for now, we want it all! and maybe forever honestly, iuno
var select = state => state;

// Wrap the component to inject dispatch and state into it
export default connect(select)(StockInsights)
