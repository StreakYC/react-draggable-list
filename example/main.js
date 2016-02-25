/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import Example from './Example';

const onReady = new Promise((resolve, reject) => {
  if (document.readyState === "complete") {
    resolve();
  } else {
    document.addEventListener("DOMContentLoaded", resolve, false);
    window.addEventListener("load", resolve, false);
  }
});

onReady.then(main).catch(e => {
  console.error(e, e.stack);
});

function main() {
  const mainDiv = document.getElementById('main');
  ReactDOM.render(<Example />, mainDiv);
}
