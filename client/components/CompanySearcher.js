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

import React from 'react';
import {
  addCompany,
  searchCompany,
  clearPotentialCompanies
} from '../Actions';

/**
 * A CompanySearcher.
 * Has an input! As you type in the input it searches for companies that match
 * what you're typing and displays those in an autocomplete drop down. It excludes
 * the companies that have already been added from the drop down, and limits the drop down
 * to 15 companies
 */
export default class CompanySearcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
    // instantiate this this way so that we have a reference to the bound function
    // this is necessary for document add/remove event listener to work properly
    this._handleClear = this.handleClear.bind(this);
  }
  
  /**
   * Where some of the magic happens.
   * As the user's typing debounce a searchCompany call by 300ms.
   */
  handleChange(event) {
    this.setState({value: event.target.value});
    this._searchTimeout && clearTimeout(this._searchTimeout);
    this._searchTimeout = setTimeout(() => {
      if (this.state.value.length > 1) {
        searchCompany(this.state.value);
      }
      delete this._searchTimeout;
    }, 300);
  }

  /**
   * When focusing the input, if there are 2 or more characters and nothing in the drop down,
   * issue a searchCompany call
   */
  handleFocus(event) {
    if (this.state.value.length > 1 && !this.props.potentialCompanies.length) {
      searchCompany(this.state.value);
    }
  }

  /**
   * Only clear the drop down if the document click event happens outside of this component's
   * drop down and the component wasn't a potential-company <li>. The second check is necessary
   * because clicking on the <li> removes it from the drop down.
   */
  handleClear(event) {
    if (!React.findDOMNode(this).contains(event.target) &&
      !event.target.classList.contains('potential-company')) {
      clearPotentialCompanies();
    }
  }

  /**
   * When adding a company... add the company and then refocus the input
   */
  handleAdd(company) {
    addCompany(company);
    this.refs.input.getDOMNode().focus();
  }

  /**
   * It's render time.
   */
  render() {
    // some potential companies magic. goes through these steps:
    // 1. filter out companies that match the current value. this allows us to immediately
    //    filter down the list as the user's typing and network requests may/may not be happening
    //    in the background. makes it feel snappier
    // 2. filter out companies that have already been added by the user
    // 3. limit the results to 15. this prevents the page feeling sluggish
    var value = this.state.value;
    const regex = new RegExp('^' + value, 'i');
    var potentialCompanies = this.props.potentialCompanies.filter(pC => (
      value ? regex.test(pC.description) : false
    )).filter(pc => (
      !this.props.companies.some(c => (c.description === pc.description) && (c.symbol === pc.symbol))
    )).map(pC =>
      <li className="potential-company" onClick={this.handleAdd.bind(this, pC)} key={pC.symbol}>
        {pC.description + ' (' + pC.symbol + ')'}
      </li>
    ).slice(0, 15);
    // once we've done our magic, go on with rendering as normal
    return (
      <div className="company-searcher" onFocus={this.handleFocus.bind(this)}>
        <input type="text"
          value={value}
          list="potential-companies"
          onChange={this.handleChange.bind(this)}
          placeholder="search for companies..."
          ref="input" />
        <ul className="potential-companies">{potentialCompanies}</ul>
      </div>
    );
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
