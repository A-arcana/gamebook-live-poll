const sockjs = require('sockjs-client');

class Slobs {

    socket = null;
    interval = null;
    requests = {};
    nextRequestId = 1;
    subscriptions = {};
    slobs_url = null;
    slobs_token = null;

    init() {
        console.log("initialize Streamlabs OBS on ", this.slobs_url);
        this.socket = new sockjs(this.slobs_url + "/api");

        clearInterval(this.interval);

        this.socket.onopen = () => {
            console.log("streamlabs connected");
        };

        this.socket.onclose = () => {
            console.log("streamlabs disconnected");
            this.socket = null;
            this.interval = setInterval(() => this.init(), 2000);
        };

        this.socket.onmessage = (e) => {
            this.messageHandler(e.data);
        };

        if (this.slobs_token) {
            console.log("authorize Streamlabs OBS with Token");
            this.request("TcpServerService", this.slobs_token);
        }
    }
    messageHandler(data) {
        let message = JSON.parse(data);
        let request = this.requests[message.id];

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

        console.log('response', result);

        if (result._type === 'EVENT' && result.emitter === 'STREAM') {
            this.subscriptions[message.result.resourceId](result.data);
        }
    }
    request(resourceId, methodName, ...args) {
        let id = this.nextRequestId++;
        let requestBody = {
            jsonrpc: '2.0',
            id,
            method: methodName,
            params: { resource: resourceId, args }
        };

        return this.sendMessage(requestBody);
    }
    sendMessage(message) {
        let requestBody = message;
        if (typeof message === 'string') {
            try {
                requestBody = JSON.parse(message);
            } catch (e) {
                console.error('Invalid JSON', e);
                return;
            }
        }

        if (!requestBody.id) {
            console.error('id is required');
            return;
        }

        console.log('request', requestBody.id);

        return new Promise((resolve, reject) => {
            this.requests[requestBody.id] = {
                body: requestBody,
                resolve,
                reject,
                completed: false
            };
            this.socket.send(JSON.stringify(requestBody));
        });
    }
}

module.exports = Slobs;