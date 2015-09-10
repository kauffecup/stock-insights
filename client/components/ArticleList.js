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
      <div className="article">
        <a className="title-link" href={a.url} target="_blank">{a.title}</a>
      </div>
    );
  }
}

export default class ArticleList extends React.Component {
  constructor(props) {
    super(props);
    // instantiate this this way so that we have a reference to the bound function
    // this is necessary for document add/remove event listener to work properly
    this._handleClear = this.handleClear.bind(this);
  }

  render() {
    var articles = this.props.articles.map(a => <Article article={a} />);
    var classes = classnames('article-list', {
      'has-article': !!this.props.selectedCompany
    });
    return (
      <div className={classes} onClick={e => e.stopPropagation()}>
        <button className="back" onClick={closeArticleList}>x</button>
        <h2>{this.props.selectedCompany && (this.props.selectedCompany._id || this.props.selectedCompany)}</h2>
        <ul className="the-articles">
          {articles}
        </ul>
      </div>
    );
  }

  /**
   * Only close the article list if the document click event happens outside of this component's
   * dom node
   */
  handleClear(event) {
    if (!React.findDOMNode(this).contains(event.target)) {
      closeArticleList();
    }
  }

  /**
   * When mounting/unmounting set up the clear click handlers
   */
  componentDidMount() {
    document.addEventListener('click', this._handleClear);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this._handleClear);
  }
}
