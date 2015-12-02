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

import React, { Component, PropTypes } from 'react';
import classNames      from 'classnames';

/**
 * An individual company. Displays the description, ticker symbol, and an `x` that you can
 * click on to remove the company
 */
export default class Company extends Component {
  render() {
    var c = this.props.company;
    var classes = classNames('company', {
      selected: this.props.selected
    });
    return (
      <div className={classes} onClick={this.props.onClick}>
        <span className="company-description">{c.description}</span>
        <span className="company-symbol">{c.symbol}</span>
        <span className="company-close" onClick={e => {e.stopPropagation(); this.props.onRemoveClick(c);}}>x</span>
      </div>
    );
  }
}

Company.propTypes = {
  company: PropTypes.object.isRequired,
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onRemoveClick: PropTypes.func.isRequired
};
