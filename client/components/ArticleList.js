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
import classnames from 'classnames';
import {
  closeArticleList
} from '../Actions';

class Article extends React.Component {
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

export default class ArticleList extends React.Component {
  render() {
    var articles = this.props.articles.sort((a1, a2) => {
      var title1 = a1.title.toLowerCase();
      var title2 = a2.title.toLowerCase();
      if (title1 < title2) { return -1; }
      else if (title1 > title2) {return 1; }
      else { return 0; }
    }).map(a => <Article article={a} />);
    var classes = classnames('article-list', {
      'has-article': !!this.props.selectedCompany
    });
    return (
      <div className={classes} onClick={e => e.stopPropagation()}>
        <button className="back" onClick={closeArticleList}>x</button>
        <h2>{this.props.selectedCompanies.join(', ')}</h2>
        <ul className="the-articles">
          {articles}
        </ul>
      </div>
    );
  }
}
