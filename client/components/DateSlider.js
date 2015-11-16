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

import React  from 'react';
import moment from 'moment';

export default class DateSlider extends React.Component {
  render() {
    var {stockData, currentDate, language} = this.props;
    var startOfCurrentDate = moment(currentDate).startOf('day');
    var dateArr = stockData.map(sd => sd.date);
    var currentPos;
    for (var i = 0; i < dateArr.length; i++) {
      if (moment(dateArr[i]).startOf('day').isSame(startOfCurrentDate)) {
        currentPos = i;
        break;
      }
    }
    return (
      <div className="date-slider">
        <div className="date-slider-label">{
          currentDate.locale(language || 'en').format("LL")
        }</div>
        <input
          className="slider"
          type="range"
          min="0"
          max={"" + (dateArr.length-1)}
          value={currentPos}
          steps={dateArr.length}
          onChange={e => this.props.onChange(moment(this.props.stockData[parseInt(e.target.value)].date))} />
      </div>
    );
  }
}
