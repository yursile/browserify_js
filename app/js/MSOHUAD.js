/**
 * MSOHUAD
 */

var Statistics = require("./statics"),
	template = require("art-template"),
	// ExposureStatis = require("./exposure"),
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
			//AV上报
			// adDomSendStatisObj.sendAVStatis();
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
		// if (/^([tdg][1-9]\.)m\.sohu\.com$/.test(hostName)) {
		// 	isTestEnvironment = true;
		// }
		// if(/^([t][1-9]\.)zhibo\.m\.sohu\.com$/.test(hostName)) {
		// 	isTestEnvironment = true;
		// }
		isTestEnvironment = false;

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

		//添加newschn
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
	MSOHUAD.setFocusMapPicsPosition = setFocusMapPicsPosition;
	module.exports = window.MSOHUAD =  MSOHUAD;

	//TODO 暂时这样写，兼容频道页的代码
	//以后，会绑定到一个全局变量上
	window.adStatisticsSend = adStatisticsSend;
	window.renderAdAndSendStatis = renderAdAndSendStatis;
	window.adTemplate = adTemplate;
	window.adDomClassName = adDomClassName;