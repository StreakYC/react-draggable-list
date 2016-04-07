/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import Example from './Example';

const onReady = new Promise((resolve) => {
  if (document.readyState === 'complete') {
    resolve();
  } else {
    document.addEventListener('DOMContentLoaded', resolve, false);
    window.addEventListener('load', resolve, false);
  }
});

onReady.then(main).catch(e => {
  console.error(e, e.stack); // eslint-disable-line no-console
});

function main() {
  const mainDiv = document.getElementById('main');
  ReactDOM.render(<Example />, mainDiv);
}
