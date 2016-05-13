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
console.log("2")

a.test();