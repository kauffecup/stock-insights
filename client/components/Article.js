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

export default class Article extends Component {
  render() {
    var a = this.props.article;
    return (
      <li className="article">
        <a className="title-link" href={a.url} target="_blank">{a.title}</a>
        <ul className="relations">{a.relations.map(r =>
          <li className="relation">{r}</li>
        )}</ul>
      </li>
    );
  }
}

Article.propTypes = {
  article: PropTypes.object.isRequired
};
