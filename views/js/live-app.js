const ldvelhApp = new LDVELH();

$(document).ready(() => {
    ldvelhApp.load();

    $.ajaxSetup({ cache: true });
    $.getScript('https://connect.facebook.net/en_US/sdk.js', () => {
        FB.init({
            appId: '360035658287515',
            autoLogAppEvents: true,
            xfbml: true,
            version: 'v6.0'
        });

        fbConnect(true);
        setInterval(fbConnect, 20 * 60 * 1000);

        setTimeout(() => { if (ldvelhApp.config.tsv) readFile(); }, 1000);
    });
});

function fbConnect(tryConnectPoll) {
    ldvelhApp.config.bookNo = $('#book-no').val();
    ldvelhApp.config.liveId = $('#live-id').val();
    FB.getLoginStatus(function (response) {
        fbError(response);
        if (response && response.status == "connected") {
            ldvelhApp.accessToken = response.authResponse.accessToken;
            setCookie('ldvelh-app', JSON.stringify(ldvelhApp.config));
            if (tryConnectPoll && ldvelhApp.config.liveId) connect();
        }
        else {
            FB.login(function (response) {
                fbError(response);
                if (response.status === 'connected') {
                    ldvelhApp.accessToken = response.authResponse.accessToken;
                    setCookie('ldvelh-app', JSON.stringify(ldvelhApp.config));
                    if (tryConnectPoll && ldvelhApp.config.liveId) connect();
                }
            }, { scope: 'publish_video,manage_pages,publish_pages' });
        }
    }, true);
}

function fbError(response) {
    if (!response) {
        $('#error').show();
        $('#error').html($('#error').html() + "<hr/> Response is null");
    }
    else if (response.error) {
        $('#error').show();
        $('#error').html($('#error').html() + "<hr/>" + response.error.message);
    }
    else {
        $('#error').hide();
        $('#error').html("<h6>Errors</h6>");
    }
}

function connect() {
    ldvelhApp.config.liveId = $('#live-id').val();
    setCookie('ldvelh-app', JSON.stringify(ldvelhApp.config));

    $('#live-id').css("color", "#090");

    FB.api('/' + ldvelhApp.config.liveId + '/polls?access_token=' + ldvelhApp.accessToken, fbError);
}

function readFile() {
    ldvelhApp.config.tsv = $('#tsv').val();
    ldvelhApp.config.cols.colId = $('#colId').val();
    ldvelhApp.config.cols.colQuestion = $('#colQuestion').val();
    ldvelhApp.config.cols.colOption = $('#colOption').val();
    ldvelhApp.config.lastNo = $('#last-no').val();
    setCookie('ldvelh-app', JSON.stringify(ldvelhApp.config));

    $('#question').children().remove();
    $('#question').append("<option value='none'>Choose...</option>");
    $.get('get-file/' + ldvelhApp.config.tsv, function (data) {
        ldvelhApp.lines = {};
        for (i = 1; i <= parseInt(ldvelhApp.config.lastNo); i++) {
            ldvelhApp.lines[i + ""] = {
                question: i + "",
                options: [],
                picture: { small: null, large: null }
            }
        }
        var lines = data.split("\n");
        for (var i in lines) {
            if (i == 0) continue;
            var cols = lines[i].replace("\r", "").split("\t");
            var section = cols[ldvelhApp.config.cols.colId] + "";
            var question = cols[ldvelhApp.config.cols.colQuestion] + "";
            var str = cols[ldvelhApp.config.cols.colOption];
            if (str && ldvelhApp.lines[section]) {
                ldvelhApp.lines[section].options.push(str.charAt(0).toUpperCase() + str.slice(1));
            }
        }

        for (let i in ldvelhApp.lines) {
            let line = ldvelhApp.lines[i];
            $('#question').append("<option value='" + i + "'>" + line.question + (line.options.length > 0 ? " [poll]" : "") + "</option>");
            $.get('get-html?url=https://www.projectaon.org/en/xhtml/lw/' + ldvelhApp.config.bookNo + '/sect' + i + '.htm',
                function (data) {
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
                        $('#question option[value=' + i + ']').css("background-color", "lightblue");
                    }
                }
            );
        }

        $('#tsv').css("color", "#090");
        $('#question').val('none');
        $('#question').focus();
    });
    display();
}

function display() {
    var section = $('#question').val();
    $('#display-options').html("");
    $('#display-pic').html("");
    $('#display-smallpic').html("");
    $('#display-question').text("");
    $('#option-add').val("");

    if (section && section != "none") {
        var question = ldvelhApp.lines[section].question;
        $('#display-question').text(question);
        for (var i in ldvelhApp.lines[section].options) {
            var $opt = $("<li>" + ldvelhApp.lines[section].options[i] + " <a onclick='deleteOpt(\"" + section + "\", " + i + ")' class='action delete'>X</a></li>");
            $('#display-options').append($opt);
        }
        $('#display-smallpic').html(ldvelhApp.lines[section].picture.small);
        $('#display-pic').html(ldvelhApp.lines[section].picture.large);
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

function poll() {
    var question = ldvelhApp.lines[$('#question').val()];
    $('#question').val('none');
    $('#question').focus();
    FB.api('/' + ldvelhApp.config.liveId + '/polls', 'post', question, function (response) {
        fbError(response);

        if (!response || !response.id) return;

        let item = null;
        $.get('/slobs/scenes/Live Scene',
            scene => {
                if (scene) {
                    item = scene.nodes.find(n => n.name == 'countdown');
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
                    var item = scene.nodes.find(n => n.name == placeholder);
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