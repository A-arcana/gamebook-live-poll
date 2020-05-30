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

    save(nofocus) {
        this.saveDOM();
        Cookie.setCookie('ldvelh-app', JSON.stringify(this.config));
        if (!nofocus) {
            app.focusPoll(false);
        }
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
        this.config = JSON.parse(Cookie.getCookie('ldvelh-app')) || new LDVELH().config;
        this.loadDOM();
    }
    loadDOM() {
        $('#gamebook-title').text(this.config.title);

        $('#live-id')
            .val(this.config.liveId)
            .parent().toggleClass('is-filled', true);

        $('#slobs-url')
            .val(this.config.slobs?.url)
            .parent().toggleClass('is-filled', true);
        $('#slobs-token')
            .val(this.config.slobs?.token)
            .parent().toggleClass('is-filled', true);

        $('#countdown-delay')
            .val(this.config.delay)
            .parent().toggleClass('is-filled', true);

        $('#book-no')
            .val(this.config.bookNo)
            .parent().toggleClass('is-filled', true);

        $('#last-no')
            .val(this.config.lastNo)
            .parent().toggleClass('is-filled', true);

        $('#tsv')
            .val(this.config.tsv)
            .parent().toggleClass('is-filled', true);
        $('#colId')
            .val(this.config.cols.colId)
            .parent().toggleClass('is-filled', true);
        $('#colQuestion')
            .val(this.config.cols.colQuestion)
            .parent().toggleClass('is-filled', true);
        $('#colOption')
            .val(this.config.cols.colOption)
            .parent().toggleClass('is-filled', true);
    }
}
