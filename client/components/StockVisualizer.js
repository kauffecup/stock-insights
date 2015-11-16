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
import d3                from 'd3';
import dimple            from 'dimple';
import ReactBubbleChart  from 'react-bubble-chart';

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

export default class StockVisualizer extends React.Component {
  /**
   * Given a function to determine a stocks color value, and
   * a function to determine a stocks time value, produce an array
   * of data that can be consumed by ReactBubbleChart
   */
  getData(data, colorFunc) {
    data = data.map(s => {
      return {
        value: s.last ? s.last.toFixed(2) : 0,
        _id: s.symbol,
        colorValue: s.change ? s.change.toFixed(2) : 0,
        change: s.change ? s.change.toFixed(2) : 0,
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
   * This function is called on mouseover of a bubble. It's passed the dom node of the tooltip,
   * the d3 data object, and the stroke color. We use these 3 things to graph a dimple bar series
   * in the tooltip
   */
  tooltipFunc(tooltipNode, d, stroke) {
    if (!this.props.dataMap || !this.props.dataMap[d._id]) return;
    // first we format the data from the correct symbol
    var myData = [];
    this.props.dataMap[d._id].map(v => {
      myData.push({
        symbol: d._id,
        date: v.date,
        close: v.last
      });
    });

    // find the svg element in the tooltip - if it isnt there, create one
    var svg = d3.select(tooltipNode).select('svg');
    svg = svg && svg.length && svg[0] && svg[0][0] ? svg : d3.select(tooltipNode).append('svg');
    svg.attr('width', 200)
      .attr('height', 40);

    // remove everything from the current chart and create a new chart
    if (this.tipChart) {
      svg.selectAll('*').remove();
    }
    this.tipChart = new dimple.chart(svg, myData, '100%', '100%');

    // configure the axis - x for date, y for close value
    var x = this.tipChart.addCategoryAxis('x', 'date');
    x.addOrderRule('date');
    x.hidden = true;
    var y = this.tipChart.addMeasureAxis('y', 'close');
    y.hidden = true
    var myNums = myData.map(d => d.close);
    y.overrideMin = Math.min(...myNums);
    y.overrideMax = Math.max(...myNums);

    // set up the series and its color
    var series = this.tipChart.addSeries('symbol', dimple.plot.bar);
    this.tipChart.setBounds(0, 0, '100%','100%');
    this.tipChart.assignColor(d._id, stroke, stroke, 1);
    series.barGap = 0.6;

    // now we draw!
    this.tipChart.draw();
  }

  /**
   * Render town.
   */
  render() {
    var {entityData, stockData, currentDate, selectedCompanies} = this.props;
    var isEntities = selectedCompanies.length && !!entityData.length && !this.props.forceBubbles;
    var tooltip = !isEntities;

    var tooltipProps = [{
      css: 'symbol',
      prop: '_id'
    }, {
      css: 'value',
      prop: 'value',
      display: this.props.strings.value
    }, {
      css: 'change',
      prop: 'change',
      display: this.props.strings.change
    }, {
      css: 'fiftytwo-high',
      prop: 'week_52_high',
      display: this.props.strings.week52High
    }, {
      css: 'fiftytwo-low',
      prop: 'week_52_low',
      display: this.props.strings.week52Low
    }];

    var data, legend, domain, sizeFunc;
    if (isEntities) {
      data = this.props.entityData;
      legend = generateLegend(`(-) ${this.props.strings.sentiment || ''}`, `(+) ${this.props.strings.sentiment || ''}`);
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
      var data = typeof currentPos === 'undefined' ? [] : stockData[currentPos].data;
      // then, depending on the color mode, get the actual data, color
      // domain, and color legend.
      data = this.getData(data);
      domain = this.getChangeDomain(data);
      legend = generateLegend(`(-) ${this.props.strings.change || ''}`, `(+) ${this.props.strings.change || ''}`);
    }
    // now we make a bubble chart! yay!
    return <ReactBubbleChart
      legend={true}
      legendSpacing={0}
      className="stock-visualizer"
      colorLegend={legend}
      data={data}
      onClick={isEntities ? d => this.props.onEntityClick(d.symbols, d._id) : this.props.onCompanyClick}
      fixedDomain={domain}
      tooltip={tooltip}
      tooltipProps={tooltipProps}
      tooltipFunc={this.tooltipFunc.bind(this)}
    />;
  }
}
