
include('server/routes/get-html.js');
include('server/routes/get-file.js');
include('server/routes/get-slobs.js');

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/*', function (req, res) {
	res.sendFile(path.join(__dirname + '/views/' + req.params[0]));
});
