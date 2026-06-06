import globals from "globals";
import reactPlugin from "eslint-plugin-react";

export default [
  {
    files: ["electron/**/*.js", "src/**/*.js", "src/**/*.jsx", "tests/**/*.js"],
    plugins: {
      react: reactPlugin
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "no-console": ["warn", { allow: ["info", "warn", "error"] }],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    }
  }
];
