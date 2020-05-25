class Cookie {
    static setCookie(key, value, expiry) {
        let expires = new Date();
        if (!expiry) expiry = 365;
        expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
        document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
    }

    static getCookie(key) {
        let keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        return keyValue ? keyValue[2] : null;
    }

    static eraseCookie(key) {
        let keyValue = Cookie.getCookie(key);
        Cookie.setCookie(key, keyValue, '-1');
    }
}