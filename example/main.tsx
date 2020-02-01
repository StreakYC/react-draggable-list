import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Example from './Example';

const onReady = new Promise((resolve) => {
  if (document.readyState === 'complete') {
    resolve();
  } else {
    document.addEventListener('DOMContentLoaded', resolve, false);
    window.addEventListener('load', resolve, false);
  }
});

function main() {
  const mainDiv = document.getElementById('main');
  if (!mainDiv) throw new Error();
  ReactDOM.render(<Example />, mainDiv);
}

onReady.then(main).catch(e => {
  console.error(e, e.stack); // eslint-disable-line no-console
});
