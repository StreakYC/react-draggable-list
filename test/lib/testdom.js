function init() {
  if (typeof document !== 'undefined') return;
  const jsdom = require("jsdom").jsdom
  global.document = jsdom('');
  global.window = document.defaultView;
  global.navigator = window.navigator;
  global.HTMLElement = window.HTMLElement;
}

init();
