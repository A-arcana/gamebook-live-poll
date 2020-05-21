
app.get('/slobs/scenes/:id', function (req, res) {
	let method = req.params.method;
	let id = req.params.id;

	slobs
		.request("ScenesService", "getScenes")
		.then(scenes => {
			res.send(scenes.find(scene => scene.name === id));
		});
});

app.get('/slobs/set-source/:id/:file', function (req, res) {
	let method = req.params.method;
	let id = req.params.id;
	let file = req.params.file;

	slobs
		.request('Source["' + id + '"]', "updateSettings", { file: file })
		.then(data => {
			console.log(data);
			res.send(data);
		});
});

app.get('/slobs/set-visibility/:id/:arg', function (req, res) {
	let method = req.params.method;
	let id = req.params.id;
	let arg = req.params.arg;

	slobs
		.request('SceneItem[' + id + ']', "setVisibility", arg === "true")
		.then(data => {
			console.log(data);
			res.send(data);
		});
});