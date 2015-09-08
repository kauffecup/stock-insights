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

import StockVisualizerD3 from './StockVisualizerD3';
import React             from 'react';

class StockVisualizer extends React.Component {
  render () {
    return <div className='stock-visualizer'></div>;
  }

  componentDidMount () {
    StockVisualizerD3.create(this.getDOMNode(), this.getChartState());
  }

  componentDidUpdate () {
    StockVisualizerD3.update(this.getDOMNode(), this.getChartState());
  }

  getChartState () {
    return {
      stockData: this.props.stockData
    }
  }

  componentWillUnmount () {
    StockVisualizerD3.destroy(this.getDOMNode());
  }

  getDOMNode () {
    return React.findDOMNode(this);
  }
}

export default StockVisualizer;
