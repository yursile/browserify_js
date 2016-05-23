(function(a) {
	var b = /Android/i.test(a.navigator.userAgent),
		c = document.createElement("div").style,
		d = function() {
			for (var a, b = "t,webkitT,MozT,msT,OT".split(","), d = 0, e = b.length; e > d; d++) if (a = b[d] + "ransform", a in c) return b[d].substr(0, b[d].length - 1);
			return !1
		}(),
		e = function() {
			return "webkit" == d || "O" === d ? d.toLowerCase() + "TransitionEnd" : "transitionend"
		}(),
		f = function(a, b, c) {
			var d = this,
				f = function() {
					a.transitionTimer && clearTimeout(a.transitionTimer), a.transitionTimer = null, a.removeEventListener(e, g, !1)
				},
				g = function() {
					f(), c && c.call(d)
				};
			f(), a.addEventListener(e, g, !1), a.transitionTimer = setTimeout(g, b + 100)
		},
		g = function(a, b) {
			return function() {
				return a.apply(b, arguments)
			}
		},
		h = function(c) {
			c = c || {};
			for (var d in c) this[d] = c[d];
			this.ct = document.body, this._onScroll_ = g(this._onScroll, this), a.addEventListener("scroll", this._onScroll_, !1), this.maxScrollY = 0, b && (this.useFade = !1), this.elements = [], this.lazyElements = {}, this.scan(this.ct), this._onPageShow_ = g(this._onPageShow, this), a.addEventListener("pageshow", this._onPageShow_, !1)
		};
	h.prototype = {
		range: 200,
		realSrcAttribute: "data-src",
		useFade: !0,
		_onPageShow: function(a) {
			a.persisted && (this.maxScrollY = 0, this.scan(this.ct))
		},
		_onScroll: function() {
			var a = this.getScrollY();
			a > this.maxScrollY && (this.maxScrollY = a, this._scrollAction())
		},
		getScrollY: function() {
			return a.pageYOffset || a.scrollY
		},
		_scrollAction: function() {
			clearTimeout(this.lazyLoadTimeout), this.elements = this.elements.filter(function(b) {
				if (this.range + a.innerHeight >= b.getBoundingClientRect().top - document.documentElement.clientTop) {
					var c = b.getAttribute(this.realSrcAttribute);
					return c && (this.lazyElements[c] ? this.lazyElements[c].push(b) : this.lazyElements[c] = [b]), !1
				}
				return !0
			}, this), this.lazyLoadTimeout = setTimeout(g(this._loadImage, this), b ? 500 : 0)
		},
		_loadImage: function() {
			var a, b, c;
			for (b in this.lazyElements) c = this.lazyElements[b], a = c.shift(), 0 === c.length && delete this.lazyElements[b], a.addEventListener("load", g(this._onImageLoad, this), !1), a.addEventListener("error", g(this._onImageError, this), !1), a.src != b ? this._setImageSrc(a, b) : this._onImageLoad(a)
		},
		_onImageLoad: function(a) {
			var b = this,
				c = a.target || a,
				d = c.getAttribute(b.realSrcAttribute),
				e = b.lazyElements[d];
			b._showImage(c), this.successCallBack && this.successCallBack(a), e && (e.forEach(function(a) {
				b._setImageSrc(a, d), b._showImage(a)
			}), delete b.lazyElements[d])
		},
		_onImageError: function(a) {
			this.errorCallBack && this.errorCallBack(a)
		},
		_setImageSrc: function(a, b) {
			this.useFade && (a.style.opacity = "0"), a.src = b
		},
		_showImage: function(a) {
			var b = this,
				c = function() {
					a.setAttribute("data-lazy-load-completed", "1"), b.onImageLoad && b.onImageLoad(a)
				};
			b.useFade ? (a.style[d + "Transition"] = "opacity 200ms", a.style.opacity = 1, f(a, 200, c)) : c()
		},
		scan: function(a) {
			var b;
			a = a || document.body, b = a.querySelectorAll("img[" + this.realSrcAttribute + "]") || [], b = Array.prototype.slice.call(b, 0), b = b.filter(function(a) {
				return -1 == this.elements.indexOf(a) && "1" != a.getAttribute("data-lazy-load-completed")
			}, this), this.elements = this.elements.concat(b), this._scrollAction()
		},
		destroy: function() {
			this.destroyed || (this.destroyed = !0, a.removeEventListener("scroll", this._onScroll_, !1), a.removeEventListener("pageshow", this._onPageShow_, !1), this.elements = this.lazyElements = null)
		}
	}, c = null, a.ImageLazyLoader = h;

	if( typeof define === 'function' && (define.amd || seajs) ){
        define('ImageLazyLoader', [], function(){
            return ImageLazyLoader;
        });
    }else if ( typeof module !== 'undefined' && module.exports ) {
        module.exports = ImageLazyLoader;
    }
    
})(window);