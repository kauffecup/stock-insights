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
  adaptData() {
    var myData = [];
    for (var symbol in this.props.histories) {
      myData.push({
        name: symbol,
        strokeWidth: 3,
        values: this.props.histories[symbol].map(v => ({
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
          yAxisTickCount={4}
          width={React.findDOMNode(this).clientWidth}
          height={React.findDOMNode(this).clientHeight}
          legend={true}
          viewBoxObject={{
            x: 0,
            y: 0,
            height: React.findDOMNode(this).clientHeight,
            width: React.findDOMNode(this).clientWidth
          }} />
      </div>
    );
  }
}
