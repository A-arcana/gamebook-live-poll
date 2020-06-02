

app.get('/get-html', (req, res) => {
    var url = req.query.url;

    let client = http;

    if (url.toString().indexOf("https") === 0) {
        client = https;
    }

    client.get(url, { rejectUnauthorized: false }, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            res.send(data);
        });

    }).on("error", (err) => {
        res.send(err);
    });
});