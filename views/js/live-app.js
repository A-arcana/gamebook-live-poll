const ldvelhApp = new LDVELH();

$(document).ready(() => {
    ldvelhApp.load();

    $.ajaxSetup({ cache: true });
    $.getScript('https://connect.facebook.net/en_US/sdk.js', () => {
        FB.init({
            appId: '360035658287515',
            autoLogAppEvents: true,
            xfbml: true,
            version: 'v7.0'
        });

        fbConnect(true);
        setInterval(fbConnect, 20 * 60 * 1000);

        setTimeout(() => { if (ldvelhApp.config.tsv) readFile(); }, 1000);
    });
});

function fbConnect(tryConnectPoll) {
    ldvelhApp.saveDOM();
    FB.getLoginStatus(function (response) {
        fbError(response);
        if (response && response.status === "connected") {
            ldvelhApp.accessToken = response.authResponse.accessToken;
            if (tryConnectPoll && ldvelhApp.config.liveId) connect();
        }
        else {
            FB.login(function (response) {
                fbError(response);
                if (response.status === 'connected') {
                    ldvelhApp.accessToken = response.authResponse.accessToken;
                    if (tryConnectPoll && ldvelhApp.config.liveId) connect();
                }
            }, { scope: 'publish_video,manage_pages,publish_pages' });
        }
    }, true);
}

function fbError(response) {
    if (!response) {
        $('#live-id').parent()
            .addClass("has-danger")
            .removeClass("has-success");
        $('#live-error')
            .html($('#live-error').html() + "<hr/> Response is null")
            .parents(".card").toggleClass("d-none", false);
    }
    else if (response.error) {
        $('#live-id').parent()
            .addClass("has-danger")
            .removeClass("has-success");
        $('#live-error')
            .html($('#live-error').html() + "<hr/>" + response.error.message)
            .parents(".card").toggleClass("d-none", false);
    }
    else {
        $('#live-id').parent()
            .removeClass("has-danger")
            .addClass("has-success");
        $('#live-error').parents(".card").toggleClass("d-none", true);
    }
}

function connect() {
    ldvelhApp.saveDOM();

    $('#other').children().remove();
    $('#other').append("<option value='none'>Choose...</option>");
    $('#other').selectpicker('refresh');
    FB.api('/' + ldvelhApp.config.liveId + '/polls?fields=poll_options{id,order,text},id,question,status&access_token=' + ldvelhApp.accessToken, (response) => {
        fbError(response);

        if (!response || !response.data) return;

        ldvelhApp.polls = {};

        for (let i in response.data) {
            let poll = response.data[i];
            ldvelhApp.polls[poll.id] = {
                id: poll.id,
                question: poll.question,
                status: poll.status,
                options: poll.poll_options.data
            };
            let $opt = $("<option value='" + poll.id + "'>" + poll.question + "</option>");
            $('#other').append($opt);
        }
        $('#other').selectpicker('refresh');
    });
}

function readFile() {
    ldvelhApp.saveDOM();

    $('#question').children().remove();
    $('#question').append("<option value='none'>Choose...</option>");
    $('#question').selectpicker('refresh');
    $.get('get-file/' + ldvelhApp.config.tsv, function (data) {
        ldvelhApp.lines = {};
        try {
            for (i = 1; i <= parseInt(ldvelhApp.config.lastNo); i++) {
                ldvelhApp.lines[i + ""] = {
                    question: i + "",
                    options: [],
                    picture: { small: null, large: null }
                };
            }
            let lines = data.split("\n");
            for (let i in lines) {
                if (i === 0) continue;
                var cols = lines[i].replace("\r", "").split("\t");
                var section = cols[ldvelhApp.config.cols.colId] + "";
                var question = cols[ldvelhApp.config.cols.colQuestion] + "";
                var str = cols[ldvelhApp.config.cols.colOption];
                if (str && ldvelhApp.lines[section]) {
                    ldvelhApp.lines[section].options.push(str.charAt(0).toUpperCase() + str.slice(1));
                }
            }

            ldvelhApp.requests = 0;
            $('#requests-progress')
                .toggleClass('d-none', false)
                .find('.progress-bar')
                .css('width', "0%")
                .attr('aria-valuenow', 0);
            for (let i in ldvelhApp.lines) {
                let line = ldvelhApp.lines[i];
                let icons = line.question + " ";
                icons += (line.options.length > 0 ? '<i class="material-icons">poll</i>' : '');
                let $opt = $("<option value='" + i + "' data-content='" + icons + "'>" + line.question + "</option>");
                $('#question').append($opt);
                line.req = $.get('get-html?url=https://www.projectaon.org/en/xhtml/lw/' + ldvelhApp.config.bookNo + '/sect' + i + '.htm',
                    (data) => {
                        var htmlDoc = $((new DOMParser()).parseFromString(data, "text/xml").documentElement);
                        if (htmlDoc.find('img[alt="[illustration]"]').length > 0) {
                            line.picture.small =
                                htmlDoc
                                    .find('img[alt="[illustration]"]')[0]
                                    .outerHTML
                                    .replace("src=\"", "src=\"https://www.projectaon.org/en/xhtml/lw/" + ldvelhApp.config.bookNo + "/");
                        }
                        if (htmlDoc.find('img[alt=illustration]').length > 0) {
                            line.picture.large =
                                htmlDoc
                                    .find('img[alt=illustration]')[0]
                                    .outerHTML
                                    .replace("src=\"", "src=\"https://www.projectaon.org/en/xhtml/lw/" + ldvelhApp.config.bookNo + "/");
                        }

                        if (line.picture.large || line.picture.small) {
                            icons += '<i class="material-icons">wallpaper</i>';
                        }
                        $opt.attr('data-content', icons);
                        ldvelhApp.requests++;
                        perc = ldvelhApp.requests / ldvelhApp.config.lastNo * 100.0;
                        if (perc >= 100) {
                            $('#requests-progress').toggleClass('d-none', true);
                            $('#question').selectpicker('refresh');
                        }
                        else {
                            $('#requests-progress .progress-bar')
                                .css('width', perc + "%")
                                .attr('aria-valuenow', Math.round(perc));
                            if (ldvelhApp.requests % 50 === 0) {
                                $('#question').selectpicker('refresh');
                            }
                        }
                    }
                );
            }
        } catch (e) {
            $('#tsv').parent()
                .addClass("has-danger")
                .removeClass("has-success");
            $('#file-error')
                .html($('#file-error').html() + "<hr/>[FAILED] parse file: " + e)
                .parents(".card").toggleClass("d-none", false);
            return;
        }

        $('#tsv').parent()
            .removeClass("has-danger")
            .addClass("has-success");
        $('#file-error')
            .html("<h6>Errors</h6>")
            .parents(".card").toggleClass("d-none", true);

        $('#question')
            .val('none')
            .focus()
            .selectpicker('refresh');
    }).fail((jqXHR, textStatus) => {
        $('#tsv').parent()
            .addClass("has-danger")
            .removeClass("has-success");
        $('#file-error')
            .html($('#file-error').html() + "<hr/>[FAILED] get file: " + textStatus)
            .parents(".card").toggleClass("d-none", false);
    });
    display();
}

function displayOther() {
    var pollId = $('#other').val();
    $('#live-display-options').html("");
    $('#live-display-question').text("");

    if (pollId && pollId !== "none") {
        var poll = ldvelhApp.polls[pollId];
        var question = poll.question;
        $('#live-poll-button .text').text(question);
        for (let i in poll.options) {
            var $opt = $("<div class='row'><div class='col-md-10'><span class='small'>" + (parseInt(i) + 1) + "&nbsp;&nbsp;&nbsp;</span> " + poll.options[i].text + "</div></div>");
            $('#live-display-options').append($opt);
        }
        $('#live-poll-button').toggleClass("d-none", poll.options.length === 0);
    }
}

function display() {
    var section = $('#question').val();
    $('#display-options').html("");
    $('#display-pic').html("");
    $('#display-smallpic').html("");
    $('#display-question').text("");
    $('#option-add').val("");

    if (section && section !== "none") {
        var question = ldvelhApp.lines[section].question;
        $('#display-question').text(question);
        for (let i in ldvelhApp.lines[section].options) {
            var $opt = $("<div class='row'><a onclick='deleteOpt(\"" + section + "\", " + i + ")' class='action delete'><i class='material-icons text-danger col-md-1'>clear</i></a> <div class='col-md-10'><span class='small'>" + (parseInt(i) + 1) + "&nbsp;&nbsp;&nbsp;</span> " + ldvelhApp.lines[section].options[i] + "</div></div>");
            $('#display-options').append($opt);
        }
        $('#poll-button').toggleClass("d-none", ldvelhApp.lines[section].options.length === 0);

        $('#display-smallpic')
            .html(ldvelhApp.lines[section].picture.small)
            .toggleClass("d-none", !ldvelhApp.lines[section].picture.small);
        $('#display-pic')
            .html(ldvelhApp.lines[section].picture.large)
            .toggleClass("d-none", !ldvelhApp.lines[section].picture.large);
    }
}

function deleteOpt(section, option) {
    ldvelhApp.lines[section].options.splice(option, 1);
    if (ldvelhApp.lines[section].options.length === 0) {
        $('#question option[value=' + section + ']').text($('#question option[value=' + section + ']').text().replace(" [poll]", ""));
    }
    display();
}
function addOpt() {
    var section = $('#question').val();
    var option = $('#option-add').val().trim();
    $('#option-add').val("");
    option = option.charAt(0).toUpperCase() + option.slice(1)
    if (ldvelhApp.lines[section].options.length === 0) {
        $('#question option[value=' + section + ']').text($('#question option[value=' + section + ']').text() + " [poll]");
    }
    ldvelhApp.lines[section].options.push(option);
    display();
}

function pollOther() {
    let pollId = $('#other').val();
    $('#other')
        .val('none')
        .focus()
        .selectpicker('refresh');        ;
    $('#question')
        .focus();
    FB.api('/' + pollId, 'post', { action: 'SHOW_VOTING', access_token: ldvelhApp.accessToken }, function (response) {
        fbError(response);

        if (!response) return;

        let item = null;
        $.get('/slobs/scenes/Live Scene',
            scene => {
                if (scene) {
                    item = scene.nodes.find(n => n.name === 'countdown');
                    $.get('/slobs/set-visibility/"' + item.sceneId + '","' + item.id + '","' + item.sourceId + '"/true');
                    folderItem = scene.nodes.find(n => n.name === ldvelhApp.polls[pollId].question);
                    if (folderItem.sceneNodeType === 'folder') {
                        let items = scene.nodes.filter(n => n.parentId === folderItem.id);
                        for (let i in items) {
                            $.get('/slobs/set-visibility/"' + items[i].sceneId + '","' + items[i].id + '","' + items[i].sourceId + '"/true');
                            setTimeout(() => $.get('/slobs/set-visibility/"' + items[i].sceneId + '","' + items[i].id + '","' + items[i].sourceId + '"/false'), 30 * 1000);
                        }
                    }
                }
            });
        setTimeout(function () {
            FB.api('/' + pollId, 'post', { action: 'SHOW_RESULTS', access_token: ldvelhApp.accessToken }, fbError);
            $.get('/slobs/set-visibility/"' + item.sceneId + '","' + item.id + '","' + item.sourceId + '"/false');

            setTimeout(function () {
                FB.api('/' + pollId, 'post', { action: 'CLOSE', access_token: ldvelhApp.accessToken }, fbError);
            }, 30 * 1000);
        }, 60 * 1000);

    });
}
function poll() {
    var question = ldvelhApp.lines[$('#question').val()];
    $('#question')
        .val('none')
        .focus()
        .selectpicker('refresh');;
    FB.api('/' + ldvelhApp.config.liveId + '/polls', 'post', question, function (response) {
        fbError(response);

        if (!response || !response.id) return;

        let item = null;
        $.get('/slobs/scenes/Live Scene',
            scene => {
                if (scene) {
                    item = scene.nodes.find(n => n.name === 'countdown');
                    $.get('/slobs/set-visibility/"' + item.sceneId + '","' + item.id + '","' + item.sourceId + '"/true');
                }
            });
        var pollId = response.id;
        setTimeout(function () {
            FB.api('/' + pollId, 'post', { action: 'SHOW_RESULTS', access_token: ldvelhApp.accessToken }, fbError);
            $.get('/slobs/set-visibility/"' + item.sceneId + '","' + item.id + '","' + item.sourceId + '"/false');

            setTimeout(function () {
                FB.api('/' + pollId, 'post', { action: 'CLOSE', access_token: ldvelhApp.accessToken }, fbError);
            }, 30 * 1000);
        }, 60 * 1000);
    });
    $('#display-options').html("");
    $('#display-pic').html("");
    $('#display-smallpic').html("");
    $('#display-question').text("");
}

function picture(isSmall) {
    $('#question').focus();
    var src = $('#display-pic img').attr('src');
    var placeholder = "placeholder";
    if (isSmall) {
        src = $('#display-smallpic img').attr('src');
        placeholder = "small-placeholder";
    }
    if (src) {
        src = encodeURIComponent(src);
        $.get('/slobs/scenes/Live Scene',
            scene => {
                if (scene) {
                    var item = scene.nodes.find(n => n.name === placeholder);
                    $.get('/slobs/set-source/' + item.sourceId + '/' + src);
                    $.get('/slobs/set-visibility/"' + item.sceneId + '","' + item.id + '","' + item.sourceId + '"/true');
                    if (ldvelhApp.pictureTimeout[isSmall]) {
                        clearTimeout(ldvelhApp.pictureTimeout[isSmall]);
                    }
                    ldvelhApp.pictureTimeout[isSmall] = setTimeout(() => $.get('/slobs/set-visibility/"' + item.sceneId + '","' + item.id + '","' + item.sourceId + '"/false'), !isSmall ? 50000 : 20000);
                }
            });
    }
}