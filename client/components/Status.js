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

export default class Status extends Component {
  render() {
    var {positive: positiveResults, negative: negativeResults, neutral: neutralResults} = this.props.sentiment;
    var {loading, noResults, positive, neutral, negative} = this.props.strings;

    var statusNoResults = (positiveResults === 0 && negativeResults === 0 && neutralResults === 0);
    var statusLoading = typeof positiveResults === 'undefined' && typeof negativeResults === 'undefined' && typeof neutralResults === 'undefined';

    var me;
    if (statusNoResults) {
      me = <div>{noResults}</div>;
    } else if (statusLoading) {
      me = <div>{loading}</div>;
    } else {
      me = (
        <div className="sentiment">
          <div className="positive">{positive + ' ' + positiveResults}</div>
          <div className="neutral">{neutral + ' ' + neutralResults}</div>
          <div className="negative">{negative + ' ' + negativeResults}</div>
        </div>
      );
    }
    return me;
  }
}

Status.propTypes = {
  sentiment: PropTypes.object.isRequired,
  strings: PropTypes.object.isRequired
};
