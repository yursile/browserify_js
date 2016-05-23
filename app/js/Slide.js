(function(a) {
	var b = a.navigator,
		c = /Android/i.test(b.userAgent),
		d = b.msPointerEnabled,
		e = {
			start: d ? "MSPointerDown" : "touchstart",
			move: d ? "MSPointerMove" : "touchmove",
			end: d ? "MSPointerUp" : "touchend"
		},
		f = Array.prototype.slice,
		g = document.createElement("div").style,
		h = function() {
			for (var a, b = "t,webkitT,MozT,msT,OT".split(","), c = 0, d = b.length; d > c; c++) if (a = b[c] + "ransform", a in g) return b[c].substr(0, b[c].length - 1);
			return !1
		}(),
		i = h ? "-" + h.toLowerCase() + "-" : "",
		j = function(a) {
			return "" === h ? a : (a = a.charAt(0).toUpperCase() + a.substr(1), h + a)
		},
		k = j("transform"),
		l = j("transitionDuration"),
		m = function() {
			return "webkit" == h || "O" === h ? h.toLowerCase() + "TransitionEnd" : "transitionend"
		}(),
		n = function() {},
		o = function(a, b) {
			var c, d, e, f;
			if (c = (b || "").match(/\S+/g) || [], d = 1 === a.nodeType && (a.className ? (" " + a.className + " ").replace(/[\t\r\n]/g, " ") : " ")) {
				for (f = 0; e = c[f++];) d.indexOf(" " + e + " ") < 0 && (d += e + " ");
				a.className = d.trim()
			}
		},
		p = function(a, b) {
			var c, d, e, f;
			if (c = (b || "").match(/\S+/g) || [], d = 1 === a.nodeType && (a.className ? (" " + a.className + " ").replace(/[\t\r\n]/g, " ") : " ")) {
				for (f = 0; e = c[f++];) for (; d.indexOf(" " + e + " ") >= 0;) d = d.replace(" " + e + " ", " ");
				a.className = d.trim()
			}
		},
		q = function(a, b, c) {
			var d = this,
				e = function() {
					a.transitionTimer && clearTimeout(a.transitionTimer), a.transitionTimer = null, a.removeEventListener(m, f, !1)
				},
				f = function() {
					e(), c && c.call(d)
				};
			e(), a.addEventListener(m, f, !1), a.transitionTimer = setTimeout(f, b + 100)
		},
		r = function(a) {
			a = a || {};
			for (var b in a) this[b] = a[b];
			this.el = "string" == typeof this.targetSelector ? document.querySelector(this.targetSelector) : this.targetSelector, d && (this.el.style.msTouchAction = "pan-y"), this.el.style.overflow = "hidden", this.wrap = this.wrapSelector ? this.el.querySelector(this.wrapSelector) : this.el.children[0], this.wrap.style.cssText = i + "transform:translate3d(" + -this.getItemWidth() * this.activeIndex + "px,0px,0px);" + i + "transition:" + i + "transform 0ms;", this.items = f.call(this.wrap.children, 0), this.prevSelector && (this.prevEl = "string" == typeof this.prevSelector ? document.querySelector(this.prevSelector) : this.prevSelector, this.prevEl.addEventListener("click", this, !1)), this.nextSelector && (this.nextEl = "string" == typeof this.nextSelector ? document.querySelector(this.nextSelector) : this.nextSelector, this.nextEl.addEventListener("click", this, !1)), this.indicatorSelector && (this.indicators = "string" == typeof this.indicatorSelector ? document.querySelectorAll(this.indicatorSelector) : this.indicatorSelector, this.indicators = f.call(this.indicators, 0)), this.el.addEventListener(e.start, this, !1), this.to(this.activeIndex, !0), this.running = !1, this.autoPlay && this.start()
		};
	r.prototype = {
		activeIndex: 0,
		autoPlay: !0,
		interval: 3e3,
		duration: 300,
		beforeSlide: n,
		onSlide: n,
		getItemWidth: function() {
			return this.wrap.offsetWidth
		},
		getLastIndex: function() {
			return this.items.length - 1
		},
		getContext: function(a) {
			var b, c, d = this.getLastIndex();
			return "undefined" == typeof a && (a = this.activeIndex), b = a - 1, c = a + 1, 0 > b && (b = d), c > d && (c = 0), {
				prev: b,
				next: c,
				active: a
			}
		},
		start: function() {
			this.running || (this.running = !0, this.clear(), this.run())
		},
		stop: function() {
			this.running = !1, this.clear()
		},
		clear: function() {
			clearTimeout(this.slideTimer), this.slideTimer = null
		},
		run: function() {
			var a = this;
			a.slideTimer || (a.slideTimer = setInterval(function() {
				a.to(a.getContext().next)
			}, a.interval))
		},
		prev: function() {
			this.to(this.activeIndex - 1)
		},
		next: function() {
			this.to(this.activeIndex + 1)
		},
		onPrevClick: function(a) {
			a && a.preventDefault(), this.clear(), this.prev(), this.autoPlay && this.run()
		},
		onNextClick: function(a) {
			a && a.preventDefault(), this.clear(), this.next(), this.autoPlay && this.run()
		},
		to: function(a, b) {
			var c = this.activeIndex,
				d = this.getLastIndex();
			a >= 0 && d >= a && a != c && this.beforeSlide(a) !== !1 ? this.slide(a, b) : this.slide(c, b)
		},
		slide: function(a, b) {
			var c = this,
				d = c.activeIndex,
				e = d,
				f = function() {
					c.wrap.removeEventListener(m, f, !1), c.wrap.style[l] = "0ms", c.indicators && c.indicatorCls && (c.indicators[e] && p(c.indicators[e], c.indicatorCls), c.indicators[c.activeIndex] && o(c.indicators[c.activeIndex], c.indicatorCls)), c.onSlide(c.activeIndex)
				};
			c.activeIndex = a, b || q(c.wrap, c.duration, f), c.wrap.style[l] = b ? "0ms" : c.duration + "ms", c.wrap.style[k] = "translate3d(" + -c.getItemWidth() * a + "px, 0px, 0px)", b && f()
		},
		onTouchStart: function(a) {
			var b = this;
			if (!(b.prevEl && b.prevEl.contains && b.prevEl.contains(a.target) || b.nextEl && b.nextEl.contains && b.nextEl.contains(a.target))) {
				clearTimeout(b.androidTouchMoveTimeout), b.clear(), c && (b.androidTouchMoveTimeout = setTimeout(function() {
					b.resetStatus()
				}, 3e3)), b.el.removeEventListener(e.move, b, !1), b.el.removeEventListener(e.end, b, !1), b.el.addEventListener(e.move, b, !1), b.el.addEventListener(e.end, b, !1), delete b.horizontal;
				var f = d ? a.clientX : a.touches[0].clientX,
					g = d ? a.clientY : a.touches[0].clientY;
				b.touchCoords = {}, b.touchCoords.startX = f, b.touchCoords.startY = g, b.touchCoords.timeStamp = a.timeStamp
			}
		},
		onTouchMove: function(a) {
			var b = this;
			if (clearTimeout(b.touchMoveTimeout), d && (b.touchMoveTimeout = setTimeout(function() {
				b.resetStatus()
			}, 3e3)), b.touchCoords) {
				b.touchCoords.stopX = d ? a.clientX : a.touches[0].clientX, b.touchCoords.stopY = d ? a.clientY : a.touches[0].clientY;
				var c = b.touchCoords.startX - b.touchCoords.stopX,
					e = Math.abs(c),
					f = Math.abs(b.touchCoords.startY - b.touchCoords.stopY);
				if ("undefined" != typeof b.horizontal) 0 !== c && a.preventDefault();
				else {
					if (!(e > f)) return delete b.touchCoords, void(b.horizontal = !1);
					b.horizontal = !0, 0 !== c && a.preventDefault(), b.iscroll && b.iscroll.enabled && b.iscroll.disable(), clearTimeout(b.androidTouchMoveTimeout)
				}
				var g = b.getItemWidth(),
					h = b.activeIndex * g,
					i = b.activeIndex,
					j = b.getLastIndex();
				h += 0 === i && 0 > c || i == j && c > 0 ? Math.ceil(c / Math.log(Math.abs(c))) : c, g > e && (b.wrap.style[k] = "translate3d(" + -h + "px, 0px, 0px)")
			}
		},
		onTouchEnd: function(a) {
			if (clearTimeout(this.androidTouchMoveTimeout), clearTimeout(this.touchMoveTimeout), this.el.removeEventListener(e.move, this, !1), this.el.removeEventListener(e.end, this, !1), this.touchCoords) {
				var b, c = this.getItemWidth(),
					d = Math.abs(this.touchCoords.startX - this.touchCoords.stopX),
					f = this.activeIndex;
				isNaN(d) || 0 === d || (d > c && (d = c), b = d >= 80 || a.timeStamp - this.touchCoords.timeStamp < 200 ? this.touchCoords.startX > this.touchCoords.stopX ? f + 1 : f - 1 : f, this.to(b), delete this.touchCoords)
			}
			this.resetStatus()
		},
		resetStatus: function() {
			this.iscroll && this.iscroll.enable(), this.autoPlay && this.run()
		},
		refresh: function() {
			var a = this.getLastIndex();
			this.items = f.call(this.wrap.children, 0), this.activeIndex > a && this.to(a, !0)
		},
		handleEvent: function(a) {
			switch (a.type) {
			case e.start:
				this.onTouchStart(a);
				break;
			case e.move:
				this.onTouchMove(a);
				break;
			case e.end:
				this.onTouchEnd(a);
				break;
			case "click":
				a.currentTarget == this.prevEl ? this.onPrevClick(a) : a.currentTarget == this.nextEl && this.onNextClick(a)
			}
		},
		destroy: function() {
			this.destroyed = !0, this.stop(), this.prevEl && (this.prevEl.removeEventListener("click", this, !1), this.prevEl = null), this.nextEl && (this.nextEl.removeEventListener("click", this, !1), this.nextEl = null), this.indicators = null, this.el.removeEventListener(e.start, this, !1), this.el.removeEventListener(e.move, this, !1), this.el.removeEventListener(e.end, this, !1), this.el = this.wrap = this.items = null, this.iscroll = null
		}
	}, g = null, a.Slide = r

	if( typeof define === 'function' && (define.amd || seajs) ){
        define('Slide', [], function(){
            return r;
        });
    }else if ( typeof module !== 'undefined' && module.exports ) {
        module.exports = r;
    }
})(window);