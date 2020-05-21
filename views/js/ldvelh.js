class LDVELH {

    config = {
        liveId: '',
        tsv: '',
        cols: {
            colId: 1,
            colQuestion: 2,
            colOption: 3
        },
        bookNo: '',
        lastNo: ''
    };

    lines = {};
    pictureTimeout = {};
    save() {
        setCookie('ldvelh-app', JSON.stringify(this.config));
    }

    load() {
        this.config = JSON.parse(getCookie('ldvelh-app'));
        this.loadDOM();
    }
    loadDOM() {
        $('#live-id').val(this.config.liveId);

        $('#book-no').val(this.config.bookNo);
        $('#last-no').val(this.config.lastNo);

        $('#tsv').val(this.config.tsv);
        $('#colId').val(this.config.cols.colId);
        $('#colQuestion').val(this.config.cols.colQuestion);
        $('#colOption').val(this.config.cols.colOption);
    }
}
