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

import React     from 'react';
import ReactDOM  from 'react-dom';
import Constants from '../constants/Constants';

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
    var value = event.target.value;
    this.setState({value: value});
    if (!value) {
      this.props.onClear();
    }
    this._searchTimeout && clearTimeout(this._searchTimeout);
    this._searchTimeout = setTimeout(() => {
      if (this.state.value.length > 1) {
        this.props.onSearch(this.state.value);
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
      this.props.onSearch(this.state.value);
    }
  }

  /**
   * Only clear the drop down if the document click event happens outside of this component's
   * drop down and the component wasn't a potential-company <li>. The second check is necessary
   * because clicking on the <li> removes it from the drop down.
   */
  handleClear(event) {
    if (!ReactDOM.findDOMNode(this).contains(event.target) &&
      !event.target.classList.contains('potential-company') &&
      this.props.potentialCompanies.length) {
      this.setState({value: ''});
      this.props.onClear();
    }
  }

  /**
   * When adding a company... add the company, clear and refocus the input
   */
  handleClick(company) {
    this.props.onCompanyAdd(company);
    this.setState({value: ''});
    this.refs.input.getDOMNode().focus();
  }

  /**
   * It's render time.
   */
  render() {
    var {potentialCompanies, loadingStatus, companies} = this.props;
    var value = this.state.value;
    // some potential companies magic. goes through these steps:
    // 1. filter out companies that match the current value. this allows us to immediately
    //    filter down the list as the user's typing and network requests may/may not be happening
    //    in the background. makes it feel snappier
    // 2. filter out companies that have already been added by the user
    // 3. limit the results to 15. this prevents the page feeling sluggish
    const regex = new RegExp('^' + value, 'i');
    potentialCompanies = potentialCompanies.filter(pC =>
      value ? regex.test(pC.description) : false
    ).filter(pc =>
      !companies.some(c => (c.description === pc.description) && (c.symbol === pc.symbol))
    ).map(pC =>
      <li className="potential-company" onClick={this.handleClick.bind(this, pC)} key={pC.symbol}>
        {pC.description + ' (' + pC.symbol + ')'}
      </li>
    ).slice(0, 15);

    // if we're cleared or there's nothing in the input, don't display anything in the dropdown
    if (loadingStatus === Constants.POTENTIAL_STATUS_CLEAR || !value) {
      potentialCompanies = null;
    // if we're loading and don't have any companies loaded already, show the loading message
    } else if (loadingStatus === Constants.POTENTIAL_STATUS_LOADING && !potentialCompanies.length) {
      potentialCompanies = <li className="potential-company">{this.props.strings.loading}</li>;
    // otherwise we've gotten stuff back, if we don't have anythin' show the no results message
    } else if (!potentialCompanies.length) {
      potentialCompanies = <li className="potential-company">{this.props.strings.noResults}</li>;
    }
    // if none of these cases were hit, we proceed on as usual with our potential companies array


    // once we've done our magic, go on with rendering as normal
    return (
      <div className="company-searcher" onFocus={this.handleFocus.bind(this)}>
        <input type="text"
          value={value}
          list="potential-companies"
          onChange={this.handleChange.bind(this)}
          placeholder={this.props.strings.companySearch}
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
