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

import React      from 'react';
import {
  switchAnalysisColorMode,
  switchAnalysisSizeMode
} from '../Actions';

/**
 * A nice little list with fun little radio buttons that handles change events
 */
class AnalysisToggler extends React.Component {
  render() {
    return (
      <div className={"radioset " + this.props.classname} onChange={this.props.onChange}>
        <ul>{this.props.analysisModes.map(am =>
          <li key={am.id}>
            <input type="radio" name={"radio" + this.props.name} id={am.id} checked={am.selected} />
            <label>{am.label}</label>
          </li>
        )}</ul>
        <div className="title">{this.props.name + " of bubbles"}</div>
      </div>
    );
  }
}

/**
 * Create a toggler for color mode and size mode
 */
export default class AnalysisToggle extends React.Component {
  render() {
    return (
      <form className="analysis-toggle">
        <AnalysisToggler className="color"
          onChange={e => switchAnalysisColorMode(e.target.id)}
          analysisModes={this.props.analysisColorModes}
          name="Color" />
        <AnalysisToggler className="size"
          onChange={e => switchAnalysisSizeMode(e.target.id)}
          analysisModes={this.props.analysisSizeModes}
          name="Size" />
      </form>
    );
  }
}
