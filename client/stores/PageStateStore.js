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
import clone      from 'clone';

/** @type {String} The id for the current selected color mode */
var _selectedColorMode = '_am_color_change';
/** @type {Array} The possible color modes - each has a label and id */
var _analysisColorModes = [{
  label: 'Change',
  id: '_am_color_change'
}, {
  label: '52 Week',
  id: '_am_color_52week'
}];
/** @type {String} The id for the current selected analysis mode */
var _selectedSizeMode = '_am_size_value';
/** @type {Array} The possible size modes - each has a label and id */
var _analysisSizeModes = [{
  label: 'Value',
  id: '_am_size_value'
}, {
  label: 'Change',
  id: '_am_size_change',
}, {
  label: '52 Week',
  id: '_am_size_52week'
}];

/**
 * Set a new selected color mode
 */
function setSelectedColorMode(newMode) {
  _selectedColorMode = newMode;
}

/**
 * Set a new selected size mode
 */
function setSelectedSizeMode(newMode) {
  _selectedSizeMode = newMode;
}

/**
 * The store we'll be exporting. Contains getter methods for
 * stock data, color modes and size modes
 */
var PageStateStore = assign({}, _Store, {
  getAnalysisColorModes: function () {
    return _analysisColorModes.map((am => {
      var amr = clone(am);
      amr.selected = amr.id === _selectedColorMode;
      return amr;
    }));
  },
  getAnalysisSizeModes: function () {
    return _analysisSizeModes.map((am => {
      var amr = clone(am);
      amr.selected = amr.id === _selectedSizeMode;
      return amr;
    }));
  },
  getCurrentAnalysisColorMode: function () {
    return _selectedColorMode;
  },
  getCurrentAnalysisSizeMode: function () {
    return _selectedSizeMode
  }
});

/**
 * Handle dispatched events.
 * Currently listens to  SWITCH_ANALYSIS_COLOR_MODE, and SWITCH_ANALYSIS_SIZE_MODE
 */
Dispatcher.register(function(action) {
  switch(action.actionType) {
    // change the selected color mode
    // only emit a change if something has changed
    case Constants.SWITCH_ANALYSIS_COLOR_MODE:
      if (action.id !== _selectedColorMode) {
        setSelectedColorMode(action.id);
        PageStateStore.emitChange();
      }
      break;

    // change the selected size mode
    // only emit a change if something has changed
    case Constants.SWITCH_ANALYSIS_SIZE_MODE:
      if (action.id !== _selectedSizeMode) {
        setSelectedSizeMode(action.id);
        PageStateStore.emitChange();
      }
      break;

    default:
      // no op
  }
});

export default PageStateStore;