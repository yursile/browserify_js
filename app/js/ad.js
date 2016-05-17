/**
 * Money
 *
 *  1. 首页浮层广告
    2. 下拉广告
    3. H5广告
    4. 视频广告
    5. gif广告
 */

    var FastClick = window.FastClick;
        Jsonp = require("./jsonp"),
        Statistics = require("./statics"),
        CookieUtil = require("./CookieUtil");
    var supporter = require("./supporter");
    var timeout = 4000;
    var carExhAdData = [
        ["", "14283", "12924", "30000001"],  //浮层广告
        ["", "14284", "12925", "6400320"],  //下拉广告
        // ["", "14284", "12921", "6400320"],  //焦点
        // ["", "14284", "12922", "6400320"],  //通栏
        // ["", "14284", "12923", "6400320"],  //信息流
        ["", "14288", "12901", "6400320"], //多图广告，H5广告
        // ["", "14287", "12900", "30000001"], //视频广告
        ["", "12926", "12926", "30000001"],
        ["", "14286", "12899", "30000001"]  //gif广告
    ];

    //var urlRoot = 'http://s.go.sohu.com/adgtr/?';
    //var urlRoot = 'http://10.16.10.63/adgtr/?bucketid=2&';

    var ADUtils = require("./ADUtils");
    var ch_trans =ADUtils.getAdTransCode();
    var MSOHUBASEAD = require("./config");
    var MSOHUAD = require("./MSOHUAD");
    var iframeUrlClick = 'http://i.go.sohu.com/count/c?';

    var getAdRequestBaseUrl = MSOHUBASEAD.getAdRequestBaseUrl;

    var isDataNoEmpty = function (data) {
        // 在这里空数据的时候，会有itemspaceid属性
        return Object.keys(data).length > 1;
    };

    var isTestEnvironment = function() {
        // 判断是正式环境还是测试环境
        var hostName = window.location.hostname;
        var result = /^m\.sohu\.com$/.test(hostName) || window.location.href.indexOf('public') > 0;
        return result;
    };

    var getFullUrl = function (url) {
        return url.indexOf('http') === 0 ? url : 'http://' + url;
    };

    var getParamsStr = function (data) {
        var i;
        var str = '';
        var params = {
            aid: isDataNoEmpty(data) && data.adid ? data.adid : '',
            apid: 'beans_' + data.itemspaceid,
            impid: isDataNoEmpty(data) && data.impression_id ? data.impression_id : '',
            at: isDataNoEmpty(data) && data.adtype ? data.adtype : '',
            mkey: isDataNoEmpty(data) && data.monitorkey ? data.monitorkey : '',
            latcy: '',
            freq: isDataNoEmpty(data) && data.freq ? data.freq : '',
            turn: 1,
            ipos: 0,
            pgid: 'pgid' + new Date().getTime(),
            ax: (isDataNoEmpty(data) && data.adElem) && data.adElem.offsetLeft ? data.adElem.offsetLeft : '',
            ay: (isDataNoEmpty(data) && data.adElem) && data.adElem.offsetTop ? data.adElem.offsetTop : '',
            cx: (isDataNoEmpty(data) && data.cx) && data.cx ? data.cx : '',
            cy: (isDataNoEmpty(data) && data.cy) && data.cy ? data.cy : '',
            ed: isDataNoEmpty(data) && data.ed ? data.ed : '',
            supplyid: 4,
            ext: isDataNoEmpty(data) && data.ext ? data.ext : '',
            rsln: window.screen.width + '*' + window.screen.height,
            ref: encodeURIComponent(document.referrer),
            sf: false,
            jsv: window['passion_config'] && window['passion_config']['VERSION'] || '06301130',
            r: (Math.random() + '').substring(2, 15),
            bucket: isDataNoEmpty(data) && data.bucket ? data.bucket : '',
            newschn : isDataNoEmpty(data) && data.newschn ? data.newschn : '',
            subchannelid : isDataNoEmpty(data) && data.subchannelid ? data.subchannelid : '',
            ch_trans: ch_trans
        };
        for (i in params) {
            str += i + '=' + params[i] + '&';
        }
        str = str.substr(0, str.length-1);
        return str;
    };

    var getImpUrl= function (url, apid, impid) {
        var prefix = /\?/.test(url) ? '&' : '?';
        var rdm = Math.random().toString().substring(2, 15);

        if(url.indexOf('http') !== -1) {
            if (url.indexOf('imp.optaim.com') >= 0) {
                return [url, prefix, 'apid=', apid, '&impid=', impid, '&rdm=', rdm].join('');
            } else {
                return url + '&rdm=' + rdm;
            }
        }
    };
    // 没"?"加"?", 没"&"加"&"
    var handleStatisticsParamsPrefix = function (url) {
        if ( typeof url === 'string' ) {
            return url.indexOf('?') === -1 ? url + '?' : url.substr(-1) === '&' ? url : (url + '&');
        } else {
            return '';
        }

    };

    var handleSendCode = function (url, data) {
        var apid = 'beans_' + (data ? data.itemspaceid : '');
        var impid = data ? data.impression_id : '';

        var sendCodeArr = function (urlArr) {
            var len = urlArr.length;
            var i;
            for (i = 0; i < len; i += 1) {
                if(url.indexOf('http') !== -1){
                    Statistics.addStatistics( {}, handleStatisticsParamsPrefix( getImpUrl( urlArr[ i ], apid, impid ) ) );
                }
            }
        };

        if (/^\[(.+?)\]$/.test(url)) {
            sendCodeArr(JSON.parse(url));
        } else if (/\|/.test(url)) {
            sendCodeArr(url.split('|'));
        } else {
            if(url.indexOf('http') !== -1){
                Statistics.addStatistics({}, handleStatisticsParamsPrefix(getImpUrl(url, apid, impid)));
            }
        }
    };
    // pv统计
    var sendStatisCodeAlways = function (data) {
        var urlPv = 'http://i.go.sohu.com/count/v?';
        handleSendCode(urlPv + getParamsStr(data), data);

        if (data.resource && data.resource.imp) handleSendCode(data.resource.imp, data);
    };
    // 请求错误统计
    var sendStatisCodeError = function (data) {
        var urlPv = 'http://i.go.sohu.com/count/e?';
        handleSendCode(urlPv + getParamsStr(data), data);

        if (data.resource && data.resource.imp) handleSendCode(data.resource.imp, data);
    };

    // 超时上报
    var sendStatisCodeTimeout = function (data) {
        var urlPv = 'http://i.go.sohu.com/count/to?';
        handleSendCode(urlPv + getParamsStr(data), data);

        if (data.resource && data.resource.imp) handleSendCode(data.resource.imp, data);
    };

    // 播放统计
    var sendStatisCodePause = function(data) {
        var urlPause = 'http://i.go.sohu.com/count/vp?';

        Statistics.addStatistics({}, handleStatisticsParamsPrefix(urlPause + getParamsStr(data)));
        if (data.resource && data.resource.tracking_imp) handleSendCode(data.resource.tracking_imp, data);
    };
    // 曝光统计
    var sendStatisCode = function (data) {
        var urlAv = 'http://i.go.sohu.com/count/av?';
        handleSendCode(urlAv + getParamsStr(data), data);
    };
    // 点击统计
    var clickSendStatisCode = function (e, data, url) {
        var urlClick = 'http://i.go.sohu.com/count/c?';
        if(is_click === true) {
            return;
        }
        var is_click = true;
        if (e.target.nodeName === 'IMG') {
            data.cx = e.offsetX;
            data.cy = e.offsetY;
        }

        urlLink = urlClick + getParamsStr(data);

        $.ajax({
            url: urlLink,
            type: 'GET',
            dataType: 'jsonp',
            success : function(data) {
                if(url) {
                    if(data.STATUS !== "OK") {
                        handleSendCode(urlClick + getParamsStr(data) , data);
                    }
                    window.location.href = url;
                }
            },
            error : function () {
                handleSendCode(urlClick + getParamsStr(data) , data);
                setTimeout(function() {
                    window.location.href = url;
                }, 2000);
            }
        });

        setTimeout(function(){is_click = false;}, 2000);

        if (data.resource.clkm) {
            handleSendCode(data.resource.clkm, data);
        }
    };

    var getTurnNum = function(max_turn, adTurnName){
        var isSupportLocalStorage = ('localStorage' in window),
            maxTurn = 60,
            turn,
            newTurn,
            result,
            adTurnObj = isSupportLocalStorage ? ( JSON.parse(window.localStorage.getItem('msohu/ad_turn')) || {} )  : {};

        turn = parseInt( ( adTurnObj[adTurnName] || parseInt( Math.random() * maxTurn + 1, 10 ) ), 10 );
        newTurn = newTurn > maxTurn ? 1 : turn + 1;
        adTurnObj[adTurnName] = newTurn;
        if(isSupportLocalStorage){
            window.localStorage.setItem('msohu/ad_turn', JSON.stringify(adTurnObj));
        }
        result = max_turn ? ((newTurn - 1) % max_turn + 1) : newTurn;

        return result;
    };

    var isFirstShowToday = function (type, isGet) {
        if (isGet) return CookieUtil.get(type);

        var nowTime = new Date();
        var endTime = new Date(nowTime.getFullYear(),
            nowTime.getMonth(),
            nowTime.getDate(),
            "23","59","59");

        if (CookieUtil.get(type)) {
            return false;
        }
        else {
            CookieUtil.set(type, 1, endTime);
            return true;
        }
    };

    var getChannelById = function () {
        var path = location.pathname;
        var pathRegex;
        if (path === '/') {
            return '首页';
        }
        else {
            pathRegex = /\/c\/(\d+)/.exec(location.pathname);
            return pathRegex ? channelIdToName[pathRegex[1]] : '';
        }
    };

    var getItemspace = function (configIndex, pos) {
        var itemspaceid, channel, argument = {};
        try {
            if (pos === 'index') {
                channel = getChannelById();
            } else {
                channel = window.article_config.channel_long_path[0][0];
            }

            if(isTestEnvironment()) {
                argument = {
                    itemspaceid : config[channel][configIndex][1],
                    itemspaceidTest : config[channel][configIndex][2],
                    adps : config[channel][configIndex][3]
                };

            } else {
                argument = {
                    itemspaceid : config[channel][configIndex][1],
                    adps : config[channel][configIndex][3]
                };
            }
        }
        catch (error) {
            argument = {};
        }
        return argument;
    };

    var handlerUrlAndParams = function(url, params) {
        var result,

            //把对象转换为序列化的字符串
            objToStr = function(obj) {
                var i,
                    arr = [];

                if (typeof obj === 'object' && !!obj && obj !== {}) {
                    for (i in obj) {
                        if (obj.hasOwnProperty(i)) {
                            arr.push(i + '=' + obj[i]);
                        }
                    }
                    return arr.join('&');
                } else if (obj === {} || obj === null) {
                    return '';
                }
            };

        if (url.indexOf('?') === -1) {
            result = url + '?';
            //判断？是否是最后一个字符
        } else if (url.charAt(url.length - 1) === '?') {
            result = url;
        } else {
            result = url + '&';
        }

        return result + objToStr(params);
    };

    var exposure = function(domEle, data) {
        var moneyExposureStatis = MSOHUAD.moneyExposureStatis || {};

        if ( !$(domEle).attr('is_send') && moneyExposureStatis.isExposure(domEle[0]) ) {
            sendStatisCode(data);
            $(domEle).attr('is_send', 1);
        }
    };

    var getChannelId = function() {
        var hostName = window.location.hostname,
            pathName = window.location.pathname,
            channelPageRegResult = /\/c\/(\d+)/i.exec(pathName),
            finalPageRegResult = /\/n\/(\d+)/i.exec(pathName),
            finalPageChannelData,newschn, subchannelid;

        if (!/m\.(sohu|sohuno)\.com/.test(hostName)) {
            return;
        }

        if(window.location.pathname.split('/')[1] == 'c') {
            newschn = window.location.pathname.match(/[1-9][0-9]*/g)[0];
        } else if (!!window.article_config && !!window.article_config.channel_long_path) {
            finalPageChannelData = window.article_config.channel_long_path;
            newschn = finalPageChannelData[0][1].match(/[1-9][0-9]*/g)[0];
            if (!!finalPageChannelData[1]) {
                subchannelid = finalPageChannelData[1][1].match(/[1-9][0-9]*/g)[0];
            }
        } else {
            newschn = '1';
        }

        return {
            newschn : newschn ? newschn : '',
            subchannelid : subchannelid ? subchannelid : ''
        };
    };

    //var newschn = getChannelId().newschn;
    //var subchannelid = getChannelId().subchannelid;

    var MONEY = {

        // 浮层广告
        indexWin: function () {
            baseAdParam = carExhAdData[0];
            // baseAdParam = ['' , getItemspace(0, 'index').itemspaceid, getItemspace(0, 'index').itemspaceidTest, getItemspace(0, 'index').adps];

            var textNeighbor = document.querySelector('header');
            // if(!baseAdParam[1] || !textNeighbor) {
            //     return;
            // }

            var turn = getTurnNum(2, 'indexWin');
            var self = this;
            var itemspaceid = isTestEnvironment() ? baseAdParam[2].length !== 0 ? baseAdParam[2] : baseAdParam[1] : baseAdParam[1];

            if (isFirstShowToday('indexWin_' + itemspaceid, true)) {
                this.indexSelect();
                return;
            }

            new Jsonp({
                url: getAdRequestBaseUrl(baseAdParam) + '&turn=' + turn,
                time : timeout,
                success : function(data) {
                    data = data[0];
                    if (!data || !data.resource || !data.resource1) {
                        sendStatisCodeAlways({
                            itemspaceid: itemspaceid//,
                            // newschn : newschn,
                            // subchannelid : subchannelid
                        });
                        self.indexSelect();
                        return;
                    }

                    isFirstShowToday('indexWin_' + itemspaceid);
                    // Statistics.addStatistics({
                    //     _once_ : '000157_indexWin',
                    //     itemspaceid : itemspaceid
                    // });

                    var url = getFullUrl(data.resource.click);
                    var html =
                        '<div class="index-win-money-img-inner">' +
                            '<div class="index-win-money-img-inner-cell">' +
                                '<p>' +
                                    '<i class="index-win-money-close index-win-money-img-close" data-type="img">关闭广告</i>' +
                                    '<a href="javascript:;" data-url="' + url + '">' +
                                    '<i id="index-win-money-time" class="index-win-money-time index-win-money-time-3"></i>' +
                                    '<img src="' + data.resource.file + '" />' +
                                    '</a>' +
                                '</p>' +
                            '</div>' +
                        '</div>';
                    var textHtml =
                        '<i class="index-win-money-close index-win-money-text-close" data-type="text"></i>' +
                        '<a href="javascript:;" data-url="' + url + '">' + data.resource1.text + '</a>';
                    var countdownNum = 3;
                    var root, img, coutdownTime;

                    var handleClick = function(e){
                        e.preventDefault();
                        clickSendStatisCode(e, data, this.getAttribute('data-url'));
                    };

                    var changeToTextLink = function () {
                        document.querySelector('.index-win-money-img').style.display= 'none';
                        document.querySelector('.index-win-money-text').style.display= 'block';

                        document.querySelector('.index-win-money-text a').onclick = handleClick;
                    };

                    var countdown = function (go) {
                        if (go) {
                            countdownNum = 0;
                            var pathname = window.location.pathname;
                            //var channelId = /^\/$/.test(pathname) ? '1' : /\/c\/(\d+)/i.exec(pathname)[1];
                            // Statistics.addStatistics({
                            //     _once_ : '000091_gb_hsfc',
                            //     itemspaceid : data.itemspaceid,
                            //     channelId : channelId
                            // });
                            clearTimeout(coutdownTime);
                            changeToTextLink();
                            return;
                        }

                        coutdownTime = setTimeout(function(){
                            changeToTextLink();
                            clearTimeout(coutdownTime);
                        }, 3000);

                        var countdownInterval = setInterval(function(){
                            if (countdownNum === 0) {
                                clearInterval(countdownInterval);
                                return;
                            }
                            countdownNum --;
                        document.querySelector('.index-win-money-time').className = 'index-win-money-time index-win-money-time-' + countdownNum;
                        }, 1000);

                    };

                    var closeMoney = function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var type = this.getAttribute('data-type');
                        if (type === 'text') {
                            setTimeout(function(){
                                document.querySelector('.index-win-money-text').style.display= 'none';
                            },400);
                        } else {
                            countdown(true);
                        }
                    };

                    root = document.createElement('div');
                    root.className = 'index-win-money-img';
                    if (!/all/.test(textNeighbor.className)) {
                        root.className += ' index-win-money-img-sub';
                    }
                    root.innerHTML = html;
                    root.style.height = document.body.scrollHeight + 'px';
                    $('body').append(root);

                    textRoot = document.createElement('div');
                    textRoot.className = 'index-win-money-text';
                    textRoot.innerHTML = textHtml;
                    if ( $("#scroller").length !== 0 ) {
                        $("#pullDown").after( textRoot );
                    } else {
                        textNeighbor.parentNode.insertBefore(textRoot, textNeighbor);
                    }

                    countdown();

                    setTimeout(function() {
                        $('.index-win-money-img-close').show('500');
                    }, 200);

                    document.querySelector('.index-win-money-img-close').onclick = closeMoney;
                    document.querySelector('.index-win-money-text-close').onclick = closeMoney;

                    data.itemspaceid = itemspaceid;
                    //data.newschn = newschn;
                    //data.subchannelid = subchannelid;
                    data.adElem = root;
                    sendStatisCodeAlways(data);
                    sendStatisCode(data);
                    //$(document.body).on('click', '.index-win-money-img a', handleClick);

                    $('body').on('click', '.index-win-money-img a', function(e) {
                        e.preventDefault();
                        clickSendStatisCode(e, data, this.getAttribute('data-url'));
                    });
                },
                error : function(data) {
                    sendStatisCodeError({
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                    Statistics.addStatistics({
                        _once_ : '000157_error',
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                },
                timeout : function(data) {
                    sendStatisCodeTimeout({
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                    Statistics.addStatistics({
                        _once_ : '000157_adtimeout',
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                }
            });
        },

        // 下拉广告
        indexSelect: function() {
            baseAdParam = carExhAdData[1];

            var textNeighbor = document.querySelector('#beans_'+baseAdParam[2]);

            // if(!baseAdParam[1] || !textNeighbor) {
            //     return;
            // }

            var turn = getTurnNum(2, 'indexSelect');
            var itemspaceid = isTestEnvironment() ? baseAdParam[2].length !== 0 ? baseAdParam[2] : baseAdParam[1] : baseAdParam[1];

            var a = isFirstShowToday('indexSelect_' + itemspaceid, true);
            console.log(a);
            if (isFirstShowToday('indexSelect_' + itemspaceid, true)) {
                return;
            }

            new Jsonp({
                url: getAdRequestBaseUrl(baseAdParam) + '&turn=' + turn,
                time : timeout,
                success : function(data) {
                    data = data[0];
                    if (!data || !data.resource || !data.resource1) {
                        sendStatisCodeAlways({itemspaceid: itemspaceid});
                        return;
                    }

                    isFirstShowToday('indexSelect_' + itemspaceid);
                    // Statistics.addStatistics({
                    //     _once_ : '000157_indexSelect',
                    //     itemspaceid : itemspaceid
                    // });

                    var url = getFullUrl(data.resource.click);
                    var html =
                        '<p class="index-select-money-img">' +
                        '<a href="javascript:;" data-url="' + url + '">' +
                            '<i id="index-win-money-time" class="index-win-money-time index-win-money-time-3"></i>' +
                            '<img src="' + data.resource.file + '" />' +
                        '</a>' +
                        '</p>' +
                        '<p class="index-select-money-text">' +
                        '<a href="javascript:;" class="index-select-money-zoom"></a><a class="index-select-txt" href="javascript:;" data-url="' + url + '">' + data.resource1.text + '</a>' +
                        '</p>';
                    var countdownNum = 3;
                    var root, img, coutdownTime;

                    var toggleShowImg = function (e) {
                        e.preventDefault();
                        if (countdownNum > 0) {
                            countdown(true);
                            return;
                        }
                        if (/index-select-money-showimg/.test(root.className)) {
                            setTimeout(function(){
                                root.className = 'index-select-money select-exposure';
                            }, 400);
                        } else {
                            setTimeout(function(){
                                root.className = 'index-select-money index-select-money-showimg';
                            }, 400);
                        }
                    };

                    var changeToTextLink = function () {
                        root.className = 'index-select-money select-exposure';
                        document.querySelector('.index-win-money-time').style.display = 'none';
                    };

                    var countdown = function (go) {
                        if (go) {
                            countdownNum = 0;
                            clearTimeout(coutdownTime);
                            changeToTextLink();
                            return;
                        }

                        coutdownTime = setTimeout(function(){
                            changeToTextLink();
                            clearTimeout(coutdownTime);
                        }, 3000);

                        var countdownInterval = setInterval(function(){
                            if (countdownNum === 0) {
                                clearInterval(countdownInterval);
                                return;
                            }
                            countdownNum --;
                            document.querySelector('.index-win-money-time').className =
                            'index-win-money-time index-win-money-time-' + countdownNum;
                        }, 1000);

                    };

                    root = document.createElement('div');
                    root.className = 'index-select-money index-select-money-showimg';
                    root.innerHTML = html;
                    if ( $("#scroller").length !== 0 ) {
                        $("#pullDown").after( root );
                    } else {
                        textNeighbor.appendChild(root);
                    }

                    countdown();

                    data.itemspaceid = itemspaceid;
                    //data.newschn = newschn;
                    //data.subchannelid = subchannelid;
                    data.adElem = root;

                    sendStatisCodeAlways(data);
                    sendStatisCode(data);
                    if ( FastClick ) {
                        FastClick.attach( $(".index-select-money-zoom")[0] );
                    }
                    $(document.body).on('click', '.select-exposure .index-select-money-zoom', function(e) {
                        e.preventDefault();
                        /* Act on the event */
                        sendStatisCode(data);
                    });
                    $(document.body).on('click', '.index-select-money-img a , .index-select-txt', function(e) {
                        e.preventDefault();
                        clickSendStatisCode(e, data, this.getAttribute('data-url'));
                    });

                    $(document.body).on('click', '.index-select-money-zoom', toggleShowImg);
                },
                error : function(data) {
                    sendStatisCodeError({
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                    Statistics.addStatistics({
                        _once_ : '000157_error',
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                },
                timeout : function(data) {
                    sendStatisCodeTimeout({
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                    Statistics.addStatistics({
                        _once_ : '000157_adtimeout',
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                }
            });
        },

        implantH5: function () {
            //baseAdParam = ['' , getItemspace(2, 'index').itemspaceid, getItemspace(2, 'index').itemspaceidTest, getItemspace(2, 'index').adps];
            baseAdParam = carExhAdData[2];

            // if(!isTestEnvironment()) {
            //     if(!baseAdParam[1]) {
            //         return;
            //     }
            // }

            var turn = 1;
            var itemspaceid = isTestEnvironment() ? baseAdParam[2].length !== 0 ? baseAdParam[2] : baseAdParam[1] : baseAdParam[1];

            if (isFirstShowToday('h5Ad_' + itemspaceid, true)) {
                this.gif();
                return;
            }

            var that = this;

            new Jsonp({
                url: getAdRequestBaseUrl(baseAdParam) + '&turn=' + turn,
                time : timeout,
                success : function(data) {
                    data = data[0];
                    if (!data || !data.resource) {
                        sendStatisCodeAlways({
                            itemspaceid: itemspaceid//,
                            //newschn : newschn,
                            //subchannelid : subchannelid
                        });
                        that.gif();
                        return;
                    }

                    isFirstShowToday('h5Ad_' + itemspaceid);

                    data.itemspaceid = itemspaceid;
                    //data.newschn = newschn;
                    //data.subchannelid = subchannelid;

                    var html,
                        click_para = getParamsStr(data),
                        clkm = iframeUrlClick + click_para;

                    data.iframe = handlerUrlAndParams(data.resource.file, {
                        clkm: encodeURIComponent(clkm)
                    });

                    html = '<div class="player">\
                        <div class="videoRoot">\
                            <iframe border="0" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" src="' + data.iframe + '" style="width:100%; height: 100%; margin:0 auto; vertical-align: top;"></iframe>\
                        </div>\
                        <p class="toResouse h5Detail">\
                            <a href="javascript:;" data-url="' + data.resource.click + '">查看详情</a>\
                            <span>广告</span>\
                        </p>\
                    </div>';

                    var handleClick = function(e){
                        e.preventDefault();
                        clickSendStatisCode(e, data, this.getAttribute('data-url'));
                    };

                    var adWrap = $(html).appendTo('.video_player');

                    data.adElem = adWrap[0];

                    $(window).scroll(function(){
                        exposure($('.player') , data);
                    });

                    var screenWidth = window.innerWidth;

                    if($('.videoRoot').length > 0) {
                        $('.player').css({
                            'width': (screenWidth - 22) + 'px',
                            'marginLeft': 'auto',
                            'marginRight': 'auto'
                        });
                        $('.videoRoot').css({
                            'width': (screenWidth - 22) + 'px',
                            'height': (screenWidth - 22)/2 + 'px'
                        });
                        $('#videoElem').css({
                            'width': (screenWidth - 22) + 'px',
                            'height': (screenWidth - 22)/2 + 'px'
                        });
                    }

                    sendStatisCodeAlways(data);

                    $('.h5Detail a').on('click', handleClick);


                },
                error : function(data) {
                    if($('.video_player')){
                        $('.video_player').remove();
                    }
                    sendStatisCodeError({
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                    Statistics.addStatistics({
                        _once_ : '000157_error',
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                },
                timeout : function(data) {
                    if($('.video_player')){
                        $('.video_player').remove();
                    }
                    sendStatisCodeTimeout({
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                    Statistics.addStatistics({
                        _once_ : '000157_adtimeout',
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                }
            });
        },

        videoPlayer: function () {
            //baseAdParam = ['' , getItemspace(3, 'index').itemspaceid, getItemspace(3, 'index').itemspaceidTest, getItemspace(3, 'index').adps];
            baseAdParam = carExhAdData[3];

            var ua = navigator.userAgent.toLowerCase(),
                qqMatch = ua.match(/(?:MQ)?QBrowser\/([\d\.]+)/i),
                ucMatch = ua.match(/UCBrowser(?:\/)?([\d\.\/]+)/i),
                sogouMatch = ua.match(/SogouMobileBrowser(?:\/)?([\d\.\/]+)/i),
                UCVersionStr = !!ucMatch ? ucMatch[1] : null,
                UCVersion = 0,
                QQVersionStr = !!qqMatch ? qqMatch[1] : null,
                QQVersion = 0;

            // android uc version < 10.4 的屏蔽视频广告
            if (!!UCVersionStr) {
                var UCVersionMatch = UCVersionStr.match(/(^\d+\.\d+)/i);
                if (!!UCVersionMatch) {
                    UCVersion = Number(UCVersionMatch[1]);
                }
            }

            // android qq version < 4.0 的屏蔽视频广告
            if (!!QQVersionStr) {
                var QQVersionMatch = QQVersionStr.match(/(^\d+\.\d+)/i);
                if (!!QQVersionMatch) {
                    QQVersion = Number(QQVersionMatch[1]);
                }
            }

            if( (supporter.os.android && sogouMatch) ||
                (supporter.os.ios && ucMatch) ||
                (supporter.os.android && !!ucMatch && UCVersion < 10.4) ||
                (supporter.os.android && !!qqMatch && QQVersion < 4.0) ) {
                return;
            }

            var turn = 1;
            var is_send = true;
            // 测试id和线上id选择
            var itemspaceid = isTestEnvironment() ? baseAdParam[2].length !== 0 ? baseAdParam[2] : baseAdParam[1] : baseAdParam[1];


            if (isFirstShowToday('videoAd_' + itemspaceid, true)) {
                if($('.video_player')){
                    $('.video_player').remove();
                }
                return;
            }
            var that =this;

            new Jsonp({
                url: getAdRequestBaseUrl(baseAdParam) + '&turn=' + turn,
                time : timeout,
                success : function(data) {
                    data = data[0];
                    if (!data || !data.resource || !data.resource1) {
                        if($('.video_player')){
                            $('.video_player').remove();
                        }
                        sendStatisCodeAlways({
                            // itemspaceid广告位id, newschn一级频道id, subchannelid二级频道id
                            itemspaceid: itemspaceid//,
                            //newschn : newschn,
                            //subchannelid : subchannelid
                        });
                        return;
                    }

                    var handleClick = function(e){
                        e.preventDefault();
                        clickSendStatisCode(e, data, this.getAttribute('data-url'));
                    };

                    isFirstShowToday('videoAd_' + itemspaceid);

                    var getDataType = function(data) {
                        var adInfo = {};

                        if (!!data.special && !!data.special.dict) {
                            if (!!data.special.dict.picture) {
                                adInfo.image = data[data.special.dict.picture].file;
                            }
                            if (!!data.special.dict.title) {
                                adInfo.title = data[data.special.dict.title].text;
                            }
                            if (!!data.special.dict.video) {
                                adInfo.video = data[data.special.dict.video].file;
                            }

                        }
                        return adInfo;
                    };
                    var html;

                    adInfo = getDataType(data);

                    if(supporter.os.android && supporter.os.version <= 4.0) {
                        html =  '<div class="player">\
                            <div class="video_tvp_link">\
                                <div class="video-poster" style="background-image: url('+ adInfo.image +'); background-color: rgb(0, 0, 0); width: 320px; height: 160px; background-position: 50% 50%; background-size: 100%; background-repeat: no-repeat;">\
                                    <a style="width:100%;height:100%;display:block" class="tvp_mp4_link" href="' + adInfo.video +　'" target="_blank">\
                                    </a>\
                                </div>\
                                <a class="player_control" href="' + adInfo.video +　'" target="_blank">\
                                    <span class="playBtn"><b class="state_play"></b></span>\
                                </a>\
                            </div>\
                            <p class="toResouse toResouseGif">\
                                <a href="javascript:;" data-url="' + data.resource.click + '">查看详情</a>\
                                <span>广告</span>\
                            </p>\
                        </div>';
                    } else {
                        html = '<div class="player">\
                            <div class="videoRoot">\
                                <video id="videoElem" controls="controls" poster="'+ adInfo.image +'" src="' + adInfo.video +　'" width="100%" height="100%" webkit-playsinline x-webkit-airplay="true"></video>\
                            </div>\
                            <p class="toResouse toResouseVideo">\
                                <a href="javascript:;" data-url="' + data.resource.click + '">查看详情</a>\
                                <span>广告</span>\
                            </p>\
                        </div>';
                    }


                    var adWrap = $(html).appendTo('.video_player');

                    data.itemspaceid = itemspaceid;
                    //data.newschn = newschn;
                    //data.subchannelid = subchannelid;
                    data.adElem = adWrap[0];


                    $(window).scroll(function(){
                        exposure($('.player') , data);
                    });

                    var screenWidth = window.innerWidth;

                    if($('.videoRoot').length > 0) {
                        $('.player').css({
                            'width': (screenWidth - 22) + 'px',
                            'marginLeft': 'auto',
                            'marginRight': 'auto'
                        });
                        $('.videoRoot').css({
                            'width': (screenWidth - 22) + 'px',
                            'height': (screenWidth - 22)/2 + 'px'
                        });
                        $('#videoElem').css({
                            'width': (screenWidth - 22) + 'px',
                            'height': (screenWidth - 22)/2 + 'px'
                        });
                    } else if (supporter.os.android && supporter.os.version <= 4.0) {
                        $('.video_tvp_link').css({
                            'width': (screenWidth - 22) + 'px',
                            'marginLeft': 'auto',
                            'marginRight': 'auto'
                        });
                        $('.video-poster').css({
                            'width': (screenWidth - 22) + 'px',
                            'height': (screenWidth - 22)/2 + 'px'
                        });
                    }

                    $(document.body).on('click', '.video_tvp_link a', function(){
                        if(supporter.os.android && supporter.os.version <= 4.0) {
                            sendStatisCodePause(e, data);
                        }
                    });

                    $('#videoElem').on({
                        play : function(e) {
                            e.preventDefault();
                            //clickSendStatisCode(e, data);
                            if(location.pathname === '/') {
                                Statistics.addStatistics('000091_spdj_hsxwbk');
                            } else {
                                Statistics.addStatistics('000091_spdj_ylywbk');
                            }

                            sendStatisCodePause(data);
                        }
                    });

                    sendStatisCodeAlways(data);
                    $('.toResouseVideo a').on('click', handleClick);
                },
                error : function(data) {
                    if($('.video_player')){
                        $('.video_player').remove();
                    }
                    sendStatisCodeError({
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                    Statistics.addStatistics({
                        _once_ : '000157_error',
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                },
                timeout : function(data) {
                    if($('.video_player')){
                        $('.video_player').remove();
                    }
                    sendStatisCodeTimeout({
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                    Statistics.addStatistics({
                        _once_ : '000157_adtimeout',
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                }
            });
        },

        gif: function () {
            //baseAdParam = ['' , getItemspace(4, 'index').itemspaceid, getItemspace(4, 'index').itemspaceidTest, getItemspace(4, 'index').adps];
            baseAdParam = carExhAdData[4];

            // if(!baseAdParam[1]) {
            //     return;
            // }

            var turn = 1;
            var itemspaceid = isTestEnvironment() ? baseAdParam[2].length !== 0 ? baseAdParam[2] : baseAdParam[1] : baseAdParam[1];


            if (isFirstShowToday('gifAd_' + itemspaceid, true)) {
                this.videoPlayer();
                return;
            }

            var that = this;

            new Jsonp({
                url: getAdRequestBaseUrl(baseAdParam) + '&turn=' + turn,
                time : timeout,
                success : function(data) {
                    data = data[0];
                    if (!data || !data.resource) {
                        sendStatisCodeAlways({
                            itemspaceid: itemspaceid//,
                            //newschn : newschn,
                            //subchannelid : subchannelid
                        });
                        that.videoPlayer();
                        return;
                    }

                    isFirstShowToday('gifAd_' + itemspaceid);

                    var html;

                    html = '<div class="player">\
                        <div class="videoRoot">\
                            <img id="videoElem" src="' + data.resource.file +　'" width="100%" height="100%"></img>\
                            <i></i>\
                        </div>\
                        <p class="toResouse toResouseGif">\
                            <a href="javascript:;" data-url="' + data.resource.click + '">查看详情</a>\
                            <span>广告</span>\
                        </p>\
                    </div>';

                    var handleClick = function(e){
                        e.preventDefault();
                        clickSendStatisCode(e, data, this.getAttribute('data-url'));
                    };

                    var adWrap = $(html).appendTo('.video_player');

                    data.itemspaceid = itemspaceid;
                    //data.newschn = newschn;
                    //data.subchannelid = subchannelid;
                    data.adElem = adWrap[0];


                    $(window).scroll(function(){
                        exposure($('.player') , data);
                    });

                    var screenWidth = window.innerWidth;

                    if($('.videoRoot').length > 0) {
                        $('.player').css({
                            'width': (screenWidth - 22) + 'px',
                            'marginLeft': 'auto',
                            'marginRight': 'auto'
                        });
                        $('.videoRoot').css({
                            'width': (screenWidth - 22) + 'px',
                            'height': (screenWidth - 22)/2 + 'px'
                        });
                        $('#videoElem').css({
                            'width': (screenWidth - 22) + 'px',
                            'height': (screenWidth - 22)/2 + 'px'
                        });
                    }

                    sendStatisCodeAlways(data);
                    // 播放、停止切换
                    $(".videoRoot").click( function() {
                        var theSrc = $("#videoElem").attr("src");
                        $("#videoElem").attr( "src", theSrc == data.resource2.file ? data.resource.file : data.resource2.file );
                        $(".videoRoot i").toggle();
                        if(!/gif/.test(theSrc)) {
                            sendStatisCodePause(data);
                        }
                    });

                    $('.toResouseGif a').on('click', handleClick);
                },
                error : function(data) {
                    if($('.video_player')){
                        $('.video_player').remove();
                    }
                    sendStatisCodeError({
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                    Statistics.addStatistics({
                        _once_ : '000157_error',
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                },
                timeout : function(data) {
                    if($('.video_player')){
                        $('.video_player').remove();
                    }
                    sendStatisCodeTimeout({
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                    Statistics.addStatistics({
                        _once_ : '000157_adtimeout',
                        itemspaceid: itemspaceid,
                        //newschn : newschn,
                        //subchannelid : subchannelid,
                        supplyid: 4
                    });
                }
            });
        },

        detailBottom: function() {
            baseAdParam = ['' , getItemspace(5).itemspaceid, getItemspace(5).itemspaceidTest, getItemspace(5).adps];

            if(!baseAdParam[1] || /_trans_=000014_baidu_zt/.test(window.location.href)) {
                return;
            }

            var turn = getTurnNum(2, 'detailBottom');
            var itemspaceid = isTestEnvironment() ? baseAdParam[2].length !== 0 ? baseAdParam[2] : baseAdParam[1] : baseAdParam[1];

            if (isFirstShowToday('detailBottom_' + itemspaceid, true)) {
                return;
            }

            new Jsonp({
                url: getAdRequestBaseUrl(baseAdParam) + '&turn=' + turn + '&newschn=' + newschn  + '&subchannelid=' + subchannelid,
                time : timeout,
                success : function(data) {
                    data = data[0];
                    if (!data || !data.resource) {
                        sendStatisCodeAlways({
                            itemspaceid: itemspaceid,
                            newschn : newschn,
                            subchannelid : subchannelid
                        });
                        return;
                    }

                    isFirstShowToday('detailBottom_' + itemspaceid);

                    var url = getFullUrl(data.resource.click);
                    var html = '<div class="detail-bottom-money">' +
                        '<span class="detail-bottom-money-close"></span>' +
                        '<a href="javascript:;" data-url="' + url + '" target="_blank">' +
                            '<img src="' + data.resource.file + '" />' +
                        '</a>' +
                        '</div>';
                    var adWrap = $(html).appendTo('body');

                    data.itemspaceid = itemspaceid;
                    data.newschn = newschn;
                    data.subchannelid = subchannelid;

                    data.adElem = adWrap[0];
                    sendStatisCodeAlways(data);
                    sendStatisCode(data);

                    var handleClick = function(e){
                        e.preventDefault();
                        clickSendStatisCode(e, data, this.getAttribute('data-url'));
                    };

                    var handleClose = function (e) {
                        $(this).parent().hide();
                    };

                    $('.detail-bottom-money a').on('click', handleClick);
                    $('.detail-bottom-money-close').on('click', handleClose);
                },
                error : function() {
                    sendStatisCodeError({
                        itemspaceid: itemspaceid,
                        newschn : newschn,
                        subchannelid : subchannelid,
                        supplyid: 4
                    });
                    Statistics.addStatistics({
                        _once_ : '000157_error',
                        itemspaceid: itemspaceid,
                        newschn : newschn,
                        subchannelid : subchannelid,
                        supplyid: 4
                    });
                },
                timeout : function() {
                    Statistics.addStatistics({
                        _once_ : '000157_adtimeout',
                        itemspaceid: itemspaceid,
                        newschn : newschn,
                        subchannelid : subchannelid,
                        supplyid: 4
                    });
                }
            });
        }
    };

    module.exports = MONEY;

