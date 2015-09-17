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
import {
  setDate
} from '../Actions';

export default class DateSlider extends React.Component {
  render() {
    var {dateArr, currentDate} = this.props;
    var startOfCurrentDate = moment(currentDate).startOf('day');
    var currentPos = dateArr.length;
    for (var i = 0; i < dateArr.length; i++) {
      if (moment(dateArr[i]).startOf('day').isSame(startOfCurrentDate)) {
        currentPos = i;
        break;
      }
    }
    return (
      <div className="date-slider">
        <div className="date-slider-label">{this.props.currentDate.format("dddd, MMM Do")}</div>
        <input
          className="slider"
          type="range"
          min="0"
          max={"" + dateArr.length}
          value={currentPos}
          steps={dateArr.length}
          onChange={e => setDate(moment(this.props.dateArr[parseInt(e.target.value)]))} />
      </div>
    );
  }
}