// webpack.config.js
let webpack = require('webpack');

module.exports = {
    entry: './src/index.ts',
    mode: "production",
    output: {
        filename: '[name].js',
        path: __dirname + '/dist'
    },
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"],
        modules: ["node_modules"]
    },
    module: {
        rules: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            {
                test: /\.tsx?$/,
                use: {
                    loader: "ts-loader"
                }
            },
        ]
    }
};
