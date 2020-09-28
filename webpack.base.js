const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer') ;

const postcssNormalize = require('postcss-normalize');

const baseDir = path.join(__dirname, 'src');
const dirs = fs.readdirSync(baseDir);
const entry = {};
const htmlWebpackPlugins = [];
dirs.forEach(dir => {
    const indexPath = path.join(baseDir, dir, 'index.js');
    const htmlTemplatePath = path.join(baseDir, dir, 'index.html');
    if (fs.existsSync(indexPath)) {
        entry[dir] = indexPath;
        if (fs.existsSync(htmlTemplatePath)) {
            htmlWebpackPlugins.push(new HtmlWebpackPlugin({
                template: htmlTemplatePath,
                filename: `${dir}/index.html`,
                chunks: [dir]
            }));
        }
    }
});

const getStyleLoaders = (cssOptions, preProcessor, env) => {
    const isEnvDevelopment = env === 'development';
    const isEnvProduction = env === 'production';
    const loaders = [
        isEnvDevelopment && require.resolve('style-loader'),
        isEnvProduction && {
            loader: MiniCssExtractPlugin.loader
        },
        {
            loader: require.resolve('css-loader'),
            options: cssOptions,
        },
        {
            loader: require.resolve('postcss-loader'),
            options: {
                postcssOptions: {
                    ident: 'postcss',
                    plugins: [
                        require('postcss-flexbugs-fixes'),
                        require('postcss-preset-env')({
                            autoprefixer: true,
                            stage: 3,
                        }),
                        require('postcss-px-to-viewport')({
                            viewportWidth: 375,  
                            unitPrecision: 5, 
                            viewportUnit: 'vw', 
                            selectorBlackList: [], 
                            exclude: [], 
                            minPixelVaule: 1, 
                            mediaQuery: false,
                            landscape: false,
                            landscapeUnit: "vw",
                        }),
                        postcssNormalize(),
                    ],
                },
                sourceMap: isEnvProduction,
            },
        },
    ].filter(Boolean);
    if (preProcessor) {
        loaders.push(
            {
                loader: require.resolve('resolve-url-loader'),
                options: {
                    sourceMap: isEnvProduction,
                },
            },
            {
                loader: require.resolve(preProcessor),
                options: {
                    sourceMap: true,
                },
            }
        );
    }
    return loaders;
};

module.exports = env => {
    const isEnvProduction = env === 'production';

    return {
        entry,
        output: {
            filename: `[name]/index.js`,
            path: path.join(__dirname, 'dist')
        },
        optimization: isEnvProduction ? {
            splitChunks: {  
                cacheGroups: {
                    commons: {   
                        name: "commons",
                        chunks: "initial", 
                        minSize:0, 
                        minChunks:2,
                        priority: 1
                    },
                    vendors: { 
                        name: "vendors",
                        test: /node_modules/,
                        chunks: "all", 
                        minSize:0,
                        minChunks:1,
                        priority: 2
                    },
                }
            }
        } : undefined,
        module: {
            rules: [
                { parser: { requireEnsure: false } },
                {
                    oneOf: [
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: require.resolve('url-loader'),
                            options: {
                                limit: 2 * 1024,
                                name: 'static/images/[name].[hash:8].[ext]',
                            },
                        },
                        {
                            test: /\.(js|mjs|jsx|ts|tsx)$/,
                            include: baseDir,
                            loader: require.resolve('babel-loader')
                        },
                        {
                            test: /\.css$/,
                            exclude: /node_modules/,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: isEnvProduction,
                            }, '', env),
                            sideEffects: true,
                        },
                        {
                            test: /\.html$/,
                            use: {
                                loader: require.resolve('html-loader')
                            }
                        },
                        {
                            loader: require.resolve('file-loader'),
                            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                            options: {
                                name: 'static/[name].[hash:8].[ext]',
                            },
                        }
                    ],
                },
            ],
        },
        plugins: [
            ...htmlWebpackPlugins,
            new MiniCssExtractPlugin(),
            new BundleAnalyzerPlugin()
        ]
    }
}