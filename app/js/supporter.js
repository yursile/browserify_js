(function(window) {
    var navigator = window.navigator,
        userAgent = navigator.userAgent,
        android = userAgent.match(/(Android)[\s\/]*([\d\.]+)/i),
        ios = userAgent.match(/(iPad|iPhone|iPod)[\w\s]*;(?:[\w\s]+;)*[\w\s]+(?:iPad|iPhone|iPod)?\sOS\s([\d_\.]+)/i),
        wp = userAgent.match(/(Windows\s+Phone)(?:\sOS)?\s([\d\.]+)/i),
        isSohu = userAgent.toLocaleLowerCase().indexOf("sohunews"),
        isWebkit = /WebKit\/[\d.]+/i.test(userAgent),
        isSafari = ios ? (navigator.standalone ? isWebkit : (/Safari/i.test(userAgent) && !/CriOS/i.test(userAgent) && !/MQQBrowser/i.test(userAgent))) : false,
        os = {};

    if (android) {
        os.android = true;
        os.version = android[2];
        os.android4 = /^4/.test(os.version);
        os.android3 = /^3/.test(os.version);
        os.android2 = /^2/.test(os.version);
    }
    if (ios) {
        os.ios = true;
        os.version = ios[2].replace(/_/g, '.');
        os['ios' + os.version.match(/^(\w+)/i)[1]] = true;
        if (ios[1] === 'iPad') {
            os.ipad = true;
        } else if (ios[1] === 'iPhone') {
            os.iphone = true;
        } else if (ios[1] === 'iPod') {
            os.ipod = true;
        }
    }
    if (wp) {
        os.wp = true;
        os.version = wp[2];
        os.wp8 = /^8/.test(os.version);
        os.wp7 = /^7/.test(os.version);
    }

    var isTestEnvironment = function() {
        // 判断是正式环境还是测试环境
        var hostName = window.location.hostname;
        // var result =  window.location.href.indexOf('public') > 0;
        result = false;
        return result;
    };

    var Supporter = {
        /**
         * 移动设备操作系统信息，可能会包含一下属性:
         *
         *  Boolean : android
         *  Boolean : android4
         *  Boolean : android3
         *  Boolean : android2
         *  Boolean : ios
         *  Boolean : ios7
         *  Boolean : ios6
         *  Boolean : ios5
         *  Boolean : ipad
         *  Boolean : iphone
         *  Boolean : ipod
         *  Boolean : wp
         *  Boolean : wp8
         *  Boolean : wp7
         *  String : version 系统版本号
         *
         */
        os: os,

        /**
         * 是否智能设备
         */
        isSmartDevice: (function() {
            return !!(os.ios || os.android || os.wp);
        }()),


        /**
         * 是否webkit内核浏览器
         */
        isWebkit: isWebkit,

        /**
         * 是否safari浏览器
         */
        isSafari: isSafari,

        isIos:!!ios,
        isAndroid:!!android,

        /**
         * 低于iOS7
         */
        isBelowIos7: !!(os.ios && os.version.match(/^(\w+)/i)[1] < 7),

        /**
         * 是否UC浏览器
         */
        isUC: /UC/i.test(userAgent),

        /**
         * 是否QQ浏览器
         */
        isQQ: /QBrowser/i.test(userAgent),
        isTestEnvironment:isTestEnvironment
    };

    

    if( typeof define === 'function' && (define.amd || seajs) ){
        define('Supporter', [], function(){
            return Supporter;
        });
    }else if ( typeof module !== 'undefined' && module.exports ) {
        module.exports = Supporter;
    }
    
    window.Supporter = Supporter;
})(window);