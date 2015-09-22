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
import moment            from 'moment';
import clone             from 'clone';
import ReactBubbleChart  from 'react-bubble-chart';
import {
  getNews
} from '../Actions';

function generateLegend(lowText, highText) {
  return [
    // reds from dark to light
    {color: "#67000d", textColor: '#fee0d2', text: lowText},
    {color: "#a50f15", textColor: '#fee0d2'},
    "#cb181d",
    "#ef3b2c",
    "#fb6a4a",
    "#fc9272",
    "#fcbba1",
    "#fee0d2",
    //neutral grey
    "#f0f0f0",
    // blues from light to dark
    "#deebf7",
    "#c6dbef",
    "#9ecae1",
    "#6baed6",
    "#4292c6",
    "#2171b5",
    {color: '#08519c', textColor: '#deebf7'},
    {color: "#08306b", textColor: '#deebf7', text: highText}
  ];
}

/** The color legend we will use when colors reflect change */
var colorLegendChange = generateLegend('(-) Change', '(+) Change');
/** The color legend we will use when colors reflect the 52 week analysis */
var colorLegend52 = generateLegend('↓ 52 Low', '↑ 52 High');
/** The color legend we will use when colors reflect change */
var colorLegendEntity = generateLegend('(-) Sentiment', '(+) Sentiment');

/** Configuration for the tooltip */
var tooltipProps = [{
  css: 'symbol',
  prop: '_id'
}, {
  css: 'value',
  prop: 'value',
  display: 'Last Value'
}, {
  css: 'change',
  prop: 'change',
  display: 'Change'
}, {
  css: 'fiftytwo-high',
  prop: 'week_52_high',
  display: 'Week 52 High'
}, {
  css: 'fiftytwo-low',
  prop: 'week_52_low',
  display: 'Week 52 Low'
}];

export default class StockVisualizer extends React.Component {
  /**
   * Given a function to determine a stocks color value, and
   * a function to determine a stocks time value, produce an array
   * of data that can be consumed by ReactBubbleChart
   */
  getData(data, colorFunc) {
    data = data.map(s => {
      return {
        value: s.last.toFixed(2),
        _id: s.symbol,
        colorValue: colorFunc(s),
        change: this.getChangeAnalysis(s),
        week_52_high: s.week_52_high,
        week_52_low: s.week_52_low
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
   * Will be passed in to getData - extract the change of a stock
   */
  getChangeAnalysis(s) {
    return s.change.toFixed(2);
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
    // protect against dividing by 0. this may seem a little... fake, but if we
    // don't have the data we'll give it a perfectly average score.
    if (!high && !low) {
      return 0.5;
    } else {
      return 1 - ((high - now) / (high - low));
    }
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
    // if all of the change data is 0 (the market just opened), make sure our
    // domain isn't from 0 to 0. that'll make all of the circles black!
    if (!min && !max) {
      min = -1;
      max = 1;
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
    var {entityData, stockData, currentDate, currentColorMode} = this.props;
    var isEntities = !!entityData.length;
    var tooltip = !isEntities;

    var data, legend, domain, sizeFunc;
    if (isEntities) {
      data = this.props.entityData;
      legend = colorLegendEntity;
      domain = {
        min: -1,
        max: 1
      }
    } else {
      var startOfCurrentDate = moment(currentDate).startOf('day');
      var currentPos;
      for (var i = 0; i < stockData.length && typeof currentPos === 'undefined'; i++) {
        if (moment(stockData[i].date).startOf('day').isSame(startOfCurrentDate)) {
          currentPos = i;
        }
      }
      var data = stockData[currentPos].data;
      // then, depending on the color mode, get the actual data, color
      // domain, and color legend.
      switch(currentColorMode) {
        case '_am_color_change':
          data = this.getData(data, this.getChangeAnalysis);
          domain = this.getChangeDomain(data);
          legend = colorLegendChange;
          break;

        case '_am_color_52week':
          data = this.getData(data, this.getWeek52Analysis);
          domain = this.getWeek52Domain();
          legend = colorLegend52;
          break;
      }
    }
    // now we make a bubble chart! yay!
    return <ReactBubbleChart
      legend={true}
      legendSpacing={0}
      className="stock-visualizer"
      colorLegend={legend}
      data={data}
      onClick={isEntities ? null : getNews}
      fixedDomain={domain}
      tooltip={tooltip}
      tooltipProps={tooltipProps}
    />;
  }
}
