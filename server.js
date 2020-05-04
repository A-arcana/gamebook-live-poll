
const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(process.env.SERVE_DIRECTORY || 'dist'));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/:file', function(req, res) {
    res.sendFile(path.join(__dirname + '/' + req.params.file));
});

const options = {
  key: fs.readFileSync('key.pem', 'utf8'),
  cert: fs.readFileSync('cert.pem', 'utf8'),
  passphrase: process.env.HTTPS_PASSPHRASE || ''
};
const server = https.createServer(options, app);

server.listen(process.env.SERVER_PORT || 8443);