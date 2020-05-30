const catcher = (res) => { console.log("empty catch", res); };

class LiveApp {

    ldvelh = new LDVELH();
    slobs = new Slobs();

    load() {
        this.ldvelh.load();

        $.ajaxSetup({ cache: true });
        $.getScript('https://connect.facebook.net/en_US/sdk.js', () => {
            FB.init({
                appId: '360035658287515',
                autoLogAppEvents: true,
                xfbml: true,
                version: 'v7.0'
            });

            this.fbConnect(true);
            setInterval(() => this.fbConnect, 20 * 60 * 1000);
        });
        setTimeout(() => { if (this.ldvelh.config.tsv) this.readFile(); }, 1000);
    }

    saveTitle() {
        this.ldvelh.save();
    }

    fbConnect(tryConnectPoll) {
        this.ldvelh.saveDOM();
        FB.getLoginStatus((response) => {
            this.fbError(response);
            if (response && response.status === "connected") {
                this.ldvelh.accessToken = response.authResponse.accessToken;
                if (tryConnectPoll && this.ldvelh.config.liveId) this.connect();
            }
            else {
                FB.login((response) => {
                    this.fbError(response);
                    if (response.status === 'connected') {
                        this.ldvelh.accessToken = response.authResponse.accessToken;
                        if (tryConnectPoll && this.ldvelh.config.liveId) this.connect();
                    }
                }, { scope: 'publish_video,manage_pages,publish_pages' });
            }
        }, true);
    }

    fbError(response) {
        if (!response) {
            $('#live-id').parent().setValid(false);

            $('#live-error').addError("Facebook: Response is null");
        }
        else if (response.error) {
            $('#live-id').parent().setValid(false);

            $('#live-error').addError("Facebook: " + response.error.message);
        }
        else {
            $('#live-id').parent().setValid(true);
            $('#live-error').clearError();
        }
    }

    roll() {
        this.slobs.resetItem('Dice', 10).then(catcher).catch(catcher);
        app.focusPoll();
    }

    slobsConnect() {
        this.ldvelh.saveDOM();

        this.slobs.init(true).then(catcher).catch(catcher);
    }

    connect() {
        this.ldvelh.saveDOM();

        $('#other').children().remove();
        $('#other').append("<option value='none'>Choose...</option>");
        $('#other').selectpicker('refresh');
        FB.api('/' + this.ldvelh.config.liveId + '/polls?fields=poll_options{id,order,text},id,question,status&access_token=' + this.ldvelh.accessToken, (response) => {
            this.fbError(response);

            if (!response || !response.data) return;

            this.ldvelh.polls = {};

            for (let i in response.data) {
                let poll = response.data[i];
                if (this.ldvelh.lines[poll.question]) continue;

                this.ldvelh.polls[poll.id] = {
                    id: poll.id,
                    question: poll.question,
                    status: poll.status,
                    options: poll.poll_options.data
                };
                let $opt = $("<option value='" + poll.id + "'>" + poll.question + "</option>");
                $('#other').append($opt);
            }
            let hide = $('#other').children().length <= 1;
            $('#other').parents('.col-6').toggleClass("d-none", hide);
            $('#live-polls').parents('.col-5').toggleClass("d-none", hide);
            $('#other').selectpicker('refresh');

            this.displayOther();
        });
    }

    readFile() {
        this.ldvelh.saveDOM();

        $('#question').children().remove();
        $('#question').append("<option value='none'>Choose...</option>");
        $('#question').selectpicker('refresh');
        $.get('get-file/' + this.ldvelh.config.tsv, (data) => {
            this.ldvelh.lines = {};
            try {
                for (let i = 1; i <= parseInt(this.ldvelh.config.lastNo); i++) {
                    this.ldvelh.lines[i + ""] = {
                        question: i + "",
                        options: [],
                        picture: { small: null, large: null }
                    };
                }
                let lines = data.split("\n");
                for (let i in lines) {
                    if (i === 0) continue;
                    let cols = lines[i].replace("\r", "").split("\t");
                    let section = cols[this.ldvelh.config.cols.colId] + "";
                    let question = cols[this.ldvelh.config.cols.colQuestion] + "";
                    let str = cols[this.ldvelh.config.cols.colOption];
                    if (str && this.ldvelh.lines[section]) {
                        this.ldvelh.lines[section].options.push(str.charAt(0).toUpperCase() + str.slice(1));
                        this.ldvelh.lines[section].question = question;
                    }

                    let fbPoll = Object
                        .keys(this.ldvelh.polls)
                        .map(k => this.ldvelh.polls[k])
                        .find(p => p.question === question);
                    if (fbPoll) {
                        $('#other option[value=' + fbPoll.id + ']').remove();
                        $('#other').selectpicker('refresh');
                    }
                }
                $('#requests-progress')
                    .toggleClass('d-none', false)
                    .find('.progress-bar')
                    .css('width', "0%")
                    .attr('aria-valuenow', 0);

                let perc = 0;
                let waiter = setInterval(() => {
                    perc = perc === 0 ? 100 : 0;
                    $('#requests-progress .progress-bar')
                        .css('width', perc + "%")
                        .attr('aria-valuenow', Math.round(perc));
                }, 700);

                $.get('get-html?url=https://www.projectaon.org/en/xhtml-less-simple/lw/' + this.ldvelh.config.bookNo + '/title.htm', aon => {
                    let htmlDoc = $((new DOMParser()).parseFromString(aon, "text/xml").documentElement);

                    htmlDoc.find('a[name*=sect]:not([href])').each((i, a) => {
                        let $a = $(a);
                        let section = $a.text();
                        let line = this.ldvelh.lines[section];
                        if (!line) {
                            return;
                        }
                        let icons = line.question + " ";
                        icons += line.options.length > 0 ? '<i class="material-icons">poll</i>' : '';
                        let $opt = $("<option value='" + section + "'>" + line.question + "</option>");
                        $('#question').append($opt);

                        let img = $a.parent().nextUntil('h3').find('img');
                        if (img.is('img[alt="[illustration]"]') || img.is('img[alt="illustration"]')) {
                            let elt = img[0].outerHTML
                                .replace("src=\"", "src=\"https://www.projectaon.org/en/xhtml/lw/" + this.ldvelh.config.bookNo + "/");
                            if (img.attr('width') > 400) {
                                line.picture.xlarge = elt;
                            } else if (img.attr('height') > 200) {
                                line.picture.large = elt;
                            } else {
                                line.picture.small = elt;
                            }
                            icons += '<i class="material-icons">wallpaper</i>';
                        }
                        $opt.attr('data-content', icons);
                    });

                    clearInterval(waiter);
                    $('#requests-progress').toggleClass('d-none', true);

                    $('#question').selectpicker('refresh');
                });
            } catch (e) {
                $('#tsv').parent().setValid(false);

                $('#file-error').addError("[FAILED] parse file: " + e);
                return;
            }

            $('#tsv').parent().setValid(true);
            $('#file-error').clearError();

            this.focusPoll(true);
        }).fail((jqXHR, textStatus) => {
            $('#tsv').parent().setValid(false);
            $('#file-error').addError("[FAILED] get file: " + textStatus);
        });
        this.display();
    }

    displayOther() {
        let pollId = $('#other').val();
        $('#live-display-options').html("");
        $('#live-display-button .text').text("");

        if (pollId && pollId !== "none") {
            let poll = this.ldvelh.polls[pollId];
            let question = poll.question;
            $('#live-poll-button .text').text(question);
            for (let i in poll.options) {
                let $opt = $("<div class='row'><div class='col-10'><span class='small'>" + (parseInt(i) + 1) + "&nbsp;&nbsp;&nbsp;</span> " + poll.options[i].text + "</div></div>");
                $('#live-display-options').append($opt);
            }
            $('#live-polls').toggleClass("d-none", poll.options.length === 0);
        } else {
            $('#live-polls').toggleClass("d-none", true);
        }
    }

    display() {
        let section = $('#question').val();
        $('#display-options').html("");
        $('#display-pic').html("");
        $('#display-smallpic').html("");
        $('#display-xlpic').html("");
        $('#display-question').text("");
        $('#option-add').val("");

        if (section && section !== "none") {
            let question = this.ldvelh.lines[section].question;
            $('#display-question').text(question);
            for (let i in this.ldvelh.lines[section].options) {
                let $opt = $("<div class='row'><a onclick='app.deleteOpt(\"" + section + "\", " + i + ")' class='action delete col-1'><i class='material-icons text-danger'>clear</i></a><div class='small col-1'>" + (parseInt(i) + 1) + "</div> <div class='col-9'> " + this.ldvelh.lines[section].options[i] + "</div></div>");
                $('#display-options').append($opt);
            }
            let hasOpt = this.ldvelh.lines[section].options.length === 0;
            $('#poll-button').toggleClass("d-none", hasOpt);
            $('#option-add').parent().toggleClass("d-none", hasOpt);

            $('#display-smallpic')
                .html(this.ldvelh.lines[section].picture.small)
                .toggleClass("d-none", !this.ldvelh.lines[section].picture.small);
            $('#display-pic')
                .html(this.ldvelh.lines[section].picture.large)
                .toggleClass("d-none", !this.ldvelh.lines[section].picture.large);
            $('#display-xlpic')
                .html(this.ldvelh.lines[section].picture.xlarge)
                .toggleClass("d-none", !this.ldvelh.lines[section].picture.xlarge);

            $('#display-pic-helper')
                .toggleClass(
                    "d-none",
                    !this.ldvelh.lines[section].picture.xlarge && !this.ldvelh.lines[section].picture.large && !this.ldvelh.lines[section].picture.small
                );
        }
    }

    deleteOpt(section, option) {
        this.ldvelh.lines[section].options.splice(option, 1);
        if (this.ldvelh.lines[section].options.length === 0) {
            $('#question option[value=' + section + ']').text($('#question option[value=' + section + ']').text().replace(" [poll]", ""));
        }
        this.display();
    }
    addOpt() {
        let section = $('#question').val();
        let option = $('#option-add').val().trim();
        option = option.charAt(0).toUpperCase() + option.slice(1);
        if (this.ldvelh.lines[section].options.length === 0) {
            $('#question option[value=' + section + ']').text($('#question option[value=' + section + ']').text() + " [poll]");
        }
        this.ldvelh.lines[section].options.push(option);
        this.display();

        $('#option-add').val("").focus();
    }
    optPressed(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.addOpt();
        }
    }

    pollOther() {
        let pollId = $('#other').val();
        $('#other')
            .val('none')
            .selectpicker('refresh');
        this.focusPoll();

        this.slobs.displayItem('countdown', 60)
            .then(() =>
                this.slobs.displayItem(this.ldvelh.polls[pollId].question, 30).then(catcher).catch(catcher)
            )
            .catch(catcher);

        setTimeout(() =>
            FB.api('/' + pollId, 'post', { action: 'SHOW_VOTING', access_token: this.ldvelh.accessToken }, this.fbError),
            this.ldvelh.config.delay * 1000);

        setTimeout(() => {
            FB.api('/' + pollId, 'post', { action: 'SHOW_RESULTS', access_token: this.ldvelh.accessToken }, this.fbError);

            setTimeout(() => FB.api('/' + pollId, 'post', { action: 'CLOSE', access_token: this.ldvelh.accessToken }, this.fbError)
                , 30 * 1000);
        }, 60 * 1000);
    }

    focusPoll(refresh) {
        var $q = $('#question');
        if (refresh) $q.val('none').selectpicker('refresh');
        $q.focus();
    }

    poll() {
        let question = this.ldvelh.lines[$('#question').val()];

        this.slobs.displayItem('countdown', 60).then(catcher).catch(catcher);

        setTimeout(
            () => {
                FB.api('/' + this.ldvelh.config.liveId + '/polls', 'post', question, (response) => {
                    this.fbError(response);
                    if (!response || !response.id) return;

                    let pollId = response.id;
                    setTimeout(() => {
                        FB.api('/' + pollId, 'post', { action: 'SHOW_RESULTS', access_token: this.ldvelh.accessToken }, this.fbError);

                        setTimeout(() => FB.api('/' + pollId, 'post', { action: 'CLOSE', access_token: this.ldvelh.accessToken }, this.fbError)
                            , 30 * 1000);
                    }, 60 * 1000);
                });
            },
            this.ldvelh.config.delay * 1000);

        $('#display-options').html("");
        $('#display-xlpic').html("");
        $('#display-pic').html("");
        $('#display-smallpic').html("");
        $('#display-question').text("");
        this.focusPoll(true);
    }

    picture(format) {
        this.focusPoll();
        let src = $('#display-pic img').attr('src');
        let placeholder = "placeholder";
        let folder = false;
        let timing = 50;
        if (format === 'xl') {
            src = $('#display-xlpic img').attr('src');
            placeholder = "xl-placeholder";
            folder = "xl-folder";
        }
        else if (format === "s") {
            src = $('#display-smallpic img').attr('src');
            placeholder = "small-placeholder";
            timing = 20;
        }
        if (src) {
            src = encodeURIComponent(src);
            this.slobs.setItemSource(placeholder, src)
                .then(() => {
                    if (folder) this.slobs.displayItem(folder, timing).then(catcher).catch(catcher);
                    else this.slobs.displayItem(placeholder, timing).then(catcher).catch(catcher);
                })
                .catch(catcher);
        }
    }
}

const app = new LiveApp();

$(document).ready(() => {
    app.load();
});

