const { merge } = require('webpack-merge');
const path = require('path');
const config = require('./webpack.base');

module.exports = merge(config, {
    mode: 'development',
    devServer: {
        contentBase: path.join(__dirname, 'dist')
    }
});