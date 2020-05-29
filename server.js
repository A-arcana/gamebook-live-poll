
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

if (process.env.NODE_ENV) {
    dotenv.config(
        {
            path: path.resolve(process.cwd(), '.env') +
                '.' + process.env.NODE_ENV
        }
    );
}
else {
    dotenv.config();
}

const app = express();
app.use(express.static(process.env.SERVE_DIRECTORY || 'dist'));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

slobs = new Slobs();

include('server/routes.js');

const options = {
    key: fs.readFileSync('key.pem', 'utf8'),
    cert: fs.readFileSync('cert.pem', 'utf8'),
    passphrase: process.env.HTTPS_PASSPHRASE || ''
};

const port = process.env.PORT ||
    process.env.SERVER_PORT ||
    8443;

// listen for requests :)
const listener = app.listen(port, () => {
    console.log("Your app is listening on port " + listener.address().port);
});

setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);