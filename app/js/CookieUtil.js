var CookieUtil = {
    get: function(cookieName) {
        var re = new RegExp("\\b" + cookieName + "=([^;]*)\\b");
        var arr = re.exec(document.cookie);
        return arr ? decodeURIComponent(arr[1]) : null;
    },
    
    set: function(name, value){
        var argv = arguments,
            argc = arguments.length,
            expires = (argc > 2) ? argv[2] : null,
            path = (argc > 3) ? argv[3] : '/',
            domain = (argc > 4) ? argv[4] : null,
            secure = (argc > 5) ? argv[5] : false;
            
        document.cookie = name + "=" + encodeURIComponent(value) + ((expires === null) ? "" : ("; expires=" + expires.toGMTString())) + ((path === null) ? "" : ("; path=" + path)) + ((domain === null) ? "" : ("; domain=" + domain)) + ((secure === true) ? "; secure" : "");
    },
    
    remove: function(name, path, domain) {
        if(this.get(name)){
            path = path || '/';
            document.cookie = name + '=' + '; expires=Thu, 01-Jan-70 00:00:01 GMT; path=' + path + (domain ? ('; domain=' + domain) : '');
        }
    }
};

module.exports = CookieUtil;
