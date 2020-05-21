
app.get('/get-file/:file', function (req, res) {
	res.sendFile(path.join(__dirname + '/files/' + req.params.file));
});