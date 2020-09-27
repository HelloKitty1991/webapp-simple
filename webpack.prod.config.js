const { merge } = require('webpack-merge');

const config = require('./webpack.base')('production');

module.exports = merge(config, {
    mode: 'production'
});