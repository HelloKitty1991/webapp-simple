const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseDir = path.join(__dirname, 'src');
const dirs = fs.readdirSync(baseDir);
const entry = {};
const htmlWebpackPlugins = [];
dirs.forEach(dir => {
    const indexPath = path.join(baseDir, dir, 'index.js');
    const htmlTemplatePath = path.join(baseDir, dir, 'index.html');
    if(fs.existsSync(indexPath)) {
        entry[dir] = indexPath;
        if(fs.existsSync(htmlTemplatePath)) {
            htmlWebpackPlugins.push(new HtmlWebpackPlugin({
                template: htmlTemplatePath,
                filename: `${dir}/index.html`,
                chunks: [dir]
            }));
        }
    }
});

module.exports = {
    entry,
    output: {
        filename: `[name]/index.js`,
        path: path.join(__dirname, 'dist')
    },
    plugins: [
        ...htmlWebpackPlugins
    ]
}