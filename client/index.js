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

import React          from 'react';
import { render }     from 'react-dom';
import Root           from './containers/Root';
import configureStore from './store/configureStore';

// load our css. there probably is a better way to do this
// but for now this is our move
require('./styles/style.less');
require('./styles/slider.less');


let store = configureStore();
let rootElement = document.getElementById('root');

// make sure all es6 things work correctly in all browsers
require('babel/polyfill');
// load in locales so we can force it if we need to
// require('moment/locale/en');
// require('moment/locale/zh');
require('moment/locale/fr');
require('moment/locale/de');
require('moment/locale/it');
require('moment/locale/ja');
require('moment/locale/pt-br');
require('moment/locale/es');

// React.initializeTouchEvents(true);
render( <Root store={store} />, rootElement );
