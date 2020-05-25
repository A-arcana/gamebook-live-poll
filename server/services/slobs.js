const sockjs = require('sockjs-client');

class Slobs {

    socket = null;
    interval = null;
    requests = {};
    nextRequestId = 1;
    subscriptions = {};
    slobs_url = null;
    slobs_token = null;

    init(nbTry) {
        return new Promise((resolve, reject) => {
            clearTimeout(this.interval);
            console.log("Initialize Streamlabs OBS on ", this.slobs_url + " - remaining tries: " + nbTry);
            this.socket = new sockjs(this.slobs_url + "/api");

            this.socket.onopen = () => {
                console.log("streamlabs connected");

                if (this.slobs_token) {
                    console.log("authorize Streamlabs OBS with Token");
                    this.request("TcpServerService", "auth", this.slobs_token)
                        .then(resolve)
                        .catch((r) => reject({ label: "auth", message: "Authorize failed", object: r }));
                }
                else {
                    nbTry = -1;
                    return this.request("ScenesService", "getScenes")
                        .then(resolve)
                        .catch(r => {
                            let rejection = {};
                            if (r.message.indexOf("Authorization required" >= 0)) {
                                rejection.label = "auth";
                            }
                            else {
                                rejection.label = "unknown";
                            }
                            rejection.message = r.message;
                            rejection.object = r;
                            reject(rejection);
                        });
                }
            };

            this.socket.onclose = () => {
                console.log("streamlabs disconnected");
                this.socket = null;

                if (nbTry === 1) {
                    return reject();
                }
                else if (nbTry > 0) {
                    nbTry--;
                }
                this.interval = setTimeout(() => this.init(nbTry).then(resolve).catch(() => reject({ label: "connection", message: "Too many attemps to connect" })), 2000);
            };

            this.socket.onmessage = (e) => {
                this.messageHandler(e.data);
            };
        });
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
            try {
                this.socket.send(JSON.stringify(requestBody));
            }
            catch (e) {
                reject();
            }
        });
    }
}

module.exports = Slobs;