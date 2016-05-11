var $ = window.$;
exports.Statistics = {
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
