'use strict';

const express = require('express');
const port = process.env.PORT || 3000;
const app = express();
const shutdownHook = require('./main/shutdown-hook');
const rnd = require('./main/rnd');
const siteGenerator = require('./main/site-generator');

app.get('/', function (req, res) {
  res.redirect('/index.html');
});

const options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: ['index.html'],
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
};
app.use(express.static(siteGenerator(), options));

const server = app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
shutdownHook(server);
