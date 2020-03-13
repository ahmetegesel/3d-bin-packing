module.exports = {
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error']
  },
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  }
};
