$.fn.addError = function (message) {
    let html = this.html().trim();
    html = html === "" ? html : html + "<hr/>";
    this
        .html(html + message)
        .parents(".card").toggleClass("d-none", false);
    return this;
};
$.fn.clearError = function () {
    this
        .html("")
        .parents(".card").toggleClass("d-none", true);
    return this;
};
$.fn.setValid = function (isValid) {
    this
        .toggleClass("has-danger", !isValid)
        .toggleClass("has-success", isValid);
    return this;
};
$.fn.setPristine = function () {
    this
        .toggleClass("has-danger", false)
        .toggleClass("has-success", false);
    return this;
};
