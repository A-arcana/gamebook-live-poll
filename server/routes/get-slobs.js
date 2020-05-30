
app.post('/slobs', (req, res) => {
	slobs.slobs_url = req.body.url;
	slobs.slobs_token = req.body.token;

	slobs.init(5)
		.then(() => res.send({ connected: true, message: "connected" }))
		.catch((reason) => res.status(500).send({ connected: false, reason: reason.label, message: reason.message, object: reason.object}));
});

app.get('/slobs/scenes/:name', (req, res) => {
	let name = req.params.name;

	slobs
		.request("ScenesService", "getScenes")
		.then(scenes => {
			res.send(scenes.find(scene => scene.name === name));
		})
		.catch((reason) => res.status(500).send(reason));
});

app.get('/slobs/scenes/:id/activate', (req, res) => {
	let id = req.params.id;

	slobs
		.request("ScenesService", "makeSceneActive", id)
		.then(resp => {
			res.send(resp);
		})
		.catch((reason) => res.status(500).send(reason));
});

app.get('/slobs/sources/:id/set-source/:src', (req, res) => {
	let id = req.params.id;
	let src = req.params.src;

	slobs
		.request('Source["' + id + '"]', "updateSettings", { file: src })
		.then(data => {
			console.log(data);
			res.send(data);
		})
		.catch((reason) => res.status(500).send(reason));
});

app.get('/slobs/sources/:id/set-visibility/:arg', (req, res) => {
	let id = req.params.id;
	let arg = req.params.arg;

	slobs
		.request('SceneItem[' + id + ']', "setVisibility", arg === "true")
		.then(data => {
			console.log(data);
			res.send(data);
		})
		.catch((reason) => res.status(500).send(reason));
});