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
import ReactBubbleChart  from 'react-bubble-chart';
import {
  getNews
} from '../Actions';

/**
 * The color legend we will use when colors reflect change
 */
var colorLegendChange = [
  // oranges from dark to light
  {color: "#990000", text: '(-) Change'},  "#d7301f", "#ef6548", "#fc8d59", "#fdbb84", "#fdd49e", "#fee8c8", "#fff7ec",
  //neutral grey
  "#f0f0f0",
  // blues from light to dark
  "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", {color: "#08306b", text: '(+) Change'}
];

/**
 * The color legend we will use when colors reflect the 52 week analysis
 */
var colorLegend52 = [
  // oranges from dark to light
  {color: "#990000", text: '↓ 52 Low'},  "#d7301f", "#ef6548", "#fc8d59", "#fdbb84", "#fdd49e", "#fee8c8", "#fff7ec",
  //neutral grey
  "#f0f0f0",
  // blues from light to dark
  "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", {color: "#08306b", text: '↑ 52 High'}
];

class StockVisualizer extends React.Component {
  /**
   * Given a function to determine a stocks color value, and
   * a function to determine a stocks time value, produce an array
   * of data that can be consumed by ReactBubbleChart
   */
  getData(colorFunc, sizeFunc) {
    var data = this.props.stockData.map(s => {
      return {
        value: sizeFunc(s),
        _id: s.symbol,
        colorValue: colorFunc(s)
      }
    }).sort((s1, s2) => s2.value - s1.value);

    // this might be a bit hacky...
    // make sure that none of the values are negative
    // if any are negative, shift all the values up so that
    // the minimum value is 1
    var minVal = Math.min(...data.map(d => d.value));
    if (minVal <= 0) {
      data = data.map(d => ({
        value: d.value - minVal + 1,
        _id: d._id,
        colorValue: d.colorValue
      }));
    }
    return data;
  }

  /**
   * Will be passed in to getData - extract the value of a stock
   * returns last or close - if the market is closed last will be undefined,
   * if the market is open close will be undefined
   */
  getValueAnalysis(s) {
    return s.last || s.close;
  }

  /**
   * Will be passed in to getData - extract the change of a stock
   */
  getChangeAnalysis(s) {
    return s.change;
  }

  /**
   * Week52 Analysis... this might be helpful?
   * Gets the stocks current position relative to its week 52 high and week
   * 52 low. If the stock exceeds its week 52 high, this value will be > 1, if
   * a stock is currently in the middele, this value will be 0.5, etc...
   */
  getWeek52Analysis(s) {
    var high = s.week_52_high || s.high;
    var low  = s.week_52_low  || s.low;
    var now  = s.last || s.close;
    return (high - now) / (high - low);
  }

  /**
   * Return a color domain for change data. We want the min and max value to
   * be equidistant around 0. Otherwise something that's positive might show up
   * as red, or something that's negative might show up as blue
   */
  getChangeDomain(data) {
    var max = Math.max(0, ...data.map(d => d.colorValue));
    var min = Math.min(0, ...data.map(d => d.colorValue));
    if (max > Math.abs(min)) {
      min = -max;
    } else {
      max = -min;
    }
    return {
      min: min,
      max: max
    }
  }

  /**
   * Return a color domain for Week52 analysis. Go from -0.2 to 1.2?
   */
  getWeek52Domain() {
    return {
      min: -0.2,
      max: 1.2
    }
  }

  /**
   * Render town.
   */
  render() {
    var data, legend, domain, sizeFunc;
    // first we identify which function to use to size our bubbles
    switch(this.props.currentSizeMode) {
      case '_am_size_value':
        sizeFunc = this.getValueAnalysis;
        break;
      case '_am_size_change':
        sizeFunc = this.getChangeAnalysis;
        break;
      case '_am_size_52week':
        sizeFunc = this.getWeek52Analysis;
        break;
    }
    // then, depending on the color mode, get the actual data, color
    // domain, and color legend.
    switch(this.props.currentColorMode) {
      case '_am_color_change':
        data = this.getData(this.getChangeAnalysis, sizeFunc);
        domain = this.getChangeDomain(data);
        legend = colorLegendChange;
        break;

      case '_am_color_52week':
        data = this.getData(this.getWeek52Analysis, sizeFunc);
        domain = this.getWeek52Domain();
        legend = colorLegend52;
        break;
    }
    // now we make a bubble chart! yay!
    return <ReactBubbleChart
      className="stock-visualizer"
      colorLegend={legend}
      data={data}
      onClick={getNews}
      fixedDomain={domain}
    />;
  }
}

export default StockVisualizer;
