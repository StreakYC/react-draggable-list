module.exports = {
  "parser": "@typescript-eslint/parser",
  "env": {
    "browser": true,
    "jest": true,
    "node": true,
    "es6": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint", "react"
  ],
  "rules": {
    "react/no-children-prop": ["off"],

    "@typescript-eslint/no-non-null-assertion": ["off"],
    "@typescript-eslint/no-explicit-any": ["off"],
    "@typescript-eslint/explicit-function-return-type": ["off"],
    "@typescript-eslint/no-unused-vars": ["error", {"argsIgnorePattern": "[iI]gnored"}],

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

    // We use Typescript for this
    "react/prop-types": ["off"],
  },
  "settings": {
    "react": {
      "version": "16.6"
    }
  }
};
