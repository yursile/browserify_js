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