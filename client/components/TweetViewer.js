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
import classNames from 'classnames';
import Status     from './Status';

export default class TweetViewer extends Component {
  render() {
    var {description, tweets, sentiment} = this.props;
    return (
      <div className="tweet-viewer">
        <div className="tweet-description">{description.symbols.join(', ') + ' ' + description.entity}</div>
        {<Status sentiment={sentiment} strings={this.props.strings} />}
        <ul className="tweets">{tweets.map(t =>
          <li className={classNames('tweet', t.sentiment && t.sentiment.toLowerCase())}>{t.message}</li>
        )}</ul>
      </div>
    );
  }
}

TweetViewer.propTypes = {
  description: PropTypes.object.isRequired,
  sentiment: PropTypes.object.isRequired,
  tweets: PropTypes.array.isRequired,
  strings: PropTypes.object.isRequired
};
