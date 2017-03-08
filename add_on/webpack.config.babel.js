import path from 'path'

module.exports = {
  entry: {
    content: './src/content/main.js',
    background: './src/background/main.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ],
    alias: {
      config: path.resolve(__dirname, 'config'),
    }
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ['es2015', { modules: false }],
            ],
          },
        }
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ["style", "css?modules"],
      },
      {
        test: /\.ya?ml$/,
        exclude: /node_modules/,
        use: "yml-loader"
      },
    ]
  }
}
