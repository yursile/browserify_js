(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var b = require('./b');

exports.test = function () {
    console.log('module b : ' + b);
};
},{"./b":2}],2:[function(require,module,exports){
module.exports = " BBB Module ";
},{}],3:[function(require,module,exports){
var a = require('./a');
var extend = require('js_extend');

var Supportor = require("./supportor");

alert(Supportor.isAndroid);

var obj = {
	name:"kk",
	wife:{
		name:"krystal",
		say:function(){
			console.log("i love you")
		}
	}
}

var obj1 = extend(true,{name:"yursile",age:"20"},obj);
console.log(obj1);

a.test();
},{"./a":1,"./supportor":4,"js_extend":5}],4:[function(require,module,exports){
(function(window) {
    var navigator = window.navigator,
        userAgent = navigator.userAgent,
        android = userAgent.match(/(Android)[\s\/]*([\d\.]+)/i),
        ios = userAgent.match(/(iPad|iPhone|iPod)[\w\s]*;(?:[\w\s]+;)*[\w\s]+(?:iPad|iPhone|iPod)?\sOS\s([\d_\.]+)/i),
        wp = userAgent.match(/(Windows\s+Phone)(?:\sOS)?\s([\d\.]+)/i),
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
},{}],5:[function(require,module,exports){
/*!
 * 
 * Copyright 2016, YURSILE

 */

(function(window) {
    function extend() {
      var target = arguments[0] || {};
      var i = 1;
      var length = arguments.length;
      var deep = false;
      var options, name, src, copy, copy_is_array, clone;

      // Handle a deep copy situation
      if (typeof target === 'boolean') {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
      }

      // Handle case when target is a string or something (possible in deep copy)
      if (typeof target !== 'object' && !is.fn(target)) {
        target = {};
      }

      for (; i < length; i++) {
        // Only deal with non-null/undefined values
        options = arguments[i]
        if (options != null) {
          if (typeof options === 'string') {
              options = options.split('');
          }
          // Extend the base object
          for (name in options) {
            src = target[name];
            copy = options[name];

            // Prevent never-ending loop
            if (target === copy) {
              continue;
            }

            // Recurse if we're merging plain objects or arrays
            if (deep && copy && (is.hash(copy) || (copy_is_array = is.array(copy)))) {
              if (copy_is_array) {
                copy_is_array = false;
                clone = src && is.array(src) ? src : [];
              } else {
                clone = src && is.hash(src) ? src : {};
              }

              // Never move original objects, clone them
              target[name] = extend(deep, clone, copy);

            // Don't bring in undefined values
            } else if (typeof copy !== 'undefined') {
              target[name] = src||copy;
            }
          }
        }
      }

      // Return the modified object
      return target;
    };


    /*
    utils

    */
    var toStr = Object.prototype.toString;

    var is = {};
    is.array = Array.isArray || function (value) {
      return toStr.call(value) === '[object Array]';
    };

    is.fn = function (value) {
      var isAlert = typeof window !== 'undefined' && value === window.alert;
      return isAlert || toStr.call(value) === '[object Function]';
    };

    is.object = function (value) {
      return toStr.call(value) === '[object Object]';
    };

    is.hash = function (value) {
      return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
    };

    /**
     * @public
     */


    if( typeof define === 'function' && (define.amd || seajs) ){
        define('extend', [], function(){
            return extend;
        });
    }else if ( typeof module !== 'undefined' && module.exports ) {
        module.exports = extend;
    }
    
    window.extend = extend;
})(window);


},{}]},{},[3]);
