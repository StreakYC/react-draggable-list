module.exports = {
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "jest": true,
    "node": true,
    "es6": true
  },
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true
    },
    "sourceType": "module"
  },
  "plugins": [
    "react", "flowtype"
  ],
  "rules": {
    "flowtype/define-flow-type": 1,
    "flowtype/require-valid-file-annotation": ["error", "always"],

    "react/no-children-prop": ["off"],

    "react/no-deprecated": ["off"], // TODO remove when we target 16.3

    "indent": ["error", 2],
    "react/jsx-indent": ["error", 2],
    "react/jsx-indent-props": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single", "avoid-escape"],
    "semi": ["error", "always"],
    "no-var": ["error"],
    "brace-style": ["error"],
    "array-bracket-spacing": ["error", "never"],
    "block-spacing": ["error", "always"],
    "no-spaced-func": ["error"],
    "no-whitespace-before-property": ["error"],
    "space-before-blocks": ["error", "always"],
    "keyword-spacing": ["error"],
    "no-unused-vars": ["error", {"argsIgnorePattern": "[iI]gnored"}],

    // We use Flow for this
    "react/prop-types": ["off"],

    // TODO remove?
    "react/no-find-dom-node": ["off"],
  },
  "settings": {
    "react": {
      "version": "16.0",
      "flowVersion": "0.85"
    }
  }
};
