const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = function(env) {
    let plugins = [
        new webpack.ProvidePlugin({
            THREE: 'three',
        }),
        // clean export folder
        new CleanWebpackPlugin('dist', {
            root: __dirname
        }),
        // create styles css
        new ExtractTextPlugin(env == 'prod' ? '[name].[contenthash].css' : '[name].css'),
        // create vendor bundle with all imported node_modules
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module) {
               return module.context && module.context.indexOf('node_modules') !== -1;
            }
        }),
        // create webpack manifest separately
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest'
        }),
        // create html
        new HtmlWebpackPlugin({
            template: 'index.html',
            chunksSortMode: 'dependency'
        }),
    ];
    /*if (env == 'dev') {


    }
    else {

        // uglify
        plugins.push(new UglifyJSPlugin({
            sourceMap: false,
            compress: {
                warnings: false,
            },
        }));
    }*/

    return {
        context: path.resolve(__dirname, 'app'),
        devServer: {
            host: "localhost",
            disableHostCheck: true
        },
        entry: {
            main: './index.js'
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: env == 'prod' ? '[name].[chunkhash].js' : '[name].js',
        },
        module: {
            rules: [{
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
             },{
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: 'css-loader'
                })
            },  {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader', // creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader', // translates CSS into CommonJS
                    },
                    {
                        loader: 'less-loader', // compiles Less to CSS
                    },
                ],
            },{
                test: [/\.mp3$/, /\.png$/, /\.dae$/, /\.jpg$/, /\.obj$/, /\.fbx$/, /\.glb$/, /\.gltf$/, /\.json$/, /\.dae$/, /\.mtl$/, /\.fbx$/],
                use: ['file-loader?name=[path][name].[hash].[ext]']
            },{
                test:[/\.vert$/,/\.frag$/],
                loader: 'webpack-glsl-loader'
            },{
                test: /\.woff$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff"
            },{
                test: /\.ttf$/,
                loader: "url-loader?limit=10000&mimetype=application/octet-stream"
            },{
                test: /\.eot$/,
                loader: "file-loader"
            },{
                test: /\.svg$/,
                loader: "url-loader?limit=10000&mimetype=image/svg+xml"
            }
            ]
        },
        devtool: env == 'dev' ? 'cheap-eval-source-map' : '',
        plugins: plugins,
    }
};
