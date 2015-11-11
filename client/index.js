import React           from 'react'
import { render }      from 'react-dom'
import { createStore } from 'redux'
import { Provider }    from 'react-redux'
import StockInsights   from './main'
import stockApp        from './reducers/stockApp'

let store = createStore(stockApp)
let rootElement = document.body;

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
render(
  <Provider store={store}>
    <StockInsights />
  </Provider>,
  rootElement
);
