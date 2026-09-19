export default [
  {
    ignores: ["node_modules/**", "public/dist/**", "database/*.db"]
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        process: "readonly",
        __dirname: "readonly",
        require: "readonly",
        module: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "semi": ["error", "always"],
      "quotes": ["error", "single", { "avoidEscape": true }]
    }
  }
];
