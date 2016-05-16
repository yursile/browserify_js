(function(window) {
    var CookieUtil = require("./CookieUtil");
    var hostName = window.location.hostname,
        formalBaseAdQuestUrl = 'http://s.go.sohu.com/adgtr/?',
        testBaseAdQuestUrl = 'http://10.16.10.63/adgtr/?',
        isTestEnvironment = (function() {
            // 判断是正式环境还是测试环境
            var result = /^m\.sohu\.com$/.test(hostName) || window.location.href.indexOf('public') > 0;
            return result;
        })();

    var isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        },
        // 把对象转换为序列化的字符串
        params = function(obj) {
            var i,
                arr = [],
                isObject = function(arg) {
                    return Object.prototype.toString.call(arg) === '[object Object]';
                };

            if (!!obj && isObject(obj)) {
                for (i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        arr.push(i + '=' + obj[i]);
                    }
                }
                return arr.join('&');
            }
        };


    /**
     * @desc:判断是否需要展示广告
     */
    var isNoADMSohu = (function() {
        var url = window.location.href,
            result = false;

        if (CookieUtil.get('hide_ad') === '1') {
            result = true;
        }

        if (/_trans_=000018_sogou_sohuicon/.test(url)) {
            result = true;
        }

        return result;
    })();

    /**
     * @desp: 根据不同的测试环境生成一个基本的广告请求链接(不包括max_turn的值)
     * @param {Array} baseAdParam: 基本的广告参数。
     * 第一列为自定义广告类型(可以为空)，第二列为正式广告为id，第三列为测试广告位id(可以为空)，第四列为广告adps参数。
     */
    function getAdRequestBaseUrl(baseAdParam) {

        if (!isArray(baseAdParam)) {
            return 'http://s.go.sohu.com/adgtr/?';
        }

        var baseUrl = '',
            baseData = {
                itemspaceid: baseAdParam[1] || 111111,
                adps: baseAdParam[3] || '160001',
                adsrc: 13,
                apt: 4
            },
            // 重新生成callback参数的值，防止所有的jsonp请求callback名称相同，出现冲突问题
            getRandomCallback = function() {
                return 'callback=sohu_moblie_callback1383228627964854' + Math.random().toString().substring(2, 15);
            };

        // 测试环境(且测试的广告位id存在)添加bucketid参数
        if (isTestEnvironment && !!baseAdParam[2]) {
            baseUrl = testBaseAdQuestUrl;
            baseData.itemspaceid = baseAdParam[2];
            baseData.bucketid = 2;
        } else {
            baseUrl = formalBaseAdQuestUrl;
        }

        baseUrl += params(baseData);

        return baseUrl;
    }


    var MSOHUBASEAD = {};

    MSOHUBASEAD.getAdRequestBaseUrl = getAdRequestBaseUrl;
    MSOHUBASEAD.isNoADMSohu = isNoADMSohu;

    module.exports = MSOHUBASEAD;

})(window);