
const fs 		= require('fs');
const https 	= require('https');
const http      = require('http');
const express 	= require('express');
const path 		= require('path');
const dotenv 	= require('dotenv');
const rpc		= require('node-json-rpc2');
const sockjs	= require('sockjs-client');

const STREAMLABS_API_BASE = 'https://www.streamlabs.com/api/v1.0'

dotenv.config();
const app = express();

app.use(express.static(process.env.SERVE_DIRECTORY || 'dist'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/get-html', function(req, res) {
	var url = req.query.url;

	let client = http;

	if (url.toString().indexOf("https") === 0) {
		client = https;
	}

	client.get(url, (resp) => {
		let data = '';

		// A chunk of data has been recieved.
		resp.on('data', (chunk) => {
			data += chunk;
		});

		// The whole response has been received. Print out the result.
		resp.on('end', () => {
			res.send(data);
		});

	}).on("error", (err) => {
		res.send(err);
	});
});

const slobs_root = process.env.SLOBS_HOST+":"+process.env.SLOBS_PORT+"/api";

const slobs = {
	socket: null,
	interval: null,
	requests : {},
	nextRequestId: 1,
	subscriptions: {},
	setClient : function(){
		slobs.socket = new sockjs(slobs_root);

		clearInterval(slobs.interval);

		slobs.socket.onopen = function() {
			console.log("streamlabs connected");
		};

		slobs.socket.onclose = function() {
			console.log("streamlabs disconnected");
			slobs.socket = null;
			slobs.interval = setInterval(slobs.setClient, 2000);
		};
		
		slobs.socket.onmessage = (e) => {
			slobs.messageHandler(e.data);
		};
	},
	messageHandler: function(data){
		let message = JSON.parse(data);
        let request = slobs.requests[message.id];

        if (request) {
          if (message.error) {
            request.reject(message.error);
          } else {
            request.resolve(message.result);
          }
          delete this.requests[message.id];
        }

        const result = message.result;
        if (!result) return;

        if (result._type === 'EVENT' && result.emitter === 'STREAM') {
          slobs.subscriptions[message.result.resourceId](result.data);
        }
	},
	 request(resourceId, methodName, ...args) {
        let id = slobs.nextRequestId++;
        let requestBody = {
          jsonrpc: '2.0',
          id,
          method: methodName,
          params: { resource: resourceId, args }
        };

        return slobs.sendMessage(requestBody);
      },
      sendMessage(message) {
        let requestBody = message;
        if (typeof message === 'string') {
          try {
            requestBody = JSON.parse(message);
          } catch (e) {
            console.error('Invalid JSON');
            return;
          }
        }

        if (!requestBody.id) {
          console.error('id is required');
          return;
        }

        console.log(requestBody, 'request');

        return new Promise((resolve, reject) => {
          slobs.requests[requestBody.id] = {
            body: requestBody,
            resolve,
            reject,
            completed: false
          };
          slobs.socket.send(JSON.stringify(requestBody));
        });
      },
};
slobs.setClient();
app.get('/slobs/:method/:id?/:arg?', function(req, res) {
	let method = req.params.method;
	let id = req.params.id;
	let arg = req.params.arg;
	console.log("request", req.params);
	
	if(method === 'scenes'){
        slobs
			.request("ScenesService", "getScenes")
			.then(scenes => {
			  res.send(scenes.find(scene=>scene.name === id));
			});;
	}
	if(method === 'set-source'){
		slobs
			.request('Source["'+id+'"]', "updateSettings", {file:arg})
			.then(data => {
				console.log(data);
			  res.send(data);
			});
	}
	if(method === 'set-visibility'){
		slobs
			.request('SceneItem['+id+']', "setVisibility", arg==="true")
			.then(data => {
				console.log(data);
			  res.send(data);
			});
	}
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