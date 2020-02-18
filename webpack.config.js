require('dotenv').config();
const webpack = require('webpack');
const path = require('path');

var config = {
  // TODO: Add common Configuration
  mode: process.env.MODE,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'LOCAL_NODE': JSON.stringify(process.env.LOCAL_NODE),
        'MODE': JSON.stringify(process.env.MODE),
      }
    })
  ],
  node: {
    net: 'empty',
    tls: 'empty',
    dns: 'empty'
  },
  externals: [{
    xmlhttprequest: '{XMLHttpRequest:XMLHttpRequest}'
  }]
};

var SellerConfig = Object.assign({}, config, {
  name: "app",
  entry: './client/webpacks/loadSeller.js',
  output: {
    filename: 'bundleSeller.js',
    path: path.resolve(__dirname, 'client/dist')
  },
});

var BuyerConfig = Object.assign({}, config, {
  name: "buyer",
  entry: './client/webpacks/loadBuyer.js',
  output: {
    filename: 'bundleBuyer.js',
    path: path.resolve(__dirname, 'client/dist')
  },
});

var ShipperConfig = Object.assign({}, config, {
  name: "buyer",
  entry: './client/webpacks/loadShipper.js',
  output: {
    filename: 'bundleShipper.js',
    path: path.resolve(__dirname, 'client/dist')
  },
});

var ConfirmConfig = Object.assign({}, config, {
  name: "buyer",
  entry: './client/webpacks/loadConfirm.js',
  output: {
    filename: 'bundleConfirm.js',
    path: path.resolve(__dirname, 'client/dist')
  },
});
// Return Array of Configurations
module.exports = [
  SellerConfig, 
  BuyerConfig,
  ShipperConfig,
  ConfirmConfig
];