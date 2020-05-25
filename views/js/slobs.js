class Slobs {

    timeouts = {};
    scene = null;
    lastTime = 0;

    displayItem(name, time) {
        this.toggleItem(name, true);
        if (this.timeouts[name]) {
            clearTimeout(this.timeouts[name]);
        }
        this.timeouts[name] = setTimeout(() => this.toggleItem(name, false), time * 1000);
    }
    setItemSource(name, src) {
        this.getLiveScene().then((scene) => {
            let item = scene.nodes.find(n => n.name === name);
            $.get('/slobs/set-source/' + item.sourceId + '/' + src);
        });
    }
    getLiveScene(force) {
        return new Promise((resolve, reject) => {
            if (!force && this.scene && this.lastTime + 60000 < new Date().getTime()) {
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
        this.getLiveScene().then(scene => this.toggleItemInScene(name, show));
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
