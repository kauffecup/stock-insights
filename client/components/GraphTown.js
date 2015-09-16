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

import React       from 'react';
import StockHistoryStore from '../stores/StockHistoryStore';
import {LineChart} from 'react-d3/linechart';

export default class GraphTown extends React.Component {
  constructor(props) {
    super(props);
    this.state = this._getStateObj();
    // need to initialize the function this way so that we have a reference
    // to the arrow function. this way we can add/remove it properly
    this._onChange = e => this.setState(this._getStateObj());
  }

  adaptData() {
    var myData = [];
    for (var symbol in this.state.histories) {
      myData.push({
        name: symbol,
        strokeWidth: 3,
        values: this.state.histories[symbol].map(v => ({
          x: new Date(v.date),
          y: v.close
        }))
      });
    }
    return myData;
  }

  render() {
    return (
      <div className="graph-town">
        <LineChart data={this.adaptData()}
          xAxisTickInterval={{unit: 'day', interval: 7}}
          width={this.state.width || 0}
          height={this.state.height || 0}
          legend={true}
          viewBoxObject={{
            x: 0,
            y: 0,
            height: this.state.height || 0,
            width: this.state.width || 0
          }} />
      </div>
    );
  }
    /**
   * When mounting/unmounting add/remove change listeners to stores
   */
  componentDidMount() {
    StockHistoryStore.addChangeListener(this._onChange);
    this.setState({
      width: React.findDOMNode(this).clientWidth,
      height: React.findDOMNode(this).clientHeight
    })
  }
  componentWillUnmount() {
    StockHistoryStore.removeChangeListener(this._onChange);
  }
  _getStateObj() {
    return {
      histories: StockHistoryStore.getStockHistories()
    }
  }
}
