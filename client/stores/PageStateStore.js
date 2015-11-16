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

import _Store     from './_Store';
import Dispatcher from '../Dispatcher';
import Constants  from '../constants/Constants';
import assign     from 'object-assign';
import moment     from 'moment';

// initialize current date at today
var _currentDate = moment();

/**
 * The store we'll be exporting. Contains getter methods for
 * stock data, color modes and size modes
 */
var PageStateStore = assign({}, _Store, {
  getDate: function () {
    return _currentDate;
  }
});

/**
 * Handle dispatched events.
 * Currently listens to  SWITCH_ANALYSIS_COLOR_MODE, and SWITCH_ANALYSIS_SIZE_MODE
 */
Dispatcher.register(function(action) {
  switch(action.actionType) {
    case Constants.SWITCH_DATE:
      _currentDate = action.date;
      PageStateStore.emitChange();
      break;

    default:
      // no op
  }
});

export default PageStateStore;
