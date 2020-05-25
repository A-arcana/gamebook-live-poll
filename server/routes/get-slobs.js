
app.post('/slobs', (req, res) => {
	slobs.slobs_url = req.body.url;
	slobs.slobs_token = req.body.token;

	slobs.init(5)
		.then(() => res.send({ connected: true, message: "connected" }))
		.catch((reason) => res.status(500).send({ connected: false, reason: reason.label, message: reason.message, object: reason.object}));
});

app.get('/slobs/scenes/:id', (req, res) => {
	let method = req.params.method;
	let id = req.params.id;

	slobs
		.request("ScenesService", "getScenes")
		.then(scenes => {
			res.send(scenes.find(scene => scene.name === id));
		})
		.catch((reason) => res.status(500).send(reason));
});

app.get('/slobs/set-source/:id/:file', (req, res) => {
	let method = req.params.method;
	let id = req.params.id;
	let file = req.params.file;

	slobs
		.request('Source["' + id + '"]', "updateSettings", { file: file })
		.then(data => {
			console.log(data);
			res.send(data);
		})
		.catch((reason) => res.status(500).send(reason));
});

app.get('/slobs/set-visibility/:id/:arg', (req, res) => {
	let method = req.params.method;
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