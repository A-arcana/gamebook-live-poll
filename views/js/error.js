class Error {
    static addError(selector, message) {
        let $x = $(selector);
        let html = $x.html().trim();
        html = html==="" ? html : html + "<hr/>";
        $x
            .html(html + message)
            .parents(".card").toggleClass("d-none", false);
        return $x;
    }
    static clearError(selector) {
        let $x = $(selector);
        $x
            .html("")
            .parents(".card").toggleClass("d-none", true);
        return $x;
    }
}
