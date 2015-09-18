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
import {LineChart} from 'react-d3/linechart';

export default class GraphTown extends React.Component {
  /** Initialize the height to be 200 and width to 1500? this gets overriden immediately */
  constructor(props) {
    super(props);
    this.state = {height: 200, width: 1500};
  }

  /** render town */
  render() {
    return (
      <div className="graph-town">
        <LineChart data={this.adaptData()}
          xAxisTickInterval={{unit: 'day', interval: 7}}
          yAxisTickCount={4}
          width={this.state.width}
          height={this.state.height}
          legend={true}
          viewBoxObject={{
            x: 0,
            y: 0,
            height: this.state.height,
            width: this.state.width
          }} />
      </div>
    );
  }

  /** Adapt the histories map in to an array just the way we want it */
  adaptData() {
    var myData = [];
    for (var symbol in this.props.histories) {
      if (this.props.selectedCompanies.indexOf(symbol) > -1) {
        myData.push({
          name: symbol,
          strokeWidth: 3,
          values: this.props.histories[symbol].map(v => ({
            x: new Date(v.date),
            y: v.close
          }))
        });
      }
    }
    return myData;
  }

  /** Measure our dom node and set the state */
  updateSize() {
    this.setState({height: React.findDOMNode(this).clientHeight, width: React.findDOMNode(this).clientWidth});
  }
  /** When we mount, intialize resize handler */
  componentDidMount() {
    this.handleResize = (e => this._handleResize(e));
    window.addEventListener('resize', this.handleResize);
    this.updateSize();
  }
  /** When we're peacing out, remove the handler */
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
    /** On a debounce, adjust the size of our graph area and then update the chart */
  _handleResize(e) {
    this.__resizeTimeout && clearTimeout(this.__resizeTimeout);
    this.__resizeTimeout = setTimeout(() => {
      this.updateSize();
      delete this.__resizeTimeout;
    }, 200);
  }
}
