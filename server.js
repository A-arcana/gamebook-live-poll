
const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

const Slobs = require('./server/services/slobs');

function include(file_) {
    with (global) {
        eval(fs.readFileSync(file_) + '');
    };
};

dotenv.config();

const app = express();
app.use(express.static(process.env.SERVE_DIRECTORY || 'dist'));

slobs = new Slobs();
slobs.init();

include('server/routes.js');

const options = {
	key: fs.readFileSync('key.pem', 'utf8'),
	cert: fs.readFileSync('cert.pem', 'utf8'),
	passphrase: process.env.HTTPS_PASSPHRASE || ''
};
const server = https.createServer(options, app);

server.listen(process.env.SERVER_PORT || 8443);