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

var colorLegend = [
  // oranges from dark to light
  {color: "#990000", text: '(-) Change'},  "#d7301f", "#ef6548", "#fc8d59", "#fdbb84", "#fdd49e", "#fee8c8", "#fff7ec",
  //neutral grey
  "#f0f0f0",
  // blues from light to dark
  "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", {color: "#08306b", text: '(+) Change'}
];

class StockVisualizer extends React.Component {
  render () {
    var data = this.props.stockData.map(s => ({
      value: s.last || s.close,
      _id: s.symbol,
      colorValue: s.change
    })).sort((s1, s2) => s2.value - s1.value);

    return <ReactBubbleChart
      className="stock-visualizer"
      colorLegend={colorLegend}
      data={data}
    />;
  }
}

export default StockVisualizer;
