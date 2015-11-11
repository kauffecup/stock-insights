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

import React    from 'react';
import ReactDOM from 'react-dom';
import dimple   from 'dimple';

const DRAW_TIME = 400;

export default class GraphTown extends React.Component {
  render() {
    return <div className="graph-town"></div>;
  }

  /** Configure our dimple chart */
  componentDidMount() {
    this.handleResize = (e => this._handleResize(e));
    window.addEventListener('resize', this.handleResize);
    this.adaptData();

    // intialize the svg and chart with proper sizes
    var svg = dimple.newSvg(ReactDOM.findDOMNode(this), '100%', '100%');
    this.lineChart = new dimple.chart(svg, this.data);
    this.lineChart.setBounds(30, 14, '100%,-40', '100%,-34');

    // intialize the axis
    this.x = this.lineChart.addTimeAxis('x', 'date', "%Y-%m-%d", '%b %d');
    this.y = this.lineChart.addMeasureAxis('y', 'last');
    this.y.ticks = 7;
    this.updateAxis();

    // initialize the series lines
    var lines = this.lineChart.addSeries('symbol', dimple.plot.line);
    lines.lineMarkers = true;

    // initialize the legend
    this.legend = this.lineChart.addLegend(60, 5, '100%,-50', 20, "right");

    // lessss go
    this.lineChart.draw(DRAW_TIME);
  }

  /** When our props change, update the graphs data and min/max axis stuff */
  componentDidUpdate() {
    this.adaptData();
    this.lineChart.data = this.data;
    this.updateAxis();
    this.lineChart.draw(DRAW_TIME);
  }

  /** Set the min and max of the axis based on our graphs data */
  updateAxis() {
    var myNums = this.data.map(d => d.last);
    this.y.overrideMin = Math.min(...myNums);
    this.y.overrideMax = Math.max(...myNums);
  }

  /** Adapt the data map in to an array just the way we want it */
  adaptData() {
    var myData = [];
    for (var symbol in this.props.dataMap) {
      if (this.props.selectedCompanies.indexOf(symbol) > -1) {
        this.props.dataMap[symbol].map(v => {
          myData.push({
            symbol: symbol,
            date: v.date,
            last: v.last
          });
        });
      }
    }
    this.data = myData;
  }

  /** when we resize update our bounds, im not really too sure why this doesnt happen
    * automatically because we're using percents... but oh well maybe one day i'll fix it */
  _handleResize(e) {
    this.__resizeTimeout && clearTimeout(this.__resizeTimeout);
    this.__resizeTimeout = setTimeout(() => {
      this.lineChart.setBounds(30, 14, '100%,-40', '100%,-34');
      delete this.__resizeTimeout;
    }, 200);
  }
}
