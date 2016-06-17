var CookieUtil = require("./CookieUtil"),
    MSOHUAD = require("./MSOHUAD"),
    MONEY = require("./ad"),
    template = require("art-template"),
    ADUtil = require("./ADUtils"),
    AD = MSOHU.AD || (MSOHU.AD = {}),
    adDataHandle = MSOHUAD.adDataHandle,
    handleFormalAndTestAdParam = MSOHUAD.handleFormalAndTestAdParam,
    renderAdAndSendStatis = MSOHUAD.renderAdAndSendStatis,
    adHeadlineMapParam = window.adHeadlineMapParam, //头条banner图广告参数
    // MSOHU = window.MSOHU || (window.MSOHU = {}),
    
    Statistics = require("./statics.js"),
    Slide = require("./Slide.js"),
    ImageLazyLoader = require("./ImageLazyLoader"),
    Jsonp = require("./jsonp"),
    Utils = MSOHUAD.Utils,
    supporter = require("./supporter.js"),
    // 
    isNoADMSohu = ADUtil && ADUtil.isNoADMSohu,
    // isTestEnvironment = (function() {
    //     // 判断是正式环境还是测试环境
    //     var result = window.location.href.indexOf('public') > 0;
    //     // result = false;
    //     return result;
    //     // return true;
    // })();
    // 
    isTestEnvironment = supporter.isTestEnvironment;

    // 用来判断是否发送统计的函数，应用于焦点图广告av统计的发送(元素曝光的情况下发送)
    // MSOHUAD.isSentStatis = function() {
    //     var focusMapAds = $(".focus-map-ad");
    //     var result = false;
    //     for(var i=0; i<focusMapAds.length; i++){
    //         if(focusMapAds.eq(i) && focusMapAds.eq(i).hasClass('swiper-slide-active')){
    //             result = true;
    //             return result;
    //         }
    //     }
    //     return result;
    // };
    // 
     MSOHUAD.isSentStatis = function() {
        return MSOHUAD.focusMapAdIndex === mySlide.activeIndex;
    };

// 所有的广告数据
// 第一列是广告类型
// 第二列是广告位id
// 第三列是测试广告位id
// 第四列是max_turn
// 第五列是adps
/**
 * 1: 焦点图
 * 8：通栏广告
 * 3: 信息流  文字
 * 7：图文混排
 */


(function() {
    if (new ImageLazyLoader({
        realSrcAttribute: "original"
    }), !CookieUtil.get("supportwebp")) {
        var a = new Date;
        a.setTime(a.getTime() + 864e5), CookieUtil.set("supportwebp", "1", a), Statistics.addStatistics({
            _once_: "000186",
            webp: 0
        })
    }
})()


var mySlide = new Slide({
    targetSelector: ".topic-info",
    prevSelector: ".topic-info .page-prev",
    nextSelector: ".topic-info .page-next",
    onSlide: function(a) {
        // console.log(a)
        0 === a ? (this.prevEl.children[0].style.opacity = ".5", this.nextEl.children[0].style.opacity = "") : a == this.getLastIndex() ? (this.prevEl.children[0].style.opacity = "", this.nextEl.children[0].style.opacity = ".5") : (this.prevEl.children[0].style.opacity = "", this.nextEl.children[0].style.opacity = ""), window.onresize = function() {
            document.querySelector("#topic-swipe").style.transform = "translate3d(-" + document.body.clientWidth * a + "px, 0px, 0px)";
            for (var b = 0; b < document.querySelectorAll(".topic-item").length; b++) document.querySelectorAll(".topic-item")[b].style.left = document.documentElement.clientWidth * b + "px"
        }
    }
});

var homeAdData = [
    [4, "14420", '12921', 3, '6400320'],  // 车展首页焦点图第四帧广告
    // [4, "14420", '12921', 3, '6400320'],
    // [4, "14420", '12921', 3, '6400320'],
    // [4, "14420", '12921', 3, '6400320'],
    // [4, "14420", '12921', 3, '6400320'],


    [8, "14421", '12922', 2, '6400100'],  //美女看展板块上方通栏
    [8, "14422", "12964", 2, "6400100"],
    // [8, "14423", "12964", 2, "6400100"],
    // [8, "14424", "12964", 2, "6400100"],
    // ["", 12926, '12926', 1, '30000001']
];

var infoFlowObj = [];

//通过MONEY没有&没有newschn

MSOHUAD.homeAdData = homeAdData;
/**
 * entry
 */

if (!isNoADMSohu) {
    init();
}

function init() {

    homeFocusMapAd();
    infoFlowAdSend();
    // homeTopBannerAd();
    //homeBottomBannerAd();

    // 首页广告
    MONEY.indexWin();

    // 视频广告&gif广告
    // MONEY.videoPlayer();

    //下拉
    // MONEY.indexSelect();

    // gif广告
    // MONEY.gif();

    // // h5广告
    MONEY.implantH5();

    // // 新闻版块最后一条文字链广告
    // homeNewsTextAd();

    // // 军事版块最后一条文字链广告
    // homeMilitaryTextAd();

    // // 狐首图文混排广告
    // homeGraphicMixeAd();


    // //头条要闻速递广告统计码的发送
    // adStatisticsSend({
    //                 adData: adHeadlineMapParam,
    //                 adSpaceID: 12415,
    //                 containerObj: document.querySelector('.adbanner .hushoubanner'),
    //                 targetObj: document.querySelector('.adbanner .hushoubanner img')
    //             });


    //通栏广告
    deliverySystemAd();

}

// 狐首焦点图广告
function homeFocusMapAd() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.swiper-container .swiper-slide'));

    if (items.length >= 3) {

        var focusMapAdParam = {
            type: homeAdData[0][0],
            formalApId: homeAdData[0][1],
            testApId: homeAdData[0][2],
            maxTurn: homeAdData[0][3],
            adps: homeAdData[0][4],
            adTemplate: adTemplate.focusMap,
            adDomClassName: adDomClassName.focusMap,
            homeSlide: MSOHUAD.homeSlide,
            homeSlideParam: MSOHUAD.homeSlideParam,
            successCallBack: function(){
                MSOHUAD.adData.homePageFocusMapAd.first = true;

                if (MSOHUAD.adData.homePageFocusMapAd.two) {
                    // MSOHUAD.homeSlide = new Slide(MSOHUAD.homeSlideParam);
                    // $('.tips .page-wrapper').css('visibility', 'visible');
                }

            },
            errorCallBack: function() {
                MSOHUAD.adData.homePageFocusMapAd.first = true;

                if (MSOHUAD.adData.homePageFocusMapAd.two) {
                    // MSOHUAD.homeSlide = new Slide(MSOHUAD.homeSlideParam);
                    // $('.tips .page-wrapper').css('visibility', 'visible');
                }
            }
        };

        renderCarAdAndSendStatis(focusMapAdParam);

    }
}

//狐首信息流板块广告的发送
//重写狐首信息流广告的发送
function infoFlowAdSend() {
    /*
     *第二个值，是请求的基本url；第三个值是广告为ID；第五个值是用来区分信息流各个板块的类名；第六个参数是max_turn；
     **/
    var infoFlowAdData = [
        [3, "14425", '12923', '', 3],  // “车展头条”板块第四条信息流广告
        [3, "14425", '12923', '', 3],
        [3, "14425", '12923', '', 3],
        [3, "14425", '12923', '', 3],
        [3, "14425", '12923', '', 3]
    ];

    infoFlowObj = [
        {
            name:"hudong",
            time:(document.getElementById("hudong").getElementsByClassName("it").length>=10)?2:1
        },

        {
            name:"yaowen",
            time:(document.getElementById("yaowen").getElementsByClassName("it").length>=10)?2:1
        },

        

        {
            name:"china",
            time:(document.getElementById("china").getElementsByClassName("it").length>=10)?2:1
        }
    ];

    var i, len,
        infoFlowAdParam = {};

    for (i = 0, len = infoFlowAdData.length; i < len; i++) {
        infoFlowAdParam = {
            type: infoFlowAdData[i][0],
            formalApId: infoFlowAdData[i][1],
            testApId: infoFlowAdData[i][2],
            adps: 130001,
            maxTurn: infoFlowAdData[i][4],
            adTurnCookieName: 'home_infoflow_ad_turn',
            adTemplate: adTemplate.adInfoFlow,
            adDomClassName: infoFlowAdData[i][3]
        };

        renderCarAdAndSendStatis(infoFlowAdParam);
    }

}


// 狐首头部banner广告
/*
function homeTopBannerAd() {

   var homeTopAdParam = {
        type: homeAdData[2][0],
        formalApId: homeAdData[2][1],
        testApId: homeAdData[2][2],
        maxTurn: homeAdData[2][3],
        adps: homeAdData[2][4],
        adTurnCookieName: 'home_banner_ad_turn',
        adTemplate: adTemplate.homeBannerImgAd,
        adDomClassName: adDomClassName.homeBannerImgAd,
        insterAdDom: function(adDom) {
            var pageBody = document.querySelector('.pageBody'),
                homeNav = document.querySelector('.pageBody .site'),
                indexSelectMoney = document.querySelector('.index-select-money');

            // 区分是否有顶部的下滑图片广告
            if (!!indexSelectMoney) {
                pageBody.insertBefore(adDom ,indexSelectMoney);
            }else{
                pageBody.insertBefore(adDom ,homeNav);
            }
        }
    };

    renderAdAndSendStatis(homeTopAdParam);
}
*/

// 狐首底部banner广告
function homeBottomBannerAd() {

    var homeBottomAdParam = {
            type: homeAdData[16][0],
            formalApId: homeAdData[16][1],
            testApId: homeAdData[16][2],
            maxTurn: homeAdData[16][3],
            adps: homeAdData[16][4],
            adTemplate: adTemplate.homeBannerImgAd,
            adDomClassName: adDomClassName.homeBannerImgAd,
            insterAdDom: function(adDom) {
                var pageBody = document.querySelector('.pageBody'),
                    reTop = document.querySelector('.pageBody .reTop');

                pageBody.insertBefore(adDom, reTop);
            }
        };

    renderAdAndSendStatis(homeBottomAdParam);
}

// 新闻版块最后一条文字链广告
function homeNewsTextAd() {

    var homeNewsTextAdParam = {
        type: homeAdData[17][0],
        formalApId: homeAdData[17][1],
        testApId: homeAdData[17][2],
        maxTurn: homeAdData[17][3],
        adps: homeAdData[17][4],
        adTurnCookieName: 'home_newslast_ad_turn',
        adTemplate: adTemplate.homeNewsTextAd,
        adDomClassName: adDomClassName.homeNewsTextAd
    };

    renderAdAndSendStatis(homeNewsTextAdParam);
}

// 军事版块最后一条文字链广告
function homeMilitaryTextAd() {

    var homeNewsTextAdParam = {
        type: homeAdData[18][0],
        formalApId: homeAdData[18][1],
        testApId: homeAdData[18][2],
        maxTurn: homeAdData[18][3],
        adps: homeAdData[18][4],
        adTurnCookieName: 'home_ad_Military_turn',
        adTemplate: adTemplate.homeNewsTextAd,
        adDomClassName: adDomClassName.homeNewsTextAd
    };

    renderAdAndSendStatis(homeNewsTextAdParam);
}



// 广告投放系统添加的广告
function deliverySystemAd() {
    var i, len, adParam, template, className;

    for ( i = 1; i < homeAdData.length; i++ ) {

        if ( homeAdData[i][4] === '6400100' ) {
            template = adTemplate.homeBannerImgAd;
            className = adDomClassName.homeBannerImgAd;
        }else{
            template = adTemplate.homeBannerTextAd;
            className = adDomClassName.homeBannerTextAd;
        }

        adParam = {
            type: homeAdData[i][0],
            formalApId: homeAdData[i][1],
            testApId: homeAdData[i][2],
            maxTurn: homeAdData[i][3],
            adps: homeAdData[i][4],
            adTurnCookieName: 'home_banner_ad_turn',
            adTemplate: template,
            adDomClassName: className
        };

        renderCarAdAndSendStatis(adParam);
    }
}

function homeGraphicMixeAd() {
    var infoHomeGraphAdData = [
        [7, 14285, '12898', '.adISEntertainments', 2, 'home_entertainmentsAdParam_turn']  // 狐首娱乐版块底部图混广告
    ];

    for(var j = 0; j < infoHomeGraphAdData.length; j++) {
        (function(j){
            var adDataParam = {
                type: infoHomeGraphAdData[j][0],
                formalApId: infoHomeGraphAdData[j][1],
                testApId: infoHomeGraphAdData[j][2],
                maxTurn: infoHomeGraphAdData[j][4],
                adps: '30000001',
                adTurnCookieName: infoHomeGraphAdData[j][5],
                adTemplate: adTemplate.finalPicText,
                adDomClassName: 'graphicMixeCompact ' + adDomClassName.graphicMixe//,
                // insterAdDom: function(adDom) {
                //     var createAdDom = document.querySelector(infoHomeGraphAdData[j][3]).parentNode;
                //     $(adDom).appendTo(createAdDom);
                // }
            };
            renderCarAdAndSendStatis(adDataParam);
        })(j);
    }
}

function renderCarAdAndSendStatis(opts) {
    var isZhiboClick = opts.isClick ? opts.isClick : true;

    if (!opts.type || !opts.formalApId || !opts.adps) {
        return;
    }

    // type, url, adPId, data, adTemplate, className, homeSlide, homeSlideParam
    var handlerData = handleFormalAndTestAdParam(opts),
        type = handlerData.type,
        adType = handlerData.adType,
        url = handlerData.url,
        adPId = handlerData.baseData.itemspaceid,
        data = handlerData.baseData,
        adTemplate = handlerData.adTemplate,
        className = handlerData.className,
        homeSlide = handlerData.homeSlide,
        homeSlideParam = handlerData.homeSlideParam,
        flowIndex = handlerData.flowIndex,
        flowAdIndex = handlerData.flowAdIndex,
        groupAd = handlerData.groupAd,
        focusMapAdIndex = handlerData.focusMapAdIndex || 4,
        handlerAdDom= handlerData.handlerAdDom,
        insertAdDom = handlerData.insertAdDom,
        successCallBack = handlerData.successCallBack,
        insertSuccessCallBack = handlerData.insertSuccessCallBack,
        errorCallBack = handlerData.errorCallBack,
        clickCallBack = handlerData.clickCallBack,
        statisAdValidExposure = handlerData.statisAdValidExposure,
        setContainerDomArr,
        isRequestError = false; // 用来判断是否已经确认请求失败，如果判断请求失败，则又返回数据的情况下，不再执行

    if(isTestEnvironment){
        url = 'http://10.16.10.63/adgtr/?';
        adPId = opts.testApId;
        handlerData.baseData.itemspaceid = opts.testApId;
    }

    if (!!groupAd) {
        setContainerDomArr = groupAd.setContainerDomArr;
    }

    var adDomId = 'beans_' + adPId,
        renderAdTemplate = template.compile(adTemplate);

    // 当是有占位符类型的广告时，如果找不到占位符，就不去请求广告
    if (type === 8 && !document.querySelector('#' + adDomId)) {
        return;
    }

    new Jsonp({
        url: url,
        data: data,
        time : 4000,
        success: function(res) {
            var adData;

            if(data.progid && data.roomid) {
                adData = adDataHandle(res[0], data.turn, data.progid, data.roomid);
            } else {
                adData = adDataHandle(res[0], data.turn);
            }
            var adDom,
                containerDomArr,
                containerDom,
                targetDom;

            if (isRequestError) {
                return;
            }

            // 有广告的情况下，插入广告
            if (!!adData && !!adData.adInfo && !!adData.sendInfo) {
                var adInfo = adData ? {
                    data: adData.adInfo
                } : {
                    data: {}
                };

                var isIframeAd = !!adData.adInfo.iframe;

                // 广告渲染的数据添加一个广告id的参数:adId,用来在模板中进行判断
                adInfo.data.adPId = String(adPId);

                if (isIframeAd && type === 7) {
                    renderAdTemplate = template.compile(MSOHUAD.adTemplate.hasContaineriframeAd);
                    className += " iframe-money";
                } else if (isIframeAd && type === 8) {
                    renderAdTemplate = template.compile(MSOHUAD.adTemplate.noContaineriframeAd);
                    className += " iframe-money";
                }
                // 狐首底部iframe广告特殊样式
                if (isIframeAd &&
                    (Number(adPId) === 13455 || Number(adPId) === 12735)) {
                    className += ' hm-btm-ifm-mny';
                }

                // 插入广告(不同的广告类型有不同的插入方法)
                // 信息流广告
                if (type === 3) { 
                    // var adInfoContainers = ["hudong","yaowen","china"]
                    var adInfoContainer = document.getElementById(infoFlowObj[0].name);
                    // var adInfoContainer = adInfoContainers.shift();
                    var adInfoContainerSize = adInfoContainer.getElementsByClassName("it").length;

                    var infoFlowContainer = document.createElement("div");
                    infoFlowContainer.setAttribute("class","it");
                    infoFlowContainer.setAttribute("id",adDomId);
                    infoFlowContainer.setAttribute("data-msohu-money",true);
                    infoFlowContainer.innerHTML =  '<div class="h4WP">'+
                            '<a href="javascript:;"  data-url='+adInfo.data.url+' class="h4">推广 |'+ adInfo.data.text;+'</a>'+
                        '</div>'

                    adDom = infoFlowContainer;   

                    if(adInfoContainerSize>3&&adInfoContainerSize<10){
                        adInfoContainer.insertBefore(adDom,adInfoContainer.getElementsByClassName("it")[3]);
                        infoFlowObj.shift();
                    }else if(adInfoContainerSize>=10){
                        if(infoFlowObj[0].time==2){
                            adInfoContainer.insertBefore(adDom,adInfoContainer.getElementsByClassName("it")[3]);
                        }else if(infoFlowObj[0].time == 1){
                            adInfoContainer.insertBefore(adDom,adInfoContainer.getElementsByClassName("it")[10]);
                            infoFlowObj.shift(); 
                        }

                    }          
                    // adInfoContainer.insertBefore(adDom,adInfoContainer.getElementsByClassName("it")[3]);
                } else if (type === 7){
                    var graphicMixeList = document.querySelector("#swiper1 .ptlist");
                    var graphicMixeItems = graphicMixeList.querySelectorAll("li");
                    var lastGraphicMixeItem = graphicMixeItems[graphicMixeItems.length - 1];
                    var adMarkElem = document.createElement('em');
                    adMarkElem.innerHTML = "推广";
                    lastGraphicMixeItem.querySelector("a").setAttribute("href", "javascript:;");
                    lastGraphicMixeItem.querySelector("a").setAttribute("data-url", adInfo.data.url);
                    lastGraphicMixeItem.querySelector("a img").setAttribute("src", adInfo.data.image);
                    lastGraphicMixeItem.querySelector("a span").innerHTML = adInfo.data.title;
                    lastGraphicMixeItem.querySelector("a p").innerHTML = adInfo.data.text;
                    lastGraphicMixeItem.appendChild(adMarkElem);
                    lastGraphicMixeItem.setAttribute("data-msohu-money", true);
                    adDom = lastGraphicMixeItem;
                } else if (type === 4) {

                    adDom = document.createElement('li');
                    adDom.id = adDomId;
                    MSOHUAD.Utils.addClass(adDom, 'topic-item');
                    adDom.innerHTML = renderAdTemplate(adInfo);
                    adDom.setAttribute('data-msohu-money', 'true');

                    var focusMapSwipe = document.querySelector(".tips .topic-info .topic-swipe"),
                        focusMapItems = document.querySelectorAll(".tips .topic-info .topic-item"),
                        focusMapPageWrapper = document.querySelector(".tips .topic-info .page-wrapper"),
                        spanDom = document.createElement('span'),
                        focusMapItemsLen = focusMapItems.length;

                    // 焦点图的张数少于要插到位置时，插入到最后
                    if (focusMapItemsLen > 0 && ( focusMapItemsLen < focusMapAdIndex - 1 ) ) {
                        focusMapSwipe.appendChild(adDom);
                        MSOHUAD.focusMapAdIndex = focusMapItemsLen - 1;
                    } else if (focusMapItemsLen >= focusMapAdIndex - 1) {
                        focusMapSwipe.insertBefore(adDom, focusMapItems[focusMapAdIndex]);
                        MSOHUAD.focusMapAdIndex = focusMapAdIndex - 1;
                    }
                    if (focusMapPageWrapper.querySelectorAll('span').length !== 0) {
                        focusMapPageWrapper.appendChild(spanDom);
                    }

                    mySlide.refresh();

                }else if (type === 8) {
                    adDom = document.getElementById(adDomId);
                    //Utils.addClass(adDom, className);
                    adDom.setAttribute('data-msohu-money', 'true'); //通过这个属性来判断点击统计的发送
                    // 当有对广告dom进行操作的方法时，执行这个方法；否则，直接替换广告dom的innerHTML
                    // if (!!handlerAdDom && !isIframeAd) {
                    //     handlerAdDom(adDom , adData);
                    // } else {
                    //     adDom.innerHTML = renderAdTemplate(adInfo);
                    // }
                    adDom.innerHTML = '<a href="javascript:;" data-url="' + adInfo.data.url + '"><img src="' + adInfo.data.image + '"></a>';
                    adDom.style.display = 'block';

                } else if (type === 9 && !!groupAd) { // 处理多个广告需要同时的展示的情况
                    MSOHUAD.adData[groupAd.name].length = groupAd.length;
                    MSOHUAD.adData[groupAd.name].nowLen++;
                    MSOHUAD.adData[groupAd.name][groupAd.index - 1] = {};
                    MSOHUAD.adData[groupAd.name][groupAd.index - 1].adInfo = adInfo.data;
                    MSOHUAD.adData[groupAd.name][groupAd.index - 1].adSendInfo = adData.sendInfo;
                    MSOHUAD.adData[groupAd.name][groupAd.index - 1].adPId = adPId;
                    for (var j = 0, grpAdLen = groupAd.length; j < grpAdLen; j++) {
                        if (!MSOHUAD.adData[groupAd.name][j] || !MSOHUAD.adData[groupAd.name][j].adInfo) {
                            return;
                        }
                    }

                    adDom = Utils.transformHtmlToDom(renderAdTemplate({
                        data: MSOHUAD.adData[groupAd.name]
                    }))[0];
                    Utils.addClass(adDom, className);

                } else if (type === 1) {//焦点图
                    var focusMapAdElems = document.querySelectorAll('.focus-map-ad');
                    for(var i=0; i<=focusMapAdElems.length; i++){
                        if(focusMapAdElems[i]){
                            var focusMapAdMark = document.createElement('em');
                            focusMapAdMark.innerHTML = '广告告';
                            focusMapAdElems[i].querySelector(".focus a").setAttribute("href", "javascript:;");
                            focusMapAdElems[i].querySelector(".focus a").setAttribute("data-url", adInfo.data.url);
                            focusMapAdElems[i].querySelector(".focus a img").setAttribute("src", adInfo.data.image);
                            focusMapAdElems[i].querySelector(".focus a p").innerHTML = adInfo.data.text;
                            focusMapAdElems[i].querySelector(".focus a").appendChild(focusMapAdMark);
                            focusMapAdElems[i].style.display = 'block';
                            focusMapAdElems[i].setAttribute('data-msohu-money', 'true');
                        }

                    }
                    adDom = focusMapAdElems[0];
                    // adDom = document.getElementById(adDomId);
                    // adDom.querySelector(".focus a").setAttribute("href", adInfo.data.url);
                    // adDom.querySelector(".focus a img").setAttribute("src", adInfo.data.image);
                    // adDom.querySelector(".focus a p").innerHTML = adInfo.data.text;
                    // adDom.style.display = 'block';
                    // adDom.setAttribute('data-msohu-money', 'true');

                }

                // adDom.className = className;

                // 新的接口，插入广告dom元素
                if (!!insertAdDom) {
                    insertAdDom(adDom, adData);
                }
                // 新的接口，插入完成后，执行的回调函数
                if (!!insertSuccessCallBack) {
                    insertSuccessCallBack();
                }

                // iframe广告添加监听屏幕翻转的事件
                if (isIframeAd) {
                    var adpsStr = String(data.adps),
                        adWidth = parseInt(adpsStr.substr(0, adpsStr.length - 4), 10),
                        adHeight = parseInt(adpsStr.substr(adpsStr.length - 4), 10);

                    if (!!adDom.querySelector('iframe')) {
                        if(adpsStr === '2920248') {
                            adDom.querySelector('iframe').style.width = 143 + 'px';
                            adDom.querySelector('iframe').style.height = 149 + 'px';
                        } else if(adpsStr === '2160151') {
                            if (/graphicMixeCompact/i.test(adDom.className)) {
                                adDom.querySelector('iframe').style.height = 85 + 'px';
                            } else {
                                adDom.querySelector('iframe').style.height = 101 + 'px';
                            }
                        } else {
                            // adDom.style.height = adHeight * document.documentElement.clientWidth / adWidth + 'px';
                            adDom.querySelector('iframe').style.height = adHeight * adDom.offsetWidth / adWidth + 'px';

                            var orientation = function() {
                                var iframeWH = adDom.getElementsByTagName('iframe')[0];
                                var w = document.documentElement.clientWidth;
                                iframeWH.style.width = w + 'px';
                                iframeWH.style.height = adHeight * w / adWidth + 'px';
                            };

                            if (isiOS && !isSafari) {
                                window.addEventListener('orientationchange', Utils.createOrientationChangeProxy(orientation, this), false);
                                window.addEventListener('resize', Utils.createOrientationChangeProxy(orientation, this), false);
                            } else {
                                window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', Utils.createOrientationChangeProxy(orientation, this), false);
                            }
                        }
                    }

                }

                if (type === 1 || type === 4) {
                    containerDom = adDom;
                    targetDom = adDom;
                    if (type === 4) {
                        MSOHUAD.setFocusMapPicsPosition();
                    }
                } else if (type === 2) {
                    containerDom = adDom.querySelector('.hushoubanner');
                    targetDom = adDom.querySelector('img') || null;
                } else if (type === 3) {
                    containerDom = adDom;
                    targetDom = adDom;
                } else if (type === 9) {
                    setContainerDomArr(adDom);
                } else if (type === 6 || type === 7 || type === 8) {
                    containerDom = adDom;
                    targetDom = adDom;
                }
            } else {
                //没有广告的情况下，删除默认的广告位
                adDom = document.getElementById(adDomId);
                if(type !==1 && type !==3 && type !==7 && adDom) {
                    adDom.parentNode.removeChild(adDom);
                }
                containerDom = null;
                targetDom = null;

                if (type === 9 && !!groupAd) {
                    MSOHUAD.adData[groupAd.name].length = groupAd.length;
                    MSOHUAD.adData[groupAd.name].nowLen++;
                    MSOHUAD.adData[groupAd.name][groupAd.index - 1] = {};
                    MSOHUAD.adData[groupAd.name][groupAd.index - 1].adPId = adPId;
                }
            }
            //发送统计信息
            adParam = adData ? adData.sendInfo : null;

            // 焦点图的情况下，传入判断函数
            if (type === 1 || type === 4) {
                adStatisticsSend({
                    adData: adParam,
                    adSpaceID: adPId,
                    containerObj: containerDom,
                    targetObj: targetDom,
                    targetObjIsWant: true,
                    isSendStatisFn: MSOHUAD.isSentStatis,
                    statisAdValidExposure: statisAdValidExposure
                });
                if(type === 1){
                    (function(adDomId, adParam){
                        $('.swiper-container').on('click', 'a[data-url]', function(e){
                            if(MSOHUAD.setCommonAdStatisSend(adDomId, adParam, this.parentNode.parentNode).triggerClickEvent){
                                MSOHUAD.setCommonAdStatisSend(adDomId, adParam, this.parentNode.parentNode).triggerClickEvent(e);
                            }
                        });                            
                    })(adDomId, adParam);
                }
            } else if (type === 9 && MSOHUAD.adData[groupAd.name].nowLen === MSOHUAD.adData[groupAd.name].length) {
                for (var k = 0, groupAdLen = groupAd.length; k < groupAdLen; k++) {
                    var tempAdParam = MSOHUAD.adData[groupAd.name][k];
                    adStatisticsSend({
                        adData: tempAdParam.adSendInfo,
                        adSpaceID: tempAdParam.adPId,
                        containerObj: tempAdParam.containerDom,
                        targetObj: tempAdParam.targetDom,
                        clickCallBack: clickCallBack,
                        statisAdValidExposure: statisAdValidExposure
                    });
                }

            } else {
                adStatisticsSend({
                    adData: adParam,
                    adSpaceID: adPId,
                    containerObj: containerDom,
                    targetObj: targetDom,
                    clickCallBack: clickCallBack,
                    statisAdValidExposure: statisAdValidExposure
                });
            }

            // 返回广告数据成功后的回调函数
            // 注意和有广告数据插入成功的回调进行区分
            if(!!successCallBack){
                successCallBack();
            }

        },
        error: function() {
            isRequestError = true;

            //没有广告的情况下，删除默认的广告位
            var adDom = document.getElementById(adDomId);

            if (adDom) {
                if (type !== 1) {
                    adDom.parentNode.removeChild(adDom);
                }
            }

            Statistics.addStatistics(Utils.addChannelParam({apid: adDomId, supplyid: 4}), baseUrl + '/count/e?');


            Statistics.addStatistics(Utils.addChannelParam({
                _once_ : '000157_error',
                itemspaceid: adDomId,
                supplyid: 4
            }));

            if (!!errorCallBack) {
                errorCallBack();
            }
        },
        timeout: function() {
            isRequestError = true;

            //没有广告的情况下，删除默认的广告位
            var adDom = document.getElementById(adDomId);

            if (adDom) {
                if (type !== 1) {
                    adDom.parentNode.removeChild(adDom);
                }
            }

            Statistics.addStatistics(Utils.addChannelParam({apid: adDomId, supplyid: 4}), 'http://i.go.sohu.com' + '/count/to?');

            Statistics.addStatistics(Utils.addChannelParam({
                _once_ : '000157_adtimeout',
                itemspaceid: adDomId,
                supplyid: 4
            }));

            if (!!errorCallBack) {
                errorCallBack();
            }
        }
    });
}
