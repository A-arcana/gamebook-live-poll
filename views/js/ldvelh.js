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
        this.saveDOM();
        setCookie('ldvelh-app', JSON.stringify(this.config));
    }
    saveDOM() {
        this.config.liveId = $('#live-id').val();

        this.config.bookNo = $('#book-no').val();
        this.config.lastNo = $('#last-no').val();

        this.config.tsv = $('#tsv').val();
        this.config.cols.colId = $('#colId').val();
        this.config.cols.colQuestion = $('#colQuestion').val();
        this.config.cols.colOption = $('#colOption').val();
    }
    load() {
        this.config = JSON.parse(getCookie('ldvelh-app'));
        this.loadDOM();
    }
    loadDOM() {
        $('#live-id').val(this.config.liveId);
        $('#live-id').parent().toggleClass("is-filled", this.config.liveId);

        $('#book-no').val(this.config.bookNo);
        $('#book-no').parent().toggleClass("is-filled", this.config.bookNo);

        $('#last-no').val(this.config.lastNo);
        $('#last-no').parent().toggleClass("is-filled", this.config.lastNo);

        $('#tsv').val(this.config.tsv);
        $('#tsv').parent().toggleClass("is-filled", this.config.tsv);
        $('#colId').val(this.config.cols.colId);
        $('#colId').parent().toggleClass("is-filled", this.config.cols.colId > 0);
        $('#colQuestion').val(this.config.cols.colQuestion);
        $('#colQuestion').parent().toggleClass("is-filled", this.config.cols.colQuestion > 0);
        $('#colOption').val(this.config.cols.colOption);
        $('#colOption').parent().toggleClass("is-filled", this.config.cols.colOption > 0);
    }
}
