
app.get('/get-file/:file', (req, res) => {
	res.sendFile(path.join(__dirname + '/files/' + req.params.file));
});