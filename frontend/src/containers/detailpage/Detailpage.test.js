import React from 'react';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';
import { connectRouter, ConnectedRouter } from 'connected-react-router';
import {BrowserRouter, Router, Route, Redirect, Switch} from 'react-router-dom';
import { createBrowserHistory } from 'history' ;
import {getMockStore} from '../../test-utils/mocks.js'

import Detailpage from './Detailpage'

const stubState = {
  ingredientList: [
      {'name': 'ingredient', 'quantity': 100, 'price': 1000, 'price_normalized': 10,
      'igd_type': 'g', 'brand': 'CU', 'picutre': 'image'}
  ]
}

const history = createBrowserHistory()
const mockStore = getMockStore(stubState)


describe('<Detailpage />', () => {
    let detailpage;

    beforeEach(() => {
      detailpage = (
        <Provider store={mockStore}>
          <Router history={history}>
              <Detailpage history={history}/>
          </Router>
        </Provider>
      );
    })
  
    it('should render Createpage', () => {
      console.log('hi, to fill')
    });
});