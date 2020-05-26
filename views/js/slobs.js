class Slobs {

    timeouts = {};
    scene = null;
    lastTime = 0;

    init(force) {
        return new Promise((resolve, reject) => {
            this.getLiveScene(force)
                .then(scene => {
                    $('#slobs-url').parent().setValid(true);
                    $('#slobs-token').parent().setValid(true);

                    $('#live-error').clearError();
                    resolve(scene);
                })
                .catch(resp => {
                    if (resp.reason === 'auth') {
                        $('#slobs-token').parent().setValid(false);
                        $('#slobs-url').parent().setPristine();
                    } else {
                        $('#slobs-url').parent().setValid(false);
                        $('#slobs-token').parent().setPristine();
                    }
                    $('#live-error').addError("Streamlabs OBS " + resp.message);
                    reject(resp);
                });
        });
    }

    resetItem(name, time) {
        return new Promise((resolve, reject) => {
            if (this.timeouts[name]) {
                clearTimeout(this.timeouts[name]);
                this.timeouts[name] = null;
                this.toggleItem(name, false)
                    .then(() => this.timeouts[name] = setTimeout(() => this.displayItem(name, time).then(resolve).catch(reject), 2000));
            } else {
                this.displayItem(name, time).then(resolve).catch(reject);
            }
        });
    }

    displayItem(name, time) {
        return new Promise((resolve, reject) => {
            this.toggleItem(name, true)
                .then(() => {
                    if (this.timeouts[name]) {
                        clearTimeout(this.timeouts[name]);
                        this.timeouts[name] = null;
                    }
                    this.timeouts[name] = setTimeout(() => {
                        this.toggleItem(name, false)
                            .then(resolve)
                            .catch(reject);
                        clearTimeout(this.timeouts[name]);
                        this.timeouts[name] = null;
                    }, time * 1000);
                }).catch(reject);
        });
    }
    setItemSource(name, src) {
        return new Promise((resolve, reject) => {
            this.init(false)
                .then((scene) => {
                    let item = scene.nodes.find(n => n.name === name);
                    $.get('/slobs/set-source/' + item.sourceId + '/' + src);
                    resolve(scene);
                })
                .catch(reject);
        });
    }
    getLiveScene(force) {
        return new Promise((resolve, reject) => {
            if (!force && !!this.scene && this.lastTime + 60000 > new Date().getTime()) {
                resolve(this.scene);
            }
            else {
                $.post('/slobs', { url: app.ldvelh.config.slobs.url, token: app.ldvelh.config.slobs.token },
                    resp => {
                        if (resp.connected) {
                            $.get('/slobs/scenes/Live Scene',
                                scene => {
                                    if (scene) {
                                        this.lastTime = new Date().getTime();
                                        this.scene = scene;
                                        resolve(this.scene);
                                    }
                                });
                        }
                        else {
                            reject(resp);
                        }
                    }
                ).fail(resp => {
                    reject(resp.responseJSON);
                });
            }
        });
    }

    toggleItem(name, show) {
        return new Promise((resolve, reject) => {
            this.init(false)
                .then(scene => { this.toggleItemInScene(name, show); resolve(scene); })
                .catch(reject);
        });
    }

    toggleItemInScene(name, show) {
        let item = this.scene.nodes.find(n => n.name === name);
        this.toggleItemInSceneByItem(item, show);
    }

    toggleItemInSceneByItem(item, show) {
        if (item.sceneNodeType === 'folder') {
            this.scene.nodes.filter(n => n.parentId === item.id).forEach(n => this.toggleItemInSceneByItem(n, show));
        }
        else {
            $.get('/slobs/set-visibility/"' + item.sceneId + '","' + item.id + '","' + item.sourceId + '"/' + (show ? 'true' : 'false'));
        }
    }
}
