(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var MSOHU = window.MSOHU || (window.MSOHU = {}),
		AD = MSOHU.AD || (MSOHU.AD = {});
		
var CookieUtil = require("./CookieUtil");
	// 常用的工具函数
var utils = {

	// 对url的参数进行对象化
	urlToObj: function(url) {
		if (typeof url !== 'string') {
			return {};
		}

		var paramsStr = url.split('?')[1],
			result = {};

		if (!paramsStr) {
			return {};
		}
		if (paramsStr.length && paramsStr.length === 0) {
			return {};
		}

		var paramsArr = paramsStr.split('&'),
			length = paramsArr.length,
			tempArr = [],
			i;

		for (i = 0; i < length; i++) {
			tempArr = paramsArr[i].split('=');
			result[tempArr[0]] = tempArr[1] || '';
		}

		return result;
	},

	// 把obj转化为url的参数
	objToUrlParams: function(url, params) {
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
	}
};

var adTransCode = '', // 缓存广告trans码
	isGetAdTransCode = false; // 用来判断获取广告trans码的方法是否已经被调用，如果调用，就返回上次的值

var adUtils = {
	/**
	 *对广告物料的引用替换成相对协议
	 *@param {String} imageUrl ：传入的图片资源地址
	 *
	 *@return {String} imageUrl : 处理过的图片资源地址
	 */
	 imageUrlHandle: function(imageUrl){
	 	var newImageUrl = imageUrl;
	 	if(imageUrl.indexOf('http://images.sohu.com') === 0){
	 		newImageUrl = imageUrl.replace(/http:\/\/images.sohu.com/, '//images.sohu.com');
	 	}
	 	return newImageUrl;
	 },

	/**
	 * @desc 判断是否是测试环境
	 * @param {Object} testEnvReg : 测试环境的正则表达式（可选，有默认值）
	*/
    isTestEnvironment: function(testEnvReg) {
        var hostName = window.location.hostname;
        var testEnvReg = testEnvReg || /^([tdg][1-9]\.)m\.sohu\.com$/;
        if(testEnvReg.test(hostName)){
            return true;
        }else{
            return false;
        }
    },

	/**
	 * @desc 判断是否是无广告版本
	 */
	isNoADMSohu : (function() {
		var url = window.location.href,
			result = false;

		if (CookieUtil.get('hide_ad') === '1') {
			result = true;
		}

		if (/_trans_=000018_sogou_sohuicon/.test(url)) {
			result = true;
		}

		if (/t\.wcms\.m\.sohuno\.com/ .test(url)) {
			result = true;
		}

		return result;
	})(),

	/**
	 * @desc 获取广告统计需要添加的trans码
	 * @return {String} result 返回获取到的trans码，没有返回''
	 */
	getAdTransCode: function() {

		// var CookieUtil = window.CookieUtil,

			urlParamObj = utils.urlToObj(window.location.href),
			urlTransCode = urlParamObj['_trans_'] || '',

			isNull = function(param) {
				return Object.prototype.toString.call(param) === '[object Null]';
			};

		return !!CookieUtil ? ( isNull(CookieUtil.get('_trans_')) ?  urlTransCode : CookieUtil.get('_trans_') )  : '';
	}
};


/**
 * public
 * @type {object}
 */
module.exports = adUtils;

AD.utils = adUtils;	

},{"./CookieUtil":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
/**
 * MSOHUAD
 */

var Statistics = require("./statics"),
	template = require("art-template"),
	ExposureStatis = require("./exposure"),
	NewExposureStatis = require("./newexposure"),
	Jsonp =require("./jsonp"),
	ADUtils = require("./ADUtils"),
	CookieUtil = require("./CookieUtil"),
	// vendor = window.vendor,
	baseUrl = 'http://i.go.sohu.com',
	ch_trans = ADUtils.getAdTransCode(),
	userAgent = window.navigator.userAgent,
	isAndroid = /Android/i.test(navigator.userAgent),
	isiOS = userAgent.match(/(iPad|iPhone|iPod)[\w\s]*;(?:[\w\s]+;)*[\w\s]+(?:iPad|iPhone|iPod)?\sOS\s([\d_\.]+)/i),
	isWebkit = /WebKit\/[\d.]+/i.test(userAgent),
	isSafari = isiOS ? (navigator.standalone ? isWebkit : (/Safari/i.test(userAgent) && !/CriOS/i.test(userAgent) && !/MQQBrowser/i.test(userAgent))) : false,
	imageUrlHandle = ADUtils.imageUrlHandle;

	// 狐首全局的广告变量
	var MSOHUAD = {};

	MSOHUAD.focusMapAdIndex = null; // 用来记录焦点图的广告是第几张广告

	// 用来判断是否发送统计的函数，应用于焦点图广告av统计的发送(元素曝光的情况下发送)
	MSOHUAD.isSentStatis = function() {
		var activeIndex;
		if (MSOHUAD.homeSlide) {
			activeIndex = MSOHUAD.homeSlide.activeIndex;
		} else if(MSOHUAD.listSlide){
			activeIndex = MSOHUAD.listSlide.activeIndex;
		}

		return MSOHUAD.focusMapAdIndex === activeIndex;
	};

	// 存储多个地方使用的广告数据
	MSOHUAD.adData = {
		// 汽车频道首页本地车型信息双拼图广告
		carChannelDoublePicAd: [],

		// 狐首焦点图广告(现有两个广告)
		homePageFocusMapAd: {
			first: false,
			two: false
		}
	};
	MSOHUAD.adData.carChannelDoublePicAd.nowLen = 0;

	// 广告的曝光统计对象
	var moneyExposureStatis = MSOHUAD.moneyExposureStatis || ( MSOHUAD.moneyExposureStatis = new NewExposureStatis());

	var Utils = {

		//把一个html字符串转换为dom对象
		transformHtmlToDom: function(htmlStr) {
			if (typeof htmlStr !== 'string') return;

			var tempDom = document.createElement('div'),
				result;

			tempDom.innerHTML = htmlStr;
			result = tempDom.childNodes;
			tempDom = null;

			return result;

		},

		//给元素增加一个className
		addClass: function(element, className) {
			if (!element) return;

			var reg = new RegExp('(?:^|\\s+)' + className +'(?:\\s+|$)');

			if(!reg.test(element.className)){
				element.className = [element.className, className].join(' ');
			}
		},

		//创建横竖屏转换的代理，处理andrior手机的延迟问题
		//learn from zhangdaiping
		createOrientationChangeProxy: function(func, context) {

			return function() {
				clearTimeout(func.orientationChangeTimer);

				var args = Array.prototype.slice.call(arguments, 0),
					navigator = window.navigator,
                    userAgent = navigator.userAgent,
                    isAndroid = /Android/i.test(navigator.userAgent),
                    isiOS = userAgent.match(/(iPad|iPhone|iPod)[\w\s]*;(?:[\w\s]+;)*[\w\s]+(?:iPad|iPhone|iPod)?\sOS\s([\d_\.]+)/i),
                    isQQ = /QBrowser/i.test(userAgent),
                    isXiaoMi = /MI\s\d/i.test(userAgent),
                    isSogou = /Sogou/i.test(userAgent),
                    isLT18I = /LT18i/i.test(userAgent),
                    isWebkit = /WebKit\/[\d.]+/i.test(userAgent),
                    isSafari = isiOS ? (navigator.standalone ? isWebkit : (/Safari/i.test(userAgent) && !/CriOS/i.test(userAgent) && !/MQQBrowser/i.test(userAgent))) : false,

					// 对Android横竖屏抓换时使用延迟，在横竖屏转换时，屏幕高宽并不能立即生效
					// 有的Android少于400ms高宽就能生效，有的就会超过400ms
					// 小米自带浏览器延迟尤其厉害，原因未知
					delay = isAndroid ? ( (isXiaoMi || isLT18I || isSogou) ? 1000 : 400) : ( isiOS && !isSafari ? 400 : 0 );

				func.orientationChangeTimer = setTimeout(function() {
					func.apply(context, args);
				}, delay);

			};
		},

		// 给广告添加频道参数
		addChannelParam:  function(baseData) {
			var hostName = window.location.hostname,
				pathName = window.location.pathname,
				channelPageRegResult = /\/c\/(\d+)/i.exec(pathName),
				finalPageRegResult = /\/n\/(\d+)/i.exec(pathName),
				finalPageChannelData;

			if (!/m\.sohu\.com/.test(hostName)) {
				return baseData;
			}

			if (/^\/$/.test(pathName)) {
				baseData.newschn = '1';
			}

			if (!!channelPageRegResult) {
				baseData.newschn = channelPageRegResult[1];
			}

			if (!!finalPageRegResult && !!window.article_config && !!window.article_config.channel_long_path) {
				finalPageChannelData = window.article_config.channel_long_path;
				baseData.newschn = finalPageChannelData[0][1].split('/')[2];

				if (!!finalPageChannelData[1]) {
					baseData.subchannelid = finalPageChannelData[1][1].split('/')[2];
				}
			}

			return baseData;
		},

		// 给url添加参数
		handlerUrlAndParams: function(url, params) {
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
		},

		// 判断是否是adplus监测，返回不同的参数
		handlerAdplusParam: function(url, apid, impid) {
			if (/imp\.optaim\.com/.test(url)) {
				return {
					apid: apid,
					impid: impid
				};
			} else {
				return {
					_dc_: (+new Date())
				};
			}
		},

		// 对传入的URL链接进行处理，确保所带的参数正确
		handlerUrl: function(url) {
			var result;

			if (url.indexOf('?') === -1) {
				result = url + '?';
				//判断？是否是最后一个字符
			} else if (url.charAt(url.length - 1) === '?') {
				result = url;
			} else {
				result = url + '&';
			}

			return result;
		}
	};
	
	template.helper('getAdLabelText', function(apId) {
		var lableText = '广告',
			isNeedChange = window.ad_config && window.ad_config[apId];

		if(isNeedChange) {
			lableText = "推广";
		}

        return lableText;
    });

	//狐首的广告信息
	//广告的模板
	var adTemplate = {

			// 焦点图广告模板
			focusMap: '<div class="img-l"><a href="javascript:;" data-url="<%=data.url%>">\
                        <img src="<%=data.image%>" alt="<%=data.text%>" border="0" class="topic_img"></a>\
                        <div class="topic-title"><p><%=data.text%></p></div>\
                        <div class="focus_label">广告</div>\
                      </div>',

			// 狐首要闻速递广告模板
			adBanner: '<section class="adbanner">\
                        <div class="hushoubanner">\
                            <img src="<%=data.image%>" alt="<%=data.text%>" >\
                        </div>\
                    </section>',

			// 狐首各个板块信息流广告模板
			adInfoFlow: '<div class="h4WP"><a href="javascript:;" data-url="<%=data.url%>" class="h4"><span class="generalize_label"><%= getAdLabelText(data.adPId)%> | </span><%=data.text%></a></div>',

			// 健康等频道新闻流广告模板
			/*adChannelNewsFlow: '<div class="intro-wrapper">\
									<p class="article-t">\
										<a class="t-words" href="javascript:;" data-url="<%=data.url%>"><%=data.text%></a>\
									</p>\
									<p class="source source-an">\
										<a href="javascript:;" data-url="<%=data.url%>">广告</a>\
									</p>\
								</div>\
								<%if (data.image) {%>\
									<div class="pic">\
								<%} else{%>\
									<div class="pic noAdImage">\
								<%}%>\
									<span class="list-img-wrapper">\
										<a href="javascript:;" data-url="<%=data.url%>">\
											<img class="img-list" src="<%=data.image%>">\
										</a>\
									</span>\
								</div>',*/

			adChannelNewsFlow: '<li class="itNewsFlowMoney">\
									<a href="javascript:;" data-url="<%=data.url%>">\
										<div class="cnt"><h4><%=data.title%></h4><p><%=data.desc%></p></div>\
										<div class="image"><img src="<%=data.image%>" alt="<%=data.title%>"></div>\
										<div class="sign">广告</div>\
									</a>\
								</li>',

			// 热闻和个性频道新闻流广告模板
			adNewsFlow: '\
							<div class="title"><%=data.text%></div>\
							<div class="cnt adNewsFlowAd">\
								<div class="picContainer">\
									<div class="pic">\
										<div class="img">\
											<img src="<%=data.image%>" alt="<%=data.text%>">\
										</div>\
									</div>\
								</div>\
								<div class="des">\
									<div class="brief">\
										<div class="text"><%=data.desc%></div>\
									</div>\
								</div>\
								<div class="opt toSource">广告</div>\
							</div>\
						',

			// 小说项目广告模板
			readAdBookFlow: '<a href="javascript:;" data-url="<%=data.url%>"><img src="<%=data.image%>" alt="<%=data.text%>"></a>',

			// 狐首banner image广告
			homeBannerImgAd: '<div class="home_banner_img"><a href="javascript:;" data-url="<%=data.url%>"><img src="<%=data.image%>" ></a></div>',

			// 频道banner image广告
			channelBannerImgAd: '<div class="channel_banner_img"><a href="javascript:;" data-url="<%=data.url%>"><img src="<%=data.image%>"></a></div>',

			// 正文页banner image广告
			finalBannerTmgAd: '<a href="javascript:;" data-url="<%=data.url%>"><img src="<%=data.image%>" style="max-width:100%;"></a>',

			// 狐首文字链广告
			homeBannerTextAd: '<a href="javascript:;" data-url="<%=data.url%>"><%=data.text%></a>',

			channelInfoFlowTextAd: '<a href="javascript:;" data-url="<%=data.url%>"><span class="generalize_label"><%= getAdLabelText(data.adPId)%> | </span><%=data.text%></a>',

			// iframe广告样式
			noContaineriframeAd: '<iframe style="width:100%; margin:0 auto; vertical-align: top;" frameborder="0" marginwidth="0" marginheight="0" margin="0 auto;" scrolling="no" src="<%=data.iframe%>"></iframe>',

			hasContaineriframeAd: '<div><iframe style="width:100%; margin:0 auto; vertical-align: top;" frameborder="0" marginwidth="0" marginheight="0" margin="0 auto;" scrolling="no" src="<%=data.iframe%>"></iframe></div>',

			// 汽车频道首页本地车型信息流广告
			carChannelLocalMarketInfoFlowAd: '<a href="javascript:;" data-url="<%=data.url%>" class="h4 info-flow-money"><span class="generalize_label">广告 |</span><%=data.text%><i class="i iT iT1"></i></a>',

			// 汽车频道首页本地车型版本双拼图广告
			carChannelDoublePicAd: '<ul class="doublePic">\
										<li data-msohu-money="true"><a href="javascript:;" data-url="<%=data[0].adInfo.url%>"><img alt="<%=data[0].adInfo.text%>" src="<%=data[0].adInfo.image%>"><span class="layer-txt"><%=data[0].adInfo.text%></span></a></li>\
										<li data-msohu-money="true"><a href="javascript:;" data-url="<%=data[1].adInfo.url%>"><img alt="<%=data[1].adInfo.text%>" src="<%=data[1].adInfo.image%>"><span class="layer-txt"><%=data[1].adInfo.text%></span></a></li>\
									</ul>',

			// 首页新闻板块文字链广告
			homeNewsTextAd: '<div class="h4WP"><a href="javascript:;" data-url="<%=data.url%>" class="h4 info-flow-money"><span class="generalize_label"><%= getAdLabelText(data.adPId)%> | </span><%=data.text%><i class="i iT iT1"></i></a></div>',

			topBannerAd: '<div><a href="javascript:;" data-url="<%=data.url%>"><img src="<%=data.image%>" ></a></div>',

			textAd: '<div><a href="javascript:;" data-url="<%=data.url%>"><span class="generalize_label"><%= getAdLabelText(data.adPId)%> | </span><%=data.text%></a></div>',

			hotPoint : '<a href="javascript:;" data-url="<%=data.url%>"><i class="img"><img src="<%=data.image%>" width="143" height="131" /></i><p class="des"><%=data.text%></p></a>',

			finalPicText: '<div>\
							<div class="pictextPhone">\
							<a href="javascript:;" data-url="<%=data.url%>">\
                                <div class="pic"><img src="<%=data.image%>" alt="广告"></div>\
                                <div class="textInfo">\
                                    <p class="text"><%=data.text%></p>\
                                </div>\
								<div class="toSource">\
									<p class="source">广告</p>\
								</div>\
                            </a>\
                            <% if ($data.data.tel) { %>\
                            <a class="tel" href="tel:<%=data.tel%>">拨打电话</a>\
                            <% } %>\
                            </div>\
                           </div>',
            zhiboChannel: '<p class="info-ad"><span class="info-ad-line"></span><span class="info-ad-content"><b><img src="<%=data.image%>"><i></i></b></span></p>',
            elementDom: '<li class="message-wrapper" data-type="ad">\
							<div class="message">\
								<div class="msg-cnt">\
									<div class="compere">\
										<header class="title">\
											<span>搜狐推广：</span>\
										</header>\
										<p class="cnt"><%= data.text %></p>\
									</div>\
									<div class="cnt-module">\
										<div class="figure">\
											<div class="pic">\
												<a class="adImg" href="javascript:;" data-url="<%=data.url%>"><img src="<%=data.image%>"></a>\
											</div>\
										</div>\
									</div>\
								</div>\
								<b></b>\
							</div>\
						</li>',
			adTalkStreamDom:'<li class="message-wrapper left-msg" data-type="talkAd">\
									<div class="message">\
										<div class="msg-publisher">\
											<a href="javascript:;" class="avatar" style="background-image: url(http://s7.rr.itc.cn/org/wapChange/20141_30_14/b9koeg66314926520.jpg)">\
											<img src="http://s7.rr.itc.cn/org/wapChange/20141_30_14/b9koeg66314926520.jpg" alt="">\
											</a>\
										</div>\
										<div class="msg-cnt-wrapper">\
											<div class="talk-msg-item">\
												<div class="msg-cnt">\
													<div class="compere">\
														<div class="compere">\
															<header class="title">\
																<span>搜狐推广：</span>\
															</header>\
															<p class="cnt"><%= data.text %></p>\
														</div>\
														<div class="cnt-module">\
															<div class="figure">\
																<div class="pic">\
																	<a class="adImg" href="javascript:;" data-url="<%=data.url%>"><img src="<%=data.image%>"></a>\
																</div>\
															</div>\
														</div>\
													</div>\
												</div>\
											</div>\
										</div>\
									</div>\
								</li>'
		},

		adDomClassName = {
			focusMap: 'topic-item',
			adBanner: 'adbanner',
			adInfoFlow: 'it',
			adChannelNewsFlow: 'itNewsFlowMoney',
			adNewsFlow: 'feed feed_full feed_money',
			readAdBookFlow: 'picMoney',
			homeBannerImgAd: 'home_banner_img',
			homeBannerTextAd: 'home_banner_text',
			channelBannerImgAd: 'channel_banner_img',
			finalBannerTmgAd: 'channel_banner_img',
			carChannelDoublePicAd: '',
			iframeAd: '',
			homeNewsTextAd: '',
			topBannerAd: 'topBannerAd',
			graphicMixe: 'graphicMixe'
		};

	/**
	 * 提取广告统计的通用发送方法
	 * 别的地方同样可以调用
	 * @param {Number} adId 广告位id
	 * @param {Object} adData 广告的数据
	 * @param {Object} 广告的dom对象
	 * @param {Function} clickCallBack 点击广告时的回调函数(不是必须的参数)
	 *
	 * @return {Object} 这个广告的各种统计的发送方法
	 */
	function setCommonAdStatisSend( adId, adData, adDom, clickCallBack ) {

		var clkmUrl, //用来记录第三方统计点击链接
			apID = 'beans_' + adId,
			isClicked = false, // 用来判断是否点击过广告
			// baseUrl = 'http://10.16.10.63'; //临时测试的
			baseUrl = 'http://i.go.sohu.com',
			emptyFun = function() {};

		// 空广告
		if (!adData || !adDom) {
			return {
				sendPVStatis : function() {
					Statistics.addStatistics(Utils.addChannelParam({
						aid: '', apid: apID, impid: '', at: '', mkey: '', latcy: '', freq: '', turn: '', ipos: '', pgid: '', ax: '', ay: '', cx: '',
						cy: '', ed: '', ext: '', ref: '', rsln: '', sf: '', jsv: '', r: '', supplyid: 4, ch_trans: ch_trans }), baseUrl + '/count/v?');
				},
				sendAVStatis: emptyFun,
				addClickStatis: emptyFun
			};
		}

		adData.apid = apID;
		adData.ax = adDom.offsetLeft;
		adData.ay = adDom.offsetTop;
		adData.rsln = window.screen.width + '*' + window.screen.height;
		adData.sf = false;
		adData.jsv = window['passion_config'] && window['passion_config']['VERSION'] || '06301130';
		adData.r = (Math.random() + '').substring(2, 15);

		adData = Utils.addChannelParam(adData);

		// 给iframe类型广告添加统计点击参数
		if(!!adDom.querySelector('iframe') ){
			var iframeDom = adDom.querySelector('iframe'),
				iframeHref = iframeDom.getAttribute('src'),
				tempUrl = Utils.handlerUrlAndParams(baseUrl + '/count/c?', adData);

			iframeDom.setAttribute('src', Utils.handlerUrlAndParams(iframeHref, {
				clkm: encodeURIComponent(tempUrl)
			}) );
		}

		function sendPVStatis() {
			if (adData.hasOwnProperty('imp')) {
				//增加对adplus监测的兼容
				//第三方统计参数可能有多个
				if (typeof adData.imp === 'string') {
					Statistics.addStatistics(Utils.handlerAdplusParam(adData.imp, adData.apid, adData.impid), Utils.handlerUrl(adData.imp));
				} else if (typeof adData.imp === 'object' && toString.apply(adData.imp) === '[object Array]') {
					for (var i = 0, len = adData.imp.length; i < len; i++) {
						Statistics.addStatistics(Utils.handlerAdplusParam(adData.imp[i], adData.apid, adData.impid), Utils.handlerUrl(adData.imp[i]));
					}
				}

				delete adData.imp;
			}
			if (adData.hasOwnProperty('clkm')) {
				clkmUrl = adData.clkm;
				delete adData.clkm;
			}

			Statistics.addStatistics(adData, baseUrl + '/count/v?');
        }

        function sendAVStatis() {
			Statistics.addStatistics(adData, baseUrl + '/count/av?');
        }

        function addClickStatis() {
			if(!adDom){
				return;
			}

			adDom.addEventListener('click', triggerClickEvent, false);
        }

        // 把触发事件抽离出来，是为了适用于图库，因为图库的滑动图片拦截了click事件
        // 而用本身的touch事件来模拟click事件
        function triggerClickEvent(e){
			if(e.target.className === 'tel') {
						Statistics.addStatistics(adData, baseUrl + '/count/tel?');
						Statistics.addStatistics(adData, baseUrl + '/count/c?');
						return;
			} else if ((e.currentTarget === adDom) || (adDom.hasAttribute('data-msohu-money'))) {
					if (isClicked) {
						return;
					} else {
						isClicked = true;
						// 2000ms之后，重新记录点击统计
						setTimeout(function() {
							isClicked = false;
						}, 2000);
					}

					var url;
					e.preventDefault();
					adData.cx = e.offsetX;
					adData.cy = e.offsetY;
					// 添加一个随机数，防止出现缓存,使得发送不成功
					adData.rdm = Math.random().toString().substring(2, 15);

					// Statistics.addStatistics(adData, baseUrl + '/count/c?');
					if (clkmUrl) {
						// 第三方统计参数可能有多个
						if (typeof clkmUrl === 'string') {
							Statistics.addStatistics(Utils.handlerAdplusParam(clkmUrl, adData.apid, adData.impid), Utils.handlerUrl(clkmUrl));
						} else if (typeof clkmUrl === 'object' && toString.apply(clkmUrl) === '[object Array]') {
							for (var i = 0, len = clkmUrl.length; i < len; i++) {
								Statistics.addStatistics(Utils.handlerAdplusParam(clkmUrl[i], adData.apid, adData.impid), Utils.handlerUrl(clkmUrl[i]));
							}
						}
					}

					if (!!clickCallBack) {
						clickCallBack();
					}

					if (adDom.tagName === 'IMG') {
						url = adDom.parentNode.getAttribute('href');
					} else if (adDom.tagName === 'A') {
						url = adDom.getAttribute('data-url');
					} else if (adDom.hasAttribute('data-msohu-money')) { // it频道新闻流广告
						url = adDom.querySelector('a').getAttribute('data-url');
					}

					// var newUrl = 'http://10.16.34.179';
					new Jsonp({
						url: baseUrl + '/count/c?',
						data: adData,
						time: 4000,
						success: function(rs) {
							if (rs.STATUS !== 'OK') {
								Statistics.addStatistics(adData, baseUrl + '/count/c?');
							}
							// 仍然延迟300ms跳转，否则第三方的点击统计可能没有发送成功
							var delayJumpTimer = setTimeout(function() {
								delayJumpTimer = null;
								window.location.href = url;
							}, 300);
						},
						error: function() {
							Statistics.addStatistics(adData, baseUrl + '/count/c?');
							var delayJumpTimer = setTimeout(function() {
								delayJumpTimer = null;
								window.location.href = url;
							}, 300);

						}
					});
				}
        }

        return {
            sendPVStatis: sendPVStatis,
            sendAVStatis: sendAVStatis,
            addClickStatis: addClickStatis,
            triggerClickEvent: triggerClickEvent
        };
	}

	/**
	 * @desc 发送广告统计信息
	 *
	 * options {
	 *		adData: @param {Object}  // 后端传递的广告参数
	 *		adSpaceID: @param {Number}  // 广告位ID
	 *		containerObj: @param {Object}  // 放广告容器的DOM对象
	 *		targetObj: @param {Object} : 广告DOM对象
	 *		targetObjIsWant: @param {Boolean} // 用来判断广告DOM对象是否是所需要的，默认情况下,不需要传入这个参数。
	 *									// 默置为true,只有在一些特殊情况下，图片广告DOM对象存在，但并不是我们所需要的情况下，传入false
	 *		isSentStatisFn: @param {Function} // 用来判断是否发送统计的函数，应用于av统计的发送(元素曝光的情况下发送),
	 *		clickCallBack: @param {Function}  // 点击广告事件发生后的回调函数
	 * }
	 *
	 */
	function adStatisticsSend(options) {

		var adData = options.adData,
			adSpaceID = options.adSpaceID,
			containerObj = options.containerObj,
			targetObj = options.targetObj,
			targetObjIsWant = options.targetObjIsWant,
			isSendStatisFn = options.isSendStatisFn,
			clickCallBack = options.clickCallBack,
			statisAdValidExposure = options.statisAdValidExposure;

		if (targetObjIsWant === undefined) {
			targetObjIsWant = true;
		}

		var adDomSendStatisObj = setCommonAdStatisSend(adSpaceID, adData, containerObj);

		// pv统计发送
		adDomSendStatisObj.sendPVStatis();

		// av统计发送
		if (moneyExposureStatis) {

			var exposureCallback;

			if (!!statisAdValidExposure) {
				exposureCallback = function() {
					adDomSendStatisObj.sendAVStatis();
					statisAdValidExposure.firstExposureCallback();
					adValidExposureStatis(containerObj, isSendStatisFn, statisAdValidExposure.secondExposureCallback);
				};
			} else {
				exposureCallback = adDomSendStatisObj.sendAVStatis;
			}

			moneyExposureStatis.add({
				dom : containerObj,
				callback: exposureCallback,
				otherJudgeMethod: isSendStatisFn
			})
			.once();
		} else {
			adDomSendStatisObj.sendAVStatis();
		}

		// 点击统计添加
		adDomSendStatisObj.addClickStatis();
	}


	/**
	 *  @desc 统计某个广告的有效曝光
	 *  @param {Object} adDom 判断是否曝光的dom对象
	 *  @param {Function} callback 曝光后执行的回调方法
	 *
	 */
	function adValidExposureStatis( adDom, otherJudgeMethod, callback ) {

		var time = 1000,
			adValidExposureTimer = null;

		adValidExposureTimer = setTimeout(function(){
			adValidExposureTimer = null;

			if ( moneyExposureStatis.isExposure(adDom, 0, otherJudgeMethod) && !!callback ) {
				callback();
			}

		}, time);

	}


	/**
	 *对请求返回的数据进行处理
	 *@param {Object} data ：传入的数据(服务端返回的参数)
	 *@param {Number} turn : 传入的turn值(请求链接中所带的参数)
	 *@param {Number} progid : 传入频道号 (直播项目专用的，可以不传)
	 *@param {Number} roomid : 传入房间号 (直播项目专用的，可以不传)
	 *
	 *@return {Object} result :处理过的数据
	 */
	function adDataHandle(data, turn, progid, roomid) {
		if (!data || !data.resource){
			return {
				adInfo: null,
				sendInfo: null
			};
		}

		//处理imp、clkm参数多个第三方的情况
		var splitData = function(data) {
			return data.split('|');
		};

		// 兼容第三方统计的imp和clkm的多种形式
		var initImp = data.resource.imp,
			initClkm = data.resource.clkm,
			impData, clkmData;

		if (toString.call(initImp) === '[object Array]') {
			impData = initImp;
		} else if (/^\[(.+?)\]$/.test(initImp)) {
			impData = JSON.parse(initImp);
		} else {
			impData = !!initImp ? splitData(initImp) : [];
		}

		if (toString.call(initClkm) === '[object Array]') {
			clkmData = initClkm;
		} else if (/^\[(.+?)\]$/.test(initClkm)) {
			clkmData = JSON.parse(initClkm);
		} else {
			clkmData = !!initClkm ? splitData(initClkm) : [];
		}

		// 过滤第三方统计不合法的链接
		var i, j,
			impDataLen = impData.length,
			clkmDataLen = clkmData.length,
			tempImpData = [],
			tempClkmData = [];

		for (i = 0; i < impDataLen; i++) {
			if (/^http:\/\//.test(impData[i]) || /^https:\/\//.test(impData[i])) {
				tempImpData.push(impData[i]);
			}
		}

		for (j = 0; j < clkmDataLen; j++) {
			if (/^http:\/\//.test(clkmData[j]) || /^https:\/\//.test(clkmData[j])) {
				tempClkmData.push(clkmData[j]);
			}
		}

		impData = tempImpData;
		clkmData = tempClkmData;

		//广告的信息
		var adInfo = {};

		//这是焦点图的广告信息，信息流的可能不同
		if (data.resource.type === 'image') {
			if(data.form === 'pictxtphone') {
				adInfo.tel = data.resource1.text;
			}
			adInfo.image = imageUrlHandle(data.resource.file);
			adInfo.url = data.resource.click;
			adInfo.text = data.resource.text;
			adInfo.width = data.resource.width;
			adInfo.height = data.resource.height;
			adInfo.progid = progid ? progid : '';
			adInfo.roomid = roomid ? roomid : '';

			if (data.resource1 && data.resource1.type === 'text') {
				adInfo.text = data.resource1.text;
			}

		} else if (data.resource.type === 'text') { // 信息流的广告信息
			adInfo.image = '';
			adInfo.url = data.resource.click;
			adInfo.text = data.resource.text;
		} else if (data.resource.type === 'iframe') {
			adInfo.image = '';
			adInfo.url = data.resource.click;
			adInfo.iframe = data.resource.file;
		}

		// 带简介的it频道新闻流广告
		if (!!data.resource2) {
			adInfo.image = imageUrlHandle(data.resource.file);
			adInfo.url = data.resource.click;
			adInfo.title = data.resource2.text;
			adInfo.desc = data.resource1.text;
		}

		if (!!data.special && !!data.special.dict) {
			adInfo.url = data.resource.click;
			if (!!data.special.dict.picture) {
				adInfo.image = imageUrlHandle(data[data.special.dict.picture].file);
			}
			if (!!data.special.dict.txt) {
				adInfo.text = data[data.special.dict.txt].text;
			}
			if (!!data.special.dict.title) {
				adInfo.title = data[data.special.dict.title].text;
			}
			if (!!data.special.dict.summary) {
				adInfo.desc = data[data.special.dict.summary].text;
			}
			if (!!data.special.dict.video) {
				adInfo.video = data[data.special.dict.video].file;
			}
			if (!!data.special.dict.phone) {
				adInfo.tel = data[data.special.dict.phone].text;
			}
		}

		// clkm是iframe广告的点击统计
		if (!!data.resource.clkm && data.resource.type === 'iframe') {
			adInfo.url += (/\?/.test(adInfo.url) ? '&' : '?') + 'clkm=' + data.resource.clkm;
			adInfo.iframe += (/\?/.test(adInfo.iframe) ? '&' : '?') + 'clkm=' + data.resource.clkm;
		}

		// 兼容广告链接可能是https协议的情况
		if (/^https:\/\//.test(adInfo.url)) {
			adInfo.url = adInfo.url;
		} else if (!/^http:\/\//.test(adInfo.url) && !/^https:\/\//.test(adInfo.url)) {
			adInfo.url = 'http://' + adInfo.url;
		}

		//发送的广告统计数据
		var sendInfo = {
			pgid: 'pgid' + new Date().getTime(),
			clkm: clkmData,
			ed: data.ed || '',
			supplyid: 4,
			at: data.adtype || '',
			freq: data.freq || '',
			impid: data.impression_id || '',
			ipos: 1,
			mkey: data.monitorkey || '',
			c: data.c || '',
			e: data.e || '',
			imp: impData,
			turn: turn || 1,
			ext: data.ext || '',
			aid: data.adid || '',
			bucket: data.bucket || '',
			ch_trans: ch_trans,
			extend: data.extend
		};

		return {
			adInfo: adInfo,
			sendInfo: sendInfo
		};
	}

	/**
	 * 重构后的广告渲染和投放的参数
	 * 处理插入和渲染广告的参数(区分测试环境和正式环境)
	 * 传入的参数是一个对象，属性有：(没有的属性，或者没有变化的属性可以不用添加)
	 * {
	 *	type: 1，// 渲染和请求的是那种广告类型 现在有几种：1.焦点图 2.狐首要闻速递 3.狐首各个频道信息流 4.健康等频道焦点图 5.健康等频道新闻流
	 *				6.热闻和个性的新闻流广告 7.没有占位符的广告 8.有占位符的广告 9.多个联动显示的广告
	 *	adQuestUrl: '', //可能的其他广告请求地址(一般情况下不需要修改)
	 *	formalApId: 123456, // 正式的广告为ID
	 *	testApId: 456789, // 测试的广告为ID
	 *	maxTurn: 2,	// 广告的最大轮换数
	 *	adps: 160001, // 广告位的尺寸
	 *	adsrc: 13, // 广告来源。参数值13。意味着广告来自于精准系统和RTB业务(一般情况下不需要修改)
	 *	apt: 4, // 参数值为4，标识该广告位的请求来自手机搜狐网(一般情况下不需要修改)
	 *	adTurnCookieName: '', // 存储广告轮换数的cookie名称
	 *	adTemplate: '', // 广告DOM模板
	 *	adDomClassName: '', // 广告DOM模板的className(type===3时，className是用来区分每个频道板块的，并不是广告DOM模板的className)
	 *	homeSlide: '', // 焦点图滑动组件对象(当type !== 1时，不需要这个参数)
	 *	homeSlideParam: '' // 焦点图滑动组件参数对象(当type !== 1时，不需要这个参数)
	 *	groupAd: {  // 当多个广告需要同时展示的情况下，传入的参数
	 *				index: 1, // 当前广告在这一组广告中的位置
	 *				name:  '', // 存储着一组广告数据的属性名称
	 *				length: 5, // 当前这组广告的个数
	 *				setContainerDomArr: @{function} // 获取这一组广告的containerDom的函数
	 *			},
	 *  focusMapAdIndex: {Number} 焦点图广告所在的帧数
	 *  handlerAdDom: @{function} // 当已经有占位的广告元素时，不替换广告dom的模板，而是对广告dom的进行操作
	 *	insertAdDom: @{function}  ,// 把插入广告的方法当做参数传入
	 *  insertSuccessCallBack: @{function},  //广告插入成功后执行的回调函数
	 *
	 *  successCallBack: @{Function}, // 返回广告数据成功后的回调函数
	 *
	 *	errorCallBack: @{Function}, // 广告请求失败后执行的回调函数
	 *
	 *  statisAdValidExposure: @{Object} // 是否统计广告的有效曝光
	 *	{
	 *		firstExposureCallback: {Function}, // 首次统计曝光的回调函数
	 *		secondExposureCallback: {Function} // 第二次统计曝光的回调函数
	 *	}
	 * }
	 */
	function renderAdAndSendStatis(opts) {
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
					if (type === 3) { //临时用className来插入广告
						var tempDom = !!document.querySelector(className) ? document.querySelector(className).parentNode.querySelectorAll('.ls .it') : [];
						adDom = tempDom[3] || document.createElement('div');
						var newDom = Utils.transformHtmlToDom(renderAdTemplate(adInfo))[0]; //需要插入的dom元素
						adDom.id = adDomId;
						adDom.appendChild(newDom);
						adDom.style.display = 'block';
						adDom.style.overflow = 'hidden';
						adDom.style.height = '43px';
						Utils.addClass(adDom.childNodes[0], 'infoFlowAnimate');
						Utils.addClass(adDom.childNodes[1], 'infoFlowAnimate');
						if(!!adDom.childNodes[1]){
							adDom.childNodes[1].setAttribute('data-msohu-money', 'true');
						}
					} else if (type === 4) {
						adDom = document.createElement('li');
						adDom.id = adDomId;
						Utils.addClass(adDom, 'topic-item');
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

					} else if (type === 6) { // 热闻和个性的新闻流广告
						adDom = document.createElement('a');
						adDom.id = adDomId;
						Utils.addClass(adDom, className);
						adDom.href = "javascript:;";
						adDom.setAttribute('data-url', adInfo.data.url);
						adDom.setAttribute('data-msohu-money', 'true'); //通过这个属性来判断点击统计的发送
						adDom.innerHTML = renderAdTemplate(adInfo);

						var nowNewsFlow = document.querySelectorAll("a[data-flow-index='"+ flowIndex +"']"),
							nowNewsFlowAd = nowNewsFlow[flowAdIndex - 1],
							newsFlow = document.querySelector('.stream-container .stream');

						if (!!nowNewsFlowAd) {
							newsFlow.insertBefore(adDom, nowNewsFlowAd);
						}
					} else if (type === 7) {
						adDom = Utils.transformHtmlToDom(renderAdTemplate(adInfo))[0];
						adDom.id = adDomId;
						Utils.addClass(adDom, className);
						adDom.setAttribute('data-msohu-money', 'true');
						if(!isZhiboClick) {
							adDom.removeAttribute('data-msohu-money');
						}

						// TODO 这点代码是和业务相关的
						// 需要德帅把它抽出来，写到业务代码中
						var nowNewsFlow = document.querySelectorAll("li[data-flow-index='" + flowIndex + "']"),
							nowNewsFlowAd = nowNewsFlow[flowAdIndex - 1],
							newsFlow = document.querySelector('.it .content ul'),
							isItChannelList = window.news_config ? window.news_config.channel_en_name : 'health',
							isZhibo = window.CONFIGS && window.CONFIGS.roomId ? true : false;

						if( isItChannelList && !isZhibo ) {
							newsFlow = document.querySelector('.content ul');
						}

						if (!!nowNewsFlowAd) {
							newsFlow.insertBefore(adDom, nowNewsFlowAd);
						}

					} else if (type === 8) {
						adDom = document.getElementById(adDomId) || document.createElement('div');
						Utils.addClass(adDom, className);
						adDom.setAttribute('data-msohu-money', 'true'); //通过这个属性来判断点击统计的发送
						// 当有对广告dom进行操作的方法时，执行这个方法；否则，直接替换广告dom的innerHTML
						if (!!handlerAdDom && !isIframeAd) {
							handlerAdDom(adDom , adData);
						} else {
							adDom.innerHTML = renderAdTemplate(adInfo);
						}
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

					} else if (type === 1) {
						adDom = document.getElementById(adDomId) || document.createElement('li');
						adDom.innerHTML = renderAdTemplate(adInfo);
						adDom.style.display = 'block';
						adDom.setAttribute('data-msohu-money', 'true');

						// 焦点图广告，获取广告所在的位置(index)
						if (type === 1) {
							var adDomParent = adDom.parentNode,
								adDomBrotherArr = adDomParent.children,
								len = adDomBrotherArr.length,
								i;

							for (i = 0; i < len; i++) {
								if (adDom === adDomBrotherArr[i]) {
									MSOHUAD.focusMapAdIndex = i;
									break;
								}
							}
						}

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
							setFocusMapPicsPosition();
						}
					} else if (type === 2) {
						containerDom = adDom.querySelector('.hushoubanner');
						targetDom = adDom.querySelector('img') || null;
					} else if (type === 3) {
						containerDom = adDom.childNodes[1];
						targetDom = adDom.childNodes[1];
					} else if (type === 9) {
						setContainerDomArr(adDom);
					} else if (type === 6 || type === 7 || type === 8) {
						containerDom = adDom;
						targetDom = adDom;
					}
				} else {
					//没有广告的情况下，删除默认的广告位
					adDom = document.getElementById(adDomId);
					if(type !==1 && adDom) {
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

	/**
	 * 处理插入和渲染广告的参数(区分测试环境和正式环境)
	 * 传入的参数是一个对象，属性有：(没有的属性，或者没有变化的属性可以不用添加)
	 * {
	 *	type: 1，渲染和请求的是那种广告类型
	 *	adQuestUrl: '',
	 *	formalApId: 123456,
	 *	testApId: 456789,
	 *	maxTurn: 2,
	 *	adps: 160001,
	 *	adTurnCookieName: '',
	 *	adTemplate: '',
	 *	adDomClassName: '',
	 *	homeSlide: '',
	 *	homeSlideParam: ''
	 * }
	 */
	function handleFormalAndTestAdParam(opts) {

		var hostName = window.location.hostname,
			formalBaseAdQuestUrl = 'http://s.go.sohu.com/adgtr/?',
			testBaseAdQuestUrl = 'http://10.16.10.63/adgtr/?',
			// testBaseAdQuestUrl = 'http://t.adrd.sohuno.com/adgtr/?',
			isTestEnvironment = false,
			result = {},
			adTurnName = '';

		var baseData = {
				itemspaceid: opts.formalApId || '111111',
				adps: opts.adps || '160001',
				adsrc: opts.adsrc || 13,
				apt: opts.apt || 4,
				turn: opts.maxTurn || 1
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
			},

			// 重新生成callback参数的值，防止所有的jsonp请求callback名称相同，出现冲突问题
			getRandomCallback = function() {
				return 'callback=sohu_moblie_callback1383228627964854' + Math.random().toString().substring(2, 15);
			},

			// 随机生成turn值
			getTurnNum = function(max_turn, adTurnCookieName) {
				var maxTurn = 60,
					expires = new Date(),
					turn,
					newTurn,
					result;

				expires.setTime(expires.getTime() + 10 * 365 * 24 * 60 * 60 * 1000);

				turn = parseInt((CookieUtil.get(adTurnCookieName) || parseInt(Math.random() * maxTurn + 1, 10)), 10);
				newTurn = newTurn > maxTurn ? 1 : turn + 1;
				CookieUtil.set(adTurnCookieName, newTurn, expires);
				result = max_turn ? ((newTurn - 1) % max_turn + 1) : newTurn;

				return result;
			},

			// 把turn值存在localStore中，防止cookie中种入太多的cookie
			newGetTurnNum = function(max_turn, adTurnName){
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
			},

			// 给基本数据添加turn属性,返回加过turn属性的对象
			addTurnParam = function(max_turn, adTurnName) {
				var result = baseData;

				result.turn = newGetTurnNum(max_turn, adTurnName);

				return result;
			};

		// 判断是正式环境还是测试环境
		if (/^([tdg][1-9]\.)m\.sohu\.com$/.test(hostName)) {
			isTestEnvironment = true;
		}
		if(/^([t][1-9]\.)zhibo\.m\.sohu\.com$/.test(hostName)) {
			isTestEnvironment = true;
		}

		// 测试环境(且测试的广告位id存在)添加bucketid参数
		if (isTestEnvironment && !!opts.testApId) {
			result.baseUrl = testBaseAdQuestUrl;
			baseData.itemspaceid = opts.testApId;
			baseData.bucketid = 2;

			// 把占位符dom的id属性的正式id改为测试id
			if (opts.type === 8 || opts.type === 1) {
				var formalAdDom = document.querySelector('#beans_' + opts.formalApId);
				if (!!formalAdDom) {
					formalAdDom.id = 'beans_' + opts.testApId;
				}
			}
		} else {
			result.baseUrl = formalBaseAdQuestUrl;
		}

		// 对根据ip对不同地域投放广告，添加一个参数
		if (!!opts.debugloc) {
			baseData.debugloc = opts.debugloc;
		}

		if(!!opts.zhibo) {
			baseData.progid = opts.progid;
			baseData.roomid = opts.roomid;
		}

		// maxTurn >= 2时，获取turn值,在cookie中种轮播数
		if (opts.maxTurn >= 2) {
			adTurnName = !!opts.adTurnCookieName ? opts.adTurnCookieName : 'beans_' + baseData.itemspaceid + '_turn';
			baseData = addTurnParam(opts.maxTurn, adTurnName);
		}

		baseData = Utils.addChannelParam(baseData);

		result.baseData = baseData;
		result.type = opts.type;
		result.adTemplate = opts.adTemplate;
		result.className = opts.adDomClassName || '';
		result.homeSlide = opts.homeSlide;
		result.homeSlideParam = opts.homeSlideParam;
		result.focusMapAdIndex = opts.focusMapAdIndex;
		result.groupAd = opts.groupAd;
		result.handlerAdDom = opts.handlerAdDom;
		result.insertAdDom = opts.insterAdDom;

		result.successCallBack = opts.successCallBack;

		result.insertSuccessCallBack = opts.insertSuccessCallBack;
		result.errorCallBack = opts.errorCallBack;
		result.clickCallBack = opts.clickCallBack;
		result.adType = opts.adType;
		result.flowIndex = opts.flowIndex;
		result.flowAdIndex = opts.flowAdIndex;
		result.statisAdValidExposure = opts.statisAdValidExposure;


		result.url = result.baseUrl + getRandomCallback();

		return result;
	}

	// 设置焦点图每一帧图片的位置
	function setFocusMapPicsPosition() {
		if (document.querySelector('.topic-info')) {
			var i,
				clientWidth = document.documentElement.clientWidth,
				items = document.querySelectorAll(".topic-item"),
				len = items.length;

			for (i = 0; i < len; i++) {
				items[i].style.left = clientWidth * i + "px";
			}
		}
	}

	MSOHUAD.adStatisticsSend = adStatisticsSend;
	MSOHUAD.renderAdAndSendStatis = renderAdAndSendStatis;
	MSOHUAD.setCommonAdStatisSend = setCommonAdStatisSend;
	MSOHUAD.handleFormalAndTestAdParam = handleFormalAndTestAdParam;
	MSOHUAD.adDataHandle = adDataHandle;

	MSOHUAD.adTemplate = adTemplate;
	MSOHUAD.Utils = Utils;
	MSOHUAD.adDomClassName = adDomClassName;

	module.exports = window.MSOHUAD =  MSOHUAD;

	//TODO 暂时这样写，兼容频道页的代码
	//以后，会绑定到一个全局变量上
	window.adStatisticsSend = adStatisticsSend;
	window.renderAdAndSendStatis = renderAdAndSendStatis;
	window.adTemplate = adTemplate;
	window.adDomClassName = adDomClassName;
},{"./ADUtils":1,"./CookieUtil":2,"./exposure":6,"./jsonp":8,"./newexposure":9,"./statics":10,"art-template":14}],4:[function(require,module,exports){
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
        //if just get  
        //don not excute set.
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
            var indexWinNode = document.querySelector("#beans_"+itemspaceid);
            //第一次为null
            //第二次展示下拉广告
            if (isFirstShowToday('indexWin_' + itemspaceid, true)) {
                
                indexWinNode.parentNode.removeChild(indexWinNode);
                this.indexSelect();
                return;
            }

            new Jsonp({
                url: getAdRequestBaseUrl(baseAdParam) + '&turn=' + turn,
                time : timeout,
                success : function(data) {
                    /**
                     * if indexwin no ad,
                     * show indexSelect ad
                     */
                    data = data[0];
                    if (!data || !data.resource || !data.resource1) {
                        sendStatisCodeAlways({
                            itemspaceid: itemspaceid//,
                            // newschn : newschn,
                            // subchannelid : subchannelid
                        });
                         indexWinNode.parentNode.removeChild(indexWinNode);
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

            var indexSelectNode = document.querySelector("#beans_"+itemspaceid);
            if (isFirstShowToday('indexSelect_' + itemspaceid, true)) {
                // console.log()
                indexSelectNode.parentNode.removeChild(indexSelectNode);
                return;
            }

            new Jsonp({
                url: getAdRequestBaseUrl(baseAdParam) + '&turn=' + turn,
                time : timeout,
                success : function(data) {
                    data = data[0];
                    if (!data || !data.resource || !data.resource1) {
                        indexSelectNode.parentNode.removeChild(indexSelectNode);
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


},{"./ADUtils":1,"./CookieUtil":2,"./MSOHUAD":3,"./config":5,"./jsonp":8,"./statics":10,"./supporter":11}],5:[function(require,module,exports){
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
},{"./CookieUtil":2}],6:[function(require,module,exports){
(function () {
	var document = window.document,
		Statistics = require("./statics"),
		innerHeight = window.innerHeight,
		innerWidth = window.innerWidth,
		body = document.body,
		baseStatisUrl = ''; //默认的发送统计链接

	/*
	* @param {Object} rootDom : 某块需要统计曝光的DOM元素，默认为body
	* @param {String} exposureCode : 曝光码
	* @param {Function} isStatisElement : 判断一个元素是否是曝光统计元素,参数是一个dom对象，默认为a标签，返回一个对象,有两个属性:{ isNeedStatis: true, param: {} }。
	**/

	function ExposureStatis ( rootDom, exposureCode, isStatisElement ) {

		this.rootDom = rootDom || body;
		this.exposureCode = exposureCode || '';
        this.isStatisElement = isStatisElement || null;
		//所有要统计的曝光元素数组
		/********
		*每个值的格式
		*	{
		*		dom: domObj, //dom对象
				param : {}   //参数对象
		*	}
		***************/
		this.domArr = [];
		//setTimeout对象
		this.statisticsTimer = null;

		this.init( this.rootDom );
	}

	ExposureStatis.prototype = {

		// 统计的间隔时间
		intervalTime : 0,

		init : function ( rootDom ){

			this.addElements( rootDom );
			this.sendFirstScreenStatis();
			this.addExposureListen( );
		},

		// 添加所有的曝光统计元素
		addElements : function ( rootDom ) {
			var aTagArr = rootDom.getElementsByTagName('a'),
				len = aTagArr.length,
				i;

			if (len === 0) return;
			
			for ( i = 0; i < len; i++ ) {
				this.addElement(aTagArr[i]);
			}
		},

		/*
		* 添加新的曝光统计元素(传入的参数是dom数组)
		* 增加一个添加曝光统计对象的方法
		* 修改添加新的曝光统计元素的方法，添加方法时可以添加元素的所有统计数据。添加的数据格式为：
		*	{
		*		isWithParam: true, // 是否是自带参数，用来进行判断的
		*		dom: '', // 需要统计的曝光dom对象
		*		url: '', // 发送曝光统计的基本链接
		*		param: {	// 曝光统计的参数
		*		
		*		},
		*		isSendStatis: function() { // 是否发送统计的判断函数，return一个boolean变量
		*		
		*		}
		*	}
		**/
		addNewElements : function ( inputParameter ) {
			if( this.domArr.length === 0){
				this.removeExposureListen();
				this.addExposureListen( );
			}

			// 传入的是dom数组时
			if ( toString.call(inputParameter) === '[object Array]' && inputParameter.length !== 0){
				var len = inputParameter.length,
					i;
				for ( i = 0; i < len; i++ ) {
					this.addElement(inputParameter[i]);
				}
			} else if ( toString.call(inputParameter) === '[object Object]' && inputParameter.isWithParam) { //传入的是一个自带参数的统计对象时
				this.addElement(inputParameter);
			}
		},

		// 未滚动的情况下，直接发送首屏已曝光的元素
		sendFirstScreenStatis : function () {
			var that = this;
			//判断所有的元素是否曝光
			this.allIsExposure(that.domArr);
		},

		// 添加曝光监听
		addExposureListen : function () {
			var that = this;

			window.addEventListener( 'scroll', proxy( that.exposureListenFunc, that), false );
		},

		// 移除曝光监听
		removeExposureListen : function () {
			var that = this;

			window.removeEventListener( 'scroll', proxy( that.exposureListenFunc, that), false);
		},

		// 曝光监听函数
		exposureListenFunc : function () {
			var that = this;
			// that.allIsExposure(that.domArr);

			clearInterval(that.statisticsTimer);
			that.statisticsTimer = setTimeout(function () {
					that.allIsExposure(that.domArr);
				}, that.intervalTime);

		},

		// 对所有的监听元素，判断是否曝光
		allIsExposure : function ( arr ) {
			var i,
				len = arr.length,
				domArr = this.domArr,
				indexArr = [];

			//没有监听元素时
			if (len === 0) {
				this.removeExposureListen();
				return;
			}

			for ( i = 0; i < len; i++) {
				var isEXpos = this.isExposure(domArr[i].dom);

				if(isEXpos){
					if (!!domArr[i].url) { // 自带发送曝光统计地址的统计发送
						if (!!domArr[i].isSendStatis) {  // 有是否发送曝光统计的判断函数的情况下,返回true才发送统计
							if (domArr[i].isSendStatis()) { 
								Statistics.addStatistics(domArr[i].param, domArr[i].url);
								indexArr.push(i);
							}
						}else{
							Statistics.addStatistics(domArr[i].param, domArr[i].url);
							indexArr.push(i);
						}
					}else{
						Statistics.addStatistics(domArr[i].param);
						indexArr.push(i);
					}
				}
			}

			this.removeElement(indexArr);
		},

		// 增加一个监听元素
		addElement : function ( domObj ) {
			var that = this,
				isStatisElementObj;

			if (!!domObj.isWithParam) {
				isStatisElementObj = that.isStatisElement(domObj.dom);
			}else{
				isStatisElementObj = that.isStatisElement(domObj);
			}
                

            if(isStatisElementObj.isNeedStatis){
                var tempObj = {};

				if (!!domObj.isWithParam) { // 自带参数的曝光统计对象
					tempObj.dom = domObj.dom;
					tempObj.param = domObj.param;
					tempObj.url = domObj.url;
					tempObj.isSendStatis = domObj.isSendStatis;

				} else { // 一般的曝光统计对象
					tempObj.dom = domObj;
					tempObj.param = {
						_once_: that.exposureCode,
						rdm: Math.random().toString().substring(2, 15)
					};
				}

               tempObj.param = extend( tempObj.param, isStatisElementObj.param );

                that.domArr.push(tempObj);
            }

		},

		// 删除指定的监听元素
		removeElement : function ( indexArr ) {
			this.domArr = remove(this.domArr, indexArr );
		},

		// 判断dom元素是否曝光
		// 返回Boolean值
		isExposure : function ( domObj, overHeight ) {
			var overScreenHeight, // 网页超出屏幕的高度
				distanceTopHeight,// 元素距离页面顶部的高度
				distanceScreenTopHeight, // 元素距离屏幕顶部的高度
				distance;

			if( domObj ) {
				distance = !!overHeight ? ( domObj.clientHeight + overHeight ) : domObj.clientHeight;
				overScreenHeight = getScrollY();
				distanceTopHeight = getOffsetTop(domObj);
				distanceScreenTopHeight = distanceTopHeight - overScreenHeight;

				// 判断元素的顶部是否暴露在屏幕中
				if ( distanceScreenTopHeight > 0 && distanceScreenTopHeight < innerHeight ) {
					domObj.isDomTopExposure = true;
				}

				// 判断元素的底部是否暴露在屏幕中
				if ( distanceScreenTopHeight > -distance && distanceScreenTopHeight < innerHeight - distance ) {
					domObj.isDomBottomExposure = true;
				}

				return ( !!domObj.isDomTopExposure && !!domObj.isDomBottomExposure );

			}

			return false;
		}

	};

	

	// 给数组添加一个删除元素方法
	function remove (arr, index) {
		if( typeof arr === 'object' && toString.call(arr) === '[object Array]'){
			if ( typeof index === 'number' &&  index >= 0 ) {
				return arr.remove ? arr.remove(index) : arr.slice(0, index).concat(arr.slice( index + 1, arr.length));
			} else if ( typeof index === 'object' && toString.call(index) === '[object Array]' ) {
				//传入一个下标数组，删除这些元素
				var newArr = [];
				for ( var i = 0, len = index.length; i < len; i++ ){
					arr[index[i]] = void 0;
				}

				for( var j = 0, arrLen = arr.length; j < arrLen; j++ ){
					if ( arr[j] !== void 0 ) {
						newArr.push(arr[j]);
					}
				}

				return newArr;
			}
			
		}
	}

	// 获取网页超出屏幕的高度
	function getScrollY() {
		return window.pageYOffset || window.scrollY || document.documentElement.scrollTop;
	}

	// 获取元素距离页面顶部的高度
	function getOffsetTop(dom) {
		var top = 0;

		while ( dom.offsetParent &&　dom.offsetParent !== '') {
			top = top + dom.offsetTop;
			dom = dom.offsetParent;
		}

		return top;
	}

	// 指定函数的运行作用域
	function  proxy ( fun, context ) {
		var source = context || this;

		return function () {
			fun.apply(source, arguments);
		};
	}

    // 扩展对象的属性
    function extend ( c, p ){
        var isObject = function ( p ){
            return Object.prototype.toString.call(p) === '[object Object]';
        };

        if( !isObject(c) || !isObject(p) ) return;

        for ( var i in p ){
            if(p.hasOwnProperty(i)){
                c[i] = p[i];
            }
        }

        return c;
    }

    module.exports = ExposureStatis;
})(window);
},{"./statics":10}],7:[function(require,module,exports){
var CookieUtil = require("./CookieUtil"),
    MSOHUAD = require("./MSOHUAD"),
    MONEY = require("./ad"),
    template = require("art-template"),
    ADUtil = require("./ADUtils");
    AD = MSOHU.AD || (MSOHU.AD = {}),
    adDataHandle = MSOHUAD.adDataHandle,
    handleFormalAndTestAdParam = MSOHUAD.handleFormalAndTestAdParam,
    renderAdAndSendStatis = MSOHUAD.renderAdAndSendStatis,
    adHeadlineMapParam = window.adHeadlineMapParam, //头条banner图广告参数
    // MSOHU = window.MSOHU || (window.MSOHU = {}),
    
   
    // 
    isNoADMSohu = ADUtil && ADUtil.isNoADMSohu,
    isTestEnvironment = (function() {
        // 判断是正式环境还是测试环境
        var result = /^m\.sohu\.com$/.test(window.location.hostname) || window.location.href.indexOf('public') > 0;
        return result;
        // return true;
    })();

    // 用来判断是否发送统计的函数，应用于焦点图广告av统计的发送(元素曝光的情况下发送)
    MSOHUAD.isSentStatis = function() {
        var focusMapAds = $(".focus-map-ad");
        var result = false;
        for(var i=0; i<focusMapAds.length; i++){
            if(focusMapAds.eq(i) && focusMapAds.eq(i).hasClass('swiper-slide-active')){
                result = true;
                return result;
            }
        }
        return result;
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


var homeAdData = [
    [1, 12921, '12921', 3, '6400320'],  // 车展首页焦点图第四帧广告
    [8, 14281, '12922', 2, '6400100'],  //美女看展板块上方通栏
    // ["", 12926, '12926', 1, '30000001']
];

MSOHUAD.homeAdData = homeAdData;
/**
 * entry
 */

if (!isNoADMSohu) {
    init();
}

function init() {

    homeFocusMapAd();
    // infoFlowAdSend();
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
    homeGraphicMixeAd();


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
        [3, 14282, '12895', '', 3]  // “车展头条”板块第四条信息流广告
    ];

    var i, len,
        infoFlowAdParam = {};

    for (i = 0, len = infoFlowAdData.length; i < len; i++) {
        infoFlowAdParam = {
            type: infoFlowAdData[i][0],
            formalApId: infoFlowAdData[i][1],
            testApId: infoFlowAdData[i][2],
            adps: 160001,
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
                if (type === 3) { 
             
                    var infoFlowContainer = document.getElementById(adDomId);
                    var infoFlowLink = infoFlowContainer.querySelector("a");
                    infoFlowLink.setAttribute("href", "javascript:;");
                    infoFlowLink.setAttribute("data-url", adInfo.data.url);
                    infoFlowLink.innerHTML = "推广 | " + adInfo.data.text;
                    infoFlowContainer.setAttribute("data-msohu-money", true);
                    adDom = infoFlowContainer;
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
                    Utils.addClass(adDom, 'topic-item');
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
                        setFocusMapPicsPosition();
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

},{"./ADUtils":1,"./CookieUtil":2,"./MSOHUAD":3,"./ad":4,"art-template":14}],8:[function(require,module,exports){
(function () {
    var document = window.document;

    function Jsonp(opts) {
        this.url = opts.url || '';
        this.data = opts.data || null;
        this.success = opts.success || null;
        this.error = opts.error || null;
        this.timeout = opts.error || null;
        this.time = opts.time || 3000;

        this.callbackName = '';

        this.init();
    }

    Jsonp.prototype = {

        init: function() {
            this.setParams();
            this.createJsonp();
        },

        setParams: function() {
            this.url = this.url + (this.url.indexOf('?') === -1 ? '?' : '&') + params(this.data) + '&_time_=' + (new Date() * 1);

            if ( /callback=(\w+)/.test(this.url) ) {
                this.callbackName = RegExp.$1;
            } else if ( /callback=/.test(this.url) ){
                this.callbackName = 'jsonp_' + (new Date() * 1) + '_' + Math.random().toString().substring(2, 15);
                this.url.replace('callback=?', 'callback=' + this.callbackName);
                this.url.replace('callback=%3F', 'callback=' + this.callbackName);
            } else {
                this.callbackName = 'jsonp_' + (new Date() * 1) + '_' + Math.random().toString().substring(2, 15);
                this.url += '&callback=' + this.callbackName;
            }

        },

        createJsonp: function() {

            var that = this,
                head = document.getElementsByTagName('head'),
                scriptTag = this.createScriptTag(),
                name = that.callbackName,
                scriptId = '#id_' + name;

            if (head && head[0]) {
                head[0].appendChild(scriptTag);
            }

            // 增加超时处理
            if (!!that.timeout) {
                that.outTimer = setTimeout(function() {
                    window[name] = null;
                    if (head && head[0] && head[0].querySelector(scriptId)) {
                        head[0].removeChild(head[0].querySelector(scriptId));
                        that.timeout();
                    }
                }, that.time);
            }

        },

        createScriptTag: function() {
            var that = this,
                scriptTag = document.createElement('script'),
                name = that.callbackName;

            // scriptTag.type = 'text/script';
            scriptTag.charset = 'utf-8';
            scriptTag.src = that.url;
            scriptTag.id = 'id_' + that.callbackName;

            window[name] = function(json) {
                window[name] = null;

                var element = document.getElementById('id_' + that.callbackName);
                that.removeScriptTag(element);

                //真正的处理返回的数据的函数
                that.success(json);
                if (!!that.timeout) {
                    clearTimeout(that.outTimer);
                }
            };

            scriptTag.onerror = that.error;



            return scriptTag;
        },

        removeScriptTag: function(element) {
            removeElement(element);
        }
    };

    //删除一个节点
    function removeElement(element) {
        var parent = element.parentNode;
        if (element && parent.nodeType !== 11) {
            parent.removeChild(element);
        }
    }

    //把对象转换为序列化的字符串
    function params(obj) {
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
    }

    if( typeof define === 'function' && (define.amd || seajs) ){
        define('Jsonp', [], function(){
            return Jsonp;
        });
    }else if ( typeof module !== 'undefined' && module.exports ) {
        module.exports = Jsonp;
    }
    
    window.Jsonp = Jsonp;
})(window);
},{}],9:[function(require,module,exports){
(function (window) {

	var utils = {

		// 给数组添加一个删除元素方法
		remove: function(arr, index) {
			if (typeof arr === 'object' && toString.call(arr) === '[object Array]') {
				if (typeof index === 'number' && index >= 0) {
					return arr.remove ? arr.remove(index) : arr.slice(0, index).concat(arr.slice(index + 1, arr.length));
				} else if (typeof index === 'object' && toString.call(index) === '[object Array]') {
					//传入一个下标数组，删除这些元素
					var newArr = [];
					for (var i = 0, len = index.length; i < len; i++) {
						arr[index[i]] = void 0;
					}

					for (var j = 0, arrLen = arr.length; j < arrLen; j++) {
						if (arr[j] !== void 0) {
							newArr.push(arr[j]);
						}
					}

					return newArr;
				}

			}
		},

		// 获取网页超出屏幕的高度
		getScrollY: function() {
			return window.pageYOffset || window.scrollY || document.documentElement.scrollTop;
		},

		// 获取元素距离页面顶部的高度
		getOffsetTop: function(dom) {
			var top = 0;

			while (dom.offsetParent && 　dom.offsetParent !== '') {
				top = top + dom.offsetTop;
				dom = dom.offsetParent;
			}

			return top;
		},

		// 指定函数的运行作用域
		proxy: function(fun, context) {
			var source = context || this;

			return function() {
				fun.apply(source, arguments);
			};
		},

		// 扩展对象的属性
		extend: function(c, p) {
			var isObject = function(p) {
				return Object.prototype.toString.call(p) === '[object Object]';
			};

			if (!isObject(c) || !isObject(p)) return;

			for (var i in p) {
				if (p.hasOwnProperty(i)) {
					c[i] = p[i];
				}
			}

			return c;
		}
	};

	var document = window.document,
		innerHeight = window.innerHeight,
		innerWidth = window.innerWidth,
		body = document.body;

	/**
	 * @param {Array} domArr : // 所有要统计的曝光元素数组
	 *	每个值的格式
	 *		{
     *          dom: domObj, // dom对象
	 *			callback : function(slideDirection) {}   // 曝光以后的回调函数 slideDirection 滑动的方向，如果不需要这个参数
	 *													// ，可以不用
	 *			overHeight: {Number} // 判断元素是否曝光时，距离屏幕底部的高度(可以不传)
	 *			otherJudgeMethod: {Function} // 其他的判断元素是否曝光的方法(一般情况下不需要传)，这个方法的返回值是一个boolean值
	 *		}
	 * 兼容只传入一个对象的情况
	 *	有两个外部可以调用的接口:
	 *  1. add 添加新的曝光元素 (添加的参数和初始化的参数相同)
	 *  2. once 页面没有滚动的情况下，主动统计一次元素的曝光
	 */

	function NewExposureStatis ( domArr ) {

		this.domArr = [];
		//setTimeout对象
		this.statisticsTimer = null;

		this.init( domArr );
	}

	NewExposureStatis.prototype = {

		// 统计的间隔时间
		intervalTime : 0,

		// 记录上一次页面超出屏幕的距离(目的是判断页面滑动的方向)
		lastScrollY: 0,

		// 判断页面是向上滑动还是向下滑动
		// 有up 和 down 两个方向
		slideDirection: '',

		init : function ( domArr ){

			this.add( domArr )
				.once()
				.addExposureListen( );
		},

		// 对外提供的添加曝光元素的接口
		add : function(inputParameter) {
			this.addNewElements(inputParameter);

			return this;
		},

		// 添加新的曝光统计元素(传入的参数是dom数组,和初始化是传入的数据一样)
		addNewElements : function ( inputParameter ) {
			if( this.domArr.length === 0){
				this.removeExposureListen();
				this.addExposureListen( );
			}

			// 传入的是dom数组时
			if (toString.call(inputParameter) === '[object Array]' && inputParameter.length !== 0){
				var len = inputParameter.length,
					i;
				for ( i = 0; i < len; i++ ) {
					this._addElement(inputParameter[i]);
				}
			} else if ( toString.call(inputParameter) === '[object Object]' && !!inputParameter.dom ) {
				this._addElement(inputParameter);
			}
		},

		// 对外提供的主动统计曝光一次的接口
		once: function() {
			this.sendFirstScreenStatis();

			return this;
		},

		// 未滚动的情况下，直接发送首屏已曝光的元素
		sendFirstScreenStatis : function () {
			var that = this;
			//判断所有的元素是否曝光
			this.allIsExposure(that.domArr);

			return that;
		},

		// 添加曝光监听
		addExposureListen : function () {
			var that = this;

			window.addEventListener( 'scroll', utils.proxy( that.exposureListenFunc, that), false );
		},

		// 移除曝光监听
		removeExposureListen : function () {
			var that = this;

			window.removeEventListener( 'scroll', utils.proxy( that.exposureListenFunc, that), false);
		},

		// 判断页面的滑动方向
		_setSlideDirection : function() {
			var that = this,
				lastScrollY = that.lastScrollY,
				nowScrollY = utils.getScrollY();

			if ( nowScrollY > lastScrollY ) {
				that.slideDirection = 'down';
			} else {
				that.slideDirection = 'up';
			}

			that.lastScrollY = nowScrollY;
		},

		// 曝光监听函数
		exposureListenFunc : function () {
			var that = this;
			// that.allIsExposure(that.domArr);

			clearInterval(that.statisticsTimer);
			that.statisticsTimer = setTimeout(function () {
					that._setSlideDirection();
					that.allIsExposure(that.domArr);
				}, that.intervalTime);

		},

		// 对所有的监听元素，判断是否曝光
		allIsExposure : function ( arr ) {
			var i,
				len = arr.length,
				domArr = this.domArr,
				indexArr = [],
				isExpos = false,
				slideDirection = this.slideDirection,
				tempCallback = function(){};

			//没有监听元素时
			if (len === 0) {
				this.removeExposureListen();
				return;
			}

			for ( i = 0; i < len; i++) {

				isExpos = this.isExposure( domArr[i].dom, domArr[i].overHeight, domArr[i].otherJudgeMethod );

				if(isExpos){
					indexArr.push(i);
					if(!!domArr[i].callback){
						tempCallback = domArr[i].callback;
						tempCallback(slideDirection);
					}
				}
			}

			this.removeElement(indexArr);
		},

		// 增加一个监听元素
		_addElement : function ( domObj ) {
			var that = this;

            that.domArr.push(domObj);
		},

		// 删除指定的监听元素
		removeElement : function ( indexArr ) {
			this.domArr = utils.remove(this.domArr, indexArr );
		},

		// 判断dom元素是否曝光
		// 返回Boolean值
		isExposure : function ( ) {

			var domObj, overHeight, otherJudgeMethod,
				result = false;

			if (arguments.length === 1) {
				domObj = arguments[0];
			} else if (arguments.length === 2) {
				domObj = arguments[0];
				if (typeof arguments[1] === 'function') {
					otherJudgeMethod = arguments[1];
				} else {
					overHeight = arguments[1];
				}
			} else if (arguments.length >= 3) {
				domObj = arguments[0];
				overHeight = arguments[1];
				otherJudgeMethod = arguments[2];
			}

			var overScreenHeight, // 网页超出屏幕的高度
				distanceTopHeight,// 元素距离页面顶部的高度
				distanceScreenTopHeight, // 元素距离屏幕顶部的高度
				distance;

			if( domObj ) {
				distance = !!overHeight ? ( domObj.clientHeight + overHeight ) : domObj.clientHeight;
				overScreenHeight = utils.getScrollY();
				distanceTopHeight = utils.getOffsetTop(domObj);
				distanceScreenTopHeight = distanceTopHeight - overScreenHeight;

				// 判断元素的顶部是否暴露在屏幕中·
				if ( distanceScreenTopHeight > 0 && distanceScreenTopHeight < innerHeight ) {
					domObj.isDomTopExposure = true;
				}

				// 判断元素的底部是否暴露在屏幕中
				if ( distanceScreenTopHeight > -distance && distanceScreenTopHeight < innerHeight - distance ) {
					domObj.isDomBottomExposure = true;
				}

				if (!!otherJudgeMethod) {
					result = ( !!domObj.isDomTopExposure && !!domObj.isDomBottomExposure && otherJudgeMethod() );
				} else {
					result = ( !!domObj.isDomTopExposure && !!domObj.isDomBottomExposure );
				}

				// 如果判断元素已经曝光，则把元素判断曝光的属性设置为false，
				// 使得下一次判断元素曝光可以重新开始判断
				if (!!result) {
					domObj.isDomTopExposure = false;
					domObj.isDomBottomExposure = false;
				}
			}


			return result;
		}

	};

	if( typeof define === 'function' && (define.amd || seajs) ){
		define('NewExposureStatis', [], function(){
			return NewExposureStatis;
		});
	}else if ( typeof module != 'undefined' && module.exports ) {
		module.exports = NewExposureStatis;
	}

	window.NewExposureStatis = NewExposureStatis;

})(window);
},{}],10:[function(require,module,exports){

var $ = window.$;
var Statistics = {
    /**
     * @cfg {String} base
     * base url 
     */
    base: 'http://zz.m.sohu.com/msohu_cv.gif/?',
    
    /**
     * @private
     */
    params: function(code) {
        var i, params = {};
        if (typeof code === 'string') {
            params._once_ = code;
            params._dc = (+new Date());
        }
        else {
            for (i in code) {
                params[i] = code[i];
            }

            if ( !params.hasOwnProperty('_dc') ) {
                params._dc = (+new Date());
            }else{
                var randomName;
                {
                    randomName = '_dc' + Math.random().toString().substring( 2, 15 );
                }while( params.hasOwnProperty(randomName) );

                params[randomName] = (+new Date());
            }
        }
        
        return this.appendParams(params);
    },
    
    /*
     * @private
     */
    appendParams: function(params) {
        var i, paramsArray = [];
        
        for (i in params) {
            if (params.hasOwnProperty(i)) {
                paramsArray.push(i + '=' + params[i]);
            }
        }
        return paramsArray.join('&');
    },
    
    /**
     * 发送一个简单的统计请求
     * @public
     * @param {String} code 统计码
     * @param {String} base (optional) 统计请求文件地址
     * 
     * example: add _once_
     * Statistics.addStatistics('000027_back2top');
     * 
     * example: add _once_ & _trans_
     * Statistics.addStatistics({
     *     '_once_': '000095_video_newsfinal',
     *     '_trans_': 'aaa'
     * });
     */
    addStatistics: function(code, base) {
        var image;
        
        base = base || this.base;
        
        image = new Image(1, 1);
        image.src = base + this.params(code);
    },
    
    /**
     * 委托事件发送统计请求 
     */

    addGlobalSupport: function() {
        var that = this;
        
        $('body').on('touchend', '[data-code]', ontouchend);
        function ontouchend(e) {
            var target, parent, code;
            e.preventDefault();
            e.stopPropagation();
            //console.log(this);
            
            target = e.target;
            parent = target.parentNode;
            if ((code = target.getAttribute('data-code')) || (code = parent.getAttribute('data-code'))) {
                that.addStatistics(code);
            }
        }
    }


};

module.exports = Statistics;

},{}],11:[function(require,module,exports){
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

        isIphone:os.ihone,

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
        isQQ: /QBrowser/i.test(userAgent)
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
},{}],12:[function(require,module,exports){
/*!
 * artTemplate - Template Engine
 * https://github.com/aui/artTemplate
 * Released under the MIT, BSD, and GPL Licenses
 */
 
!(function () {


/**
 * 模板引擎
 * @name    template
 * @param   {String}            模板名
 * @param   {Object, String}    数据。如果为字符串则编译并缓存编译结果
 * @return  {String, Function}  渲染好的HTML字符串或者渲染方法
 */
var template = function (filename, content) {
    return typeof content === 'string'
    ?   compile(content, {
            filename: filename
        })
    :   renderFile(filename, content);
};


template.version = '3.0.0';


/**
 * 设置全局配置
 * @name    template.config
 * @param   {String}    名称
 * @param   {Any}       值
 */
template.config = function (name, value) {
    defaults[name] = value;
};



var defaults = template.defaults = {
    openTag: '<%',    // 逻辑语法开始标签
    closeTag: '%>',   // 逻辑语法结束标签
    escape: true,     // 是否编码输出变量的 HTML 字符
    cache: true,      // 是否开启缓存（依赖 options 的 filename 字段）
    compress: false,  // 是否压缩输出
    parser: null      // 自定义语法格式器 @see: template-syntax.js
};


var cacheStore = template.cache = {};


/**
 * 渲染模板
 * @name    template.render
 * @param   {String}    模板
 * @param   {Object}    数据
 * @return  {String}    渲染好的字符串
 */
template.render = function (source, options) {
    return compile(source, options);
};


/**
 * 渲染模板(根据模板名)
 * @name    template.render
 * @param   {String}    模板名
 * @param   {Object}    数据
 * @return  {String}    渲染好的字符串
 */
var renderFile = template.renderFile = function (filename, data) {
    var fn = template.get(filename) || showDebugInfo({
        filename: filename,
        name: 'Render Error',
        message: 'Template not found'
    });
    return data ? fn(data) : fn;
};


/**
 * 获取编译缓存（可由外部重写此方法）
 * @param   {String}    模板名
 * @param   {Function}  编译好的函数
 */
template.get = function (filename) {

    var cache;
    
    if (cacheStore[filename]) {
        // 使用内存缓存
        cache = cacheStore[filename];
    } else if (typeof document === 'object') {
        // 加载模板并编译
        var elem = document.getElementById(filename);
        
        if (elem) {
            var source = (elem.value || elem.innerHTML)
            .replace(/^\s*|\s*$/g, '');
            cache = compile(source, {
                filename: filename
            });
        }
    }

    return cache;
};


var toString = function (value, type) {

    if (typeof value !== 'string') {

        type = typeof value;
        if (type === 'number') {
            value += '';
        } else if (type === 'function') {
            value = toString(value.call(value));
        } else {
            value = '';
        }
    }

    return value;

};


var escapeMap = {
    "<": "&#60;",
    ">": "&#62;",
    '"': "&#34;",
    "'": "&#39;",
    "&": "&#38;"
};


var escapeFn = function (s) {
    return escapeMap[s];
};

var escapeHTML = function (content) {
    return toString(content)
    .replace(/&(?![\w#]+;)|[<>"']/g, escapeFn);
};


var isArray = Array.isArray || function (obj) {
    return ({}).toString.call(obj) === '[object Array]';
};


var each = function (data, callback) {
    var i, len;        
    if (isArray(data)) {
        for (i = 0, len = data.length; i < len; i++) {
            callback.call(data, data[i], i, data);
        }
    } else {
        for (i in data) {
            callback.call(data, data[i], i);
        }
    }
};


var utils = template.utils = {

	$helpers: {},

    $include: renderFile,

    $string: toString,

    $escape: escapeHTML,

    $each: each
    
};/**
 * 添加模板辅助方法
 * @name    template.helper
 * @param   {String}    名称
 * @param   {Function}  方法
 */
template.helper = function (name, helper) {
    helpers[name] = helper;
};

var helpers = template.helpers = utils.$helpers;




/**
 * 模板错误事件（可由外部重写此方法）
 * @name    template.onerror
 * @event
 */
template.onerror = function (e) {
    var message = 'Template Error\n\n';
    for (var name in e) {
        message += '<' + name + '>\n' + e[name] + '\n\n';
    }
    
    if (typeof console === 'object') {
        console.error(message);
    }
};


// 模板调试器
var showDebugInfo = function (e) {

    template.onerror(e);
    
    return function () {
        return '{Template Error}';
    };
};


/**
 * 编译模板
 * 2012-6-6 @TooBug: define 方法名改为 compile，与 Node Express 保持一致
 * @name    template.compile
 * @param   {String}    模板字符串
 * @param   {Object}    编译选项
 *
 *      - openTag       {String}
 *      - closeTag      {String}
 *      - filename      {String}
 *      - escape        {Boolean}
 *      - compress      {Boolean}
 *      - debug         {Boolean}
 *      - cache         {Boolean}
 *      - parser        {Function}
 *
 * @return  {Function}  渲染方法
 */
var compile = template.compile = function (source, options) {
    
    // 合并默认配置
    options = options || {};
    for (var name in defaults) {
        if (options[name] === undefined) {
            options[name] = defaults[name];
        }
    }


    var filename = options.filename;


    try {
        
        var Render = compiler(source, options);
        
    } catch (e) {
    
        e.filename = filename || 'anonymous';
        e.name = 'Syntax Error';

        return showDebugInfo(e);
        
    }
    
    
    // 对编译结果进行一次包装

    function render (data) {
        
        try {
            
            return new Render(data, filename) + '';
            
        } catch (e) {
            
            // 运行时出错后自动开启调试模式重新编译
            if (!options.debug) {
                options.debug = true;
                return compile(source, options)(data);
            }
            
            return showDebugInfo(e)();
            
        }
        
    }
    

    render.prototype = Render.prototype;
    render.toString = function () {
        return Render.toString();
    };


    if (filename && options.cache) {
        cacheStore[filename] = render;
    }

    
    return render;

};




// 数组迭代
var forEach = utils.$each;


// 静态分析模板变量
var KEYWORDS =
    // 关键字
    'break,case,catch,continue,debugger,default,delete,do,else,false'
    + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
    + ',throw,true,try,typeof,var,void,while,with'

    // 保留字
    + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
    + ',final,float,goto,implements,import,int,interface,long,native'
    + ',package,private,protected,public,short,static,super,synchronized'
    + ',throws,transient,volatile'

    // ECMA 5 - use strict
    + ',arguments,let,yield'

    + ',undefined';

var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g;
var SPLIT_RE = /[^\w$]+/g;
var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g;
var BOUNDARY_RE = /^,+|,+$/g;
var SPLIT2_RE = /^$|,+/;


// 获取变量
function getVariable (code) {
    return code
    .replace(REMOVE_RE, '')
    .replace(SPLIT_RE, ',')
    .replace(KEYWORDS_RE, '')
    .replace(NUMBER_RE, '')
    .replace(BOUNDARY_RE, '')
    .split(SPLIT2_RE);
};


// 字符串转义
function stringify (code) {
    return "'" + code
    // 单引号与反斜杠转义
    .replace(/('|\\)/g, '\\$1')
    // 换行符转义(windows + linux)
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n') + "'";
}


function compiler (source, options) {
    
    var debug = options.debug;
    var openTag = options.openTag;
    var closeTag = options.closeTag;
    var parser = options.parser;
    var compress = options.compress;
    var escape = options.escape;
    

    
    var line = 1;
    var uniq = {$data:1,$filename:1,$utils:1,$helpers:1,$out:1,$line:1};
    


    var isNewEngine = ''.trim;// '__proto__' in {}
    var replaces = isNewEngine
    ? ["$out='';", "$out+=", ";", "$out"]
    : ["$out=[];", "$out.push(", ");", "$out.join('')"];

    var concat = isNewEngine
        ? "$out+=text;return $out;"
        : "$out.push(text);";
          
    var print = "function(){"
    +      "var text=''.concat.apply('',arguments);"
    +       concat
    +  "}";

    var include = "function(filename,data){"
    +      "data=data||$data;"
    +      "var text=$utils.$include(filename,data,$filename);"
    +       concat
    +   "}";

    var headerCode = "'use strict';"
    + "var $utils=this,$helpers=$utils.$helpers,"
    + (debug ? "$line=0," : "");
    
    var mainCode = replaces[0];

    var footerCode = "return new String(" + replaces[3] + ");"
    
    // html与逻辑语法分离
    forEach(source.split(openTag), function (code) {
        code = code.split(closeTag);
        
        var $0 = code[0];
        var $1 = code[1];
        
        // code: [html]
        if (code.length === 1) {
            
            mainCode += html($0);
         
        // code: [logic, html]
        } else {
            
            mainCode += logic($0);
            
            if ($1) {
                mainCode += html($1);
            }
        }
        

    });
    
    var code = headerCode + mainCode + footerCode;
    
    // 调试语句
    if (debug) {
        code = "try{" + code + "}catch(e){"
        +       "throw {"
        +           "filename:$filename,"
        +           "name:'Render Error',"
        +           "message:e.message,"
        +           "line:$line,"
        +           "source:" + stringify(source)
        +           ".split(/\\n/)[$line-1].replace(/^\\s+/,'')"
        +       "};"
        + "}";
    }
    
    
    
    try {
        
        
        var Render = new Function("$data", "$filename", code);
        Render.prototype = utils;

        return Render;
        
    } catch (e) {
        e.temp = "function anonymous($data,$filename) {" + code + "}";
        throw e;
    }



    
    // 处理 HTML 语句
    function html (code) {
        
        // 记录行号
        line += code.split(/\n/).length - 1;

        // 压缩多余空白与注释
        if (compress) {
            code = code
            .replace(/\s+/g, ' ')
            .replace(/<!--[\w\W]*?-->/g, '');
        }
        
        if (code) {
            code = replaces[1] + stringify(code) + replaces[2] + "\n";
        }

        return code;
    }
    
    
    // 处理逻辑语句
    function logic (code) {

        var thisLine = line;
       
        if (parser) {
        
             // 语法转换插件钩子
            code = parser(code, options);
            
        } else if (debug) {
        
            // 记录行号
            code = code.replace(/\n/g, function () {
                line ++;
                return "$line=" + line +  ";";
            });
            
        }
        
        
        // 输出语句. 编码: <%=value%> 不编码:<%=#value%>
        // <%=#value%> 等同 v2.0.3 之前的 <%==value%>
        if (code.indexOf('=') === 0) {

            var escapeSyntax = escape && !/^=[=#]/.test(code);

            code = code.replace(/^=[=#]?|[\s;]*$/g, '');

            // 对内容编码
            if (escapeSyntax) {

                var name = code.replace(/\s*\([^\)]+\)/, '');

                // 排除 utils.* | include | print
                
                if (!utils[name] && !/^(include|print)$/.test(name)) {
                    code = "$escape(" + code + ")";
                }

            // 不编码
            } else {
                code = "$string(" + code + ")";
            }
            

            code = replaces[1] + code + replaces[2];

        }
        
        if (debug) {
            code = "$line=" + thisLine + ";" + code;
        }
        
        // 提取模板中的变量名
        forEach(getVariable(code), function (name) {
            
            // name 值可能为空，在安卓低版本浏览器下
            if (!name || uniq[name]) {
                return;
            }

            var value;

            // 声明模板变量
            // 赋值优先级:
            // [include, print] > utils > helpers > data
            if (name === 'print') {

                value = print;

            } else if (name === 'include') {
                
                value = include;
                
            } else if (utils[name]) {

                value = "$utils." + name;

            } else if (helpers[name]) {

                value = "$helpers." + name;

            } else {

                value = "$data." + name;
            }
            
            headerCode += name + "=" + value + ",";
            uniq[name] = true;
            
            
        });
        
        return code + "\n";
    }
    
    
};



// 定义模板引擎的语法


defaults.openTag = '{{';
defaults.closeTag = '}}';


var filtered = function (js, filter) {
    var parts = filter.split(':');
    var name = parts.shift();
    var args = parts.join(':') || '';

    if (args) {
        args = ', ' + args;
    }

    return '$helpers.' + name + '(' + js + args + ')';
}


defaults.parser = function (code, options) {

    // var match = code.match(/([\w\$]*)(\b.*)/);
    // var key = match[1];
    // var args = match[2];
    // var split = args.split(' ');
    // split.shift();

    code = code.replace(/^\s/, '');

    var split = code.split(' ');
    var key = split.shift();
    var args = split.join(' ');

    

    switch (key) {

        case 'if':

            code = 'if(' + args + '){';
            break;

        case 'else':
            
            if (split.shift() === 'if') {
                split = ' if(' + split.join(' ') + ')';
            } else {
                split = '';
            }

            code = '}else' + split + '{';
            break;

        case '/if':

            code = '}';
            break;

        case 'each':
            
            var object = split[0] || '$data';
            var as     = split[1] || 'as';
            var value  = split[2] || '$value';
            var index  = split[3] || '$index';
            
            var param   = value + ',' + index;
            
            if (as !== 'as') {
                object = '[]';
            }
            
            code =  '$each(' + object + ',function(' + param + '){';
            break;

        case '/each':

            code = '});';
            break;

        case 'echo':

            code = 'print(' + args + ');';
            break;

        case 'print':
        case 'include':

            code = key + '(' + split.join(',') + ');';
            break;

        default:

            // 过滤器（辅助方法）
            // {{value | filterA:'abcd' | filterB}}
            // >>> $helpers.filterB($helpers.filterA(value, 'abcd'))
            // TODO: {{ddd||aaa}} 不包含空格
            if (/^\s*\|\s*[\w\$]/.test(args)) {

                var escape = true;

                // {{#value | link}}
                if (code.indexOf('#') === 0) {
                    code = code.substr(1);
                    escape = false;
                }

                var i = 0;
                var array = code.split('|');
                var len = array.length;
                var val = array[i++];

                for (; i < len; i ++) {
                    val = filtered(val, array[i]);
                }

                code = (escape ? '=' : '=#') + val;

            // 即将弃用 {{helperName value}}
            } else if (template.helpers[key]) {
                
                code = '=#' + key + '(' + split.join(',') + ');';
            
            // 内容直接输出 {{value}}
            } else {

                code = '=' + code;
            }

            break;
    }
    
    
    return code;
};



// RequireJS && SeaJS
if (typeof define === 'function') {
    define(function() {
        return template;
    });

// NodeJS
} else if (typeof exports !== 'undefined') {
    module.exports = template;
} else {
    this.template = template;
}

})();
},{}],13:[function(require,module,exports){
var fs = require('fs');
var path = require('path');

module.exports = function (template) {

	var cacheStore = template.cache;
	var defaults = template.defaults;
	var rExtname;

	// 提供新的配置字段
	defaults.base = '';
	defaults.extname = '.html';
	defaults.encoding = 'utf-8';


	// 重写引擎编译结果获取方法
	template.get = function (filename) {
		
	    var fn;
	    
	    if (cacheStore.hasOwnProperty(filename)) {
	        // 使用内存缓存
	        fn = cacheStore[filename];
	    } else {
	        // 加载模板并编译
	        var source = readTemplate(filename);
	        if (typeof source === 'string') {
	            fn = template.compile(source, {
	                filename: filename
	            });
	        }
	    }

	    return fn;
	};

	
	function readTemplate (id) {
	    id = path.join(defaults.base, id + defaults.extname);
	    
	    if (id.indexOf(defaults.base) !== 0) {
	        // 安全限制：禁止超出模板目录之外调用文件
	        throw new Error('"' + id + '" is not in the template directory');
	    } else {
	        try {
	            return fs.readFileSync(id, defaults.encoding);
	        } catch (e) {}
	    }
	}


	// 重写模板`include``语句实现方法，转换模板为绝对路径
	template.utils.$include = function (filename, data, from) {
	    
	    from = path.dirname(from);
	    filename = path.join(from, filename);
	    
	    return template.renderFile(filename, data);
	}


	// express support
	template.__express = function (file, options, fn) {

	    if (typeof options === 'function') {
	        fn = options;
	        options = {};
	    }


		if (!rExtname) {
			// 去掉 express 传入的路径
			rExtname = new RegExp((defaults.extname + '$').replace(/\./g, '\\.'));
		}


	    file = file.replace(rExtname, '');

	    options.filename = file;
	    fn(null, template.renderFile(file, options));
	};


	return template;
}
},{"fs":15,"path":16}],14:[function(require,module,exports){
/*!
 * artTemplate[NodeJS]
 * https://github.com/aui/artTemplate
 * Released under the MIT, BSD, and GPL Licenses
 */

var node = require('./_node.js');
var template = require('../dist/template-debug.js');
module.exports = node(template);
},{"../dist/template-debug.js":12,"./_node.js":13}],15:[function(require,module,exports){

},{}],16:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":17}],17:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[7]);
