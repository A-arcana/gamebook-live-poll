class LDVELH {

    config = {
        liveId: '',
        delay: 0,
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
    polls = {};
    slobs = new Slobs();

    save() {
        this.saveDOM();
        setCookie('ldvelh-app', JSON.stringify(this.config));
    }
    saveDOM() {
        this.config.liveId = $('#live-id').val();
        this.config.delay = parseInt($('#countdown-delay').val());

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
        $('#live-id')
            .val(this.config.liveId)
            .parent().toggleClass("is-filled", this.config.liveId);
        $('#countdown-delay')
            .val(this.config.delay)
            .parent().toggleClass("is-filled", this.config.liveId);

        $('#book-no')
            .val(this.config.bookNo)
            .parent().toggleClass("is-filled", this.config.liveId);

        $('#last-no')
            .val(this.config.lastNo)
            .parent().toggleClass("is-filled", this.config.liveId);

        $('#tsv')
            .val(this.config.tsv)
            .parent().toggleClass("is-filled", this.config.liveId);
        $('#colId')
            .val(this.config.cols.colId)
            .parent().toggleClass("is-filled", this.config.liveId);
        $('#colQuestion')
            .val(this.config.cols.colQuestion)
            .parent().toggleClass("is-filled", this.config.liveId);
        $('#colOption')
            .val(this.config.cols.colOption)
            .parent().toggleClass("is-filled", this.config.liveId);
    }
}
