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
        // if(testEnvReg.test(hostName)){
        //     return true;
        // }else{
        //     return false;
        // }
        return false;
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
