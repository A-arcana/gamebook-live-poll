class LDVELH {

    config = {
        title: 'Editable Title',
        liveId: '',
        slobs: {
            url: '',
            token: ''
        },
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
        this.config.title = $('#gamebook-title').text();

        this.config.liveId = $('#live-id').val();

        this.config.slobs = {
            url: $('#slobs-url').val(),
            token: $('#slobs-token').val()
        };

        this.config.delay = parseInt($('#countdown-delay').val());

        this.config.bookNo = $('#book-no').val();
        this.config.lastNo = $('#last-no').val();

        this.config.tsv = $('#tsv').val();
        this.config.cols.colId = $('#colId').val();
        this.config.cols.colQuestion = $('#colQuestion').val();
        this.config.cols.colOption = $('#colOption').val();
    }
    load() {
        this.config = JSON.parse(getCookie('ldvelh-app')) || new LDVELH().config;
        this.loadDOM();
    }
    loadDOM() {
        $('#gamebook-title').text(this.config.title);

        $('#live-id')
            .val(this.config.liveId)
            .parent().toggleClass("is-filled", this.config.liveId);

        $('#slobs-url')
            .val(this.config.slobs?.url)
            .parent().toggleClass("is-filled", this.config.slobs?.url);
        $('#slobs-token')
            .val(this.config.slobs?.token)
            .parent().toggleClass("is-filled", this.config.slobs?.token);

        $('#countdown-delay')
            .val(this.config.delay)
            .parent().toggleClass("is-filled", this.config.delay);

        $('#book-no')
            .val(this.config.bookNo)
            .parent().toggleClass("is-filled", this.config.bookNo);

        $('#last-no')
            .val(this.config.lastNo)
            .parent().toggleClass("is-filled", this.config.lastNo);

        $('#tsv')
            .val(this.config.tsv)
            .parent().toggleClass("is-filled", this.config.tsv);
        $('#colId')
            .val(this.config.cols.colId)
            .parent().toggleClass("is-filled", this.config.cols.colId);
        $('#colQuestion')
            .val(this.config.cols.colQuestion)
            .parent().toggleClass("is-filled", this.config.cols.colQuestion);
        $('#colOption')
            .val(this.config.cols.colOption)
            .parent().toggleClass("is-filled", this.config.cols.colOption);
    }
}
