(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var b = require('./b');

exports.test = function () {
    console.log('module b : ' + b);
};
},{"./b":2}],2:[function(require,module,exports){
module.exports = " BBB Module ";
},{}],3:[function(require,module,exports){
var a = require('./a');
var ad = require("ad-ydgf")

$ = window.$;
$("body").append("<div></div>")

a.test();
},{"./a":1,"ad-ydgf":4}],4:[function(require,module,exports){
(function(window){
	function ADUtil(opt){
		var option = {
			Itemspaceid:12862,
			adps:6401136,
			adsrc:13,
			apt:4,
			maxPic:6,
			turn:"2",
			isTurn:false
		}
		for(var i in opt){
			option[i] = opt[i];
		}
		this.option= option;
		if(this.option.isTurn){
			this.genrateTurn();
		}
	}

	function genrateTurn(){
		var maxPic = this.option.maxPic;

		if(!localStorage.turn){
			localStorage.turn = Math.floor(Math.random(0,1)*maxPic);
		}

		this.option.turn = (localStorage.turn++)%maxPic+1; 
		
	}
	function getAD(callback){
		var _this = this;
		// console.log(this.option.turn);
		jsonp({
		  url: "http://10.16.10.63/adgtr/",
		  data:_this.option,
		  success: function(data){
		  	var img  = data[0].resource.file;
		  	if(typeof callback ==="function"){
		  		callback(img)
		  	}else{
		  		document.getElementsByClassName("loading")[0].style.cssText = 'background:url('+img+')'+' no-repeat;'+"background-size:100%";	
		  	}  
		    _this.submitAD(data,_this.option.turn);
		  }
		});
	}
	function submitAD(addata,turn){
		var reg = /\/c\/(\d{5})\//;
		var _this = this;
		var data = addata[0];
		var pvData = {
			aid:data.adid,	
			apid:"beans_"+_this.option.Itemspaceid,
			pgid:"pgid"+new Date().getTime(),
			at:"1",
			ax:"0",
			ay:"0",
			bucket:data.bucket,
			c:data.c,
			// ch_trans:"",
			e:data.e,
			ed:data.ed,
			ext:data.ext,
			freq:data.freq,
			impid:data.impression_id,
			ipos:"1",
			jsv:"06301130",
			mkey:data.monitorkey,
			newschn:reg.exec(document.location.pathname)[1],
			r:Math.ceil(Math.random(0,1)*100000000000000),
			rsln:"640*1136",
			sf:"false",
			supplyid:"4",
			turn:turn
		}

		var ad_plusData = {
			_dc:"1451030323800",
			a:"99",
			apid:"beans_"+_this.option.Itemspaceid,
			impid:data.impression_id,
		}

		var pv_ajax = {
			  url: "http://i.go.sohu.com/count/v",
			  data:pvData,
			  success: function(data){
			  }
		}

		var av_ajax = {
			  url: "http://i.go.sohu.com/count/av",
			  data:pvData,
			  success: function(data){
			  }
		}

		var ad_ajax = {
			  url: "http://imp.optaim.com/201409/8e1630f4158f49845c16b015b90d34bf.php",
			  data:ad_plusData,
			  success: function(data){
			  }
		}

		if(data == null){
			jsonp({
				  url: "http://i.go.sohu.com/count/v",
				  data:{apid:"beans_"+_this.option.Itemspaceid},
				  success: function(data){
				  }
			});
		}else{
			//第三方上报
			if(addata[0].resource.imp){
				var arr = addata[0].resource.imp.split("|");
				for(var i in arr){
					arr[i] = arr[i].slice(0,arr[i].indexOf(";"))
					if(arr[i].indexOf("optaim")>0){
						jsonp({
							url:arr[i],
							data:{
								_dc:new Date().getTime(),
								apid:"beans_"+_this.option.Itemspaceid,
								impid:data.impression_id
							},
							success: function(data){
			 				}
						});
					}else{
						var img = new Image();
						img.src=arr[i];
					}
				}			
			}
			jsonp(pv_ajax);
			jsonp(av_ajax);
			
		}	
	}

	function jsonp(option){
		var script = document.createElement("script");
		option.callback=option.callback||rdfn();
		script.src = option.url+"?"+obj2arg(option.data)+"&callback="+option.callback;
		window[option.callback] = function(data){
			option.success(data);
			window[option.callback] = null;
			document.body.removeChild(script)
		}
		setTimeout(function(){
			document.body.appendChild(script)
		},0);
	}

	function obj2arg(option){
		var args = "";
		for(var i in option){
			args += i+"="+option[i]+"&";
		}
		return args.slice(0,this.length-1);
	}

	function rdfn(){
		return "jsonp"+Math.ceil(Math.random()*100000);
	}

	ADUtil.prototype.genrateTurn  = genrateTurn;
	ADUtil.prototype.getAD = getAD;
	ADUtil.prototype.submitAD = submitAD;

	window.ADUtil = ADUtil;
	if(typeof exports!=="undefined") {
		module.exports = ADUtil;
	}
})(window);

},{}]},{},[3]);
