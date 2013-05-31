/*!
 * 
 *  
 *  
 *  
 */
(function(window,document){
	var win = window;
	var doc = document;
	//默认不开启debug模式，在debug模式下模块会失效，防止传到外网的代码出现调试信息
	var c_debug = false,
		slice = Array.prototype.slice,
		toString = Object.prototype.toString;
	
	//定义cheer和cheer命名空间下的基本函数
	if(!window.CHEER){
		window.CHEER  = {};
	}

	//公共库扩展
	(function(){
		if (!String.prototype.trim) {
			String.prototype.trim = function(){
				var reg = /(^\s*)|(\s*$)/g;
				return this.replace(reg,"");
			};
		}
		
		if (!String.prototype.escape) {
			String.prototype.escape = function(){
				return (''+this)
			  .replace(/&/g, '&amp;')
			  .replace(/</g, '&lt;')
			  .replace(/>/g, '&gt;')
			  .replace(/"/g, '&quot;')
			  .replace(/'/g, '&#x27;')
			  .replace(/\//g,'&#x2F;');
			};
		}
		
		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function(value){
				for( var i = 0,j = this.length; i < j; i++ ){
					if( this[i] === value ){
						return i;
					}
				}
				return -1;
			}
		}
		
		if (!Array.prototype.lastIndexOf) {
			Array.prototype.indexOf = function(value){
				for( var i = this.length; i > 0; i-- ){
					if( this[i] === value ){
						return i;
					}
				}
				return -1;
			}
		}

		if (!Object.keys) {
			Object.keys = function(obj) {
				if (toString.call(obj) === "[object Object]") {
					var keys = [];
					for ( var key in obj ) {
						if (obj.hasOwnProperty(key)) {
							keys.push(key);
						}
					}
					return keys;
				}
				else {
					throw new Error("Invalid parameter, need object");
				}
			}
		}
		
		if (!Date.now) {
			Date.now = function() {
				return new Date().getTime();
			}
		}
		
		if (!Array.prototype.map) {
			Array.prototype.map = function(func) {
				if (toString.call(func) !== "[object Function]") {
					throw new TypeError("Invalid parameter, need Function");
				}
				var arr = [];
				for( var i = 0, j = this.length; i < j; i++ ) {
					arr.push(func.call(this, this[i], i, this));
				}
				return arr;
			}
		}
		
		if (!Array.prototype.filter) {
			Array.prototype.filter = function(func) {
				if (toString.call(func) !== "[object Function]") {
					throw new TypeError("Invalid parameter, need Function");
				}
				var arr = [];
				for( var i = 0, j = this.length; i < j; i++ ) {
					if (func.call(this, this[i], i, this)) {
						arr.push(this[i]);
					}
				}
				return arr;
			}
		}
		
	})()
	
	
	//CHEER类的函数
	CHEER = (function(){
		var readyList = [], isbindReady = false, isReady = false;
		
		// Cleanup functions for the document ready method
		if ( document.addEventListener ) {
			DOMContentLoaded = function() {
				document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
				CHEER.ready();
			};

		} else if ( document.attachEvent ) {
			DOMContentLoaded = function() {
				// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
				if ( document.readyState === "complete" ) {
					document.detachEvent( "onreadystatechange", DOMContentLoaded );
					CHEER.ready();
				}
			};
		}

		function bindReady(){
			if(isbindReady){
				return;
			}
			// Catch cases where $(document).ready() is called after the
			// browser event has already occurred.
			if ( document.readyState === "complete" ) {
				// Handle it asynchronously to allow scripts the opportunity to delay ready
				return setTimeout( CHEER.ready, 1 );
			}

			// Mozilla, Opera and webkit nightlies currently support this event
			if ( document.addEventListener ) {
				// Use the handy event callback
				document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

				// A fallback to window.onload, that will always work
				window.addEventListener( "load", CHEER.ready, false );

			// If IE event model is used
			} else if ( document.attachEvent ) {
				// ensure firing before onload,
				// maybe late but safe also for iframes
				document.attachEvent( "onreadystatechange", DOMContentLoaded );

				// A fallback to window.onload, that will always work
				window.attachEvent( "onload", CHEER.ready );

				// If IE and not a frame
				// continually check to see if the document is ready
				var toplevel = false;

				try {
					toplevel = window.frameElement == null;
				} catch(e) {}

				if ( document.documentElement.doScroll && toplevel ) {
					doScrollCheck();
				}
			}
		}
		
		function doScrollCheck() {
			if ( isReady ) {
				return;
			}

			try {
				// If IE is used, use the trick by Diego Perini
				// http://javascript.nwbox.com/IEContentLoaded/
				document.documentElement.doScroll("left");
			} catch(e) {
				setTimeout( doScrollCheck, 1 );
				return;
			}

			// and execute any waiting functions
			CHEER.ready();
		}

		return {
			namespace: function(str){
				var parts = str.split(".");
				var parent = CHEER;
				if(parts[0] === "CHEER"){
					parts = parts.slice(1);
				}
				for (var i = 0; i < parts.length; i++){
					if(!parent[parts[i]]){
						parent[parts[i]] = {};
						parent = parent[parts[i]];
					}
				}
				return parent;
			},
			
			//导入所有模块所有的方法到一个新的安全沙箱对象
			importModule: function(modules){
				var F = function(){};
				if(modules){
					var len = modules.length;
					for( var i = 0; i < len; i++ ){
						var moduleTmp = CHEER[modules[i]];
						this.deepCopyByProto(moduleTmp, F);
					}
				}
				else{
					for( var key in CHEER){
						if(typeof CHEER[key] == "object"){
							this.deepCopyByProto(CHEER[key], F);
						}
						else{
							F.prototype[key] = CHEER[key];
						}
					}
				}
				return new F();
			},
			
			deepCopyByProto : function(src, dest){
				if(typeof src == "object"){
					for( var key in src ){
						if( typeof src[key] == "object" ){
							this.deepCopyByProto(src[key], dest);
						}
						else{
							dest.prototype[key] = src[key];
						}
					}
				}
			},
			
			create: function(o){
				var instance;
				if (typeof Object.create === "function") {
					instance = Object.create(o);
				}
				else {
					var F = function(){};
					F.prototype = o;
					instance = new F();
				}
				return instance;
			},
			
			proxy: function(func, thisObj){
				return function(){
					return func.apply(thisObj, slice.call(arguments, 0));
				};
			},
			
			bind: function(func, context){
				if (Function.prototype.bind) {
					return func.bind(context);
				}
				else {
					return function(){
						return func.apply(context, slice.call(arguments, 0));
					};
				}
			},
			
			generateID: function(len){
				var len = len || 16,
					str = new Array(len+1).join("x");
				return ( str.replace(/x/g, function(){
					var r = Math.random()*16|0;
					return r.toString(16);
				}) ).toUpperCase();
			},
			
			// from book <<javascript web application>>
			makeUuid : function() {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
					return v.toString(16);
				});
			},
			
			hook: function(aOrgFunc, aBeforeExec, aAtferExec){
				return function(){
					if (typeof(aBeforeExec) == 'function') {
						arguments = aBeforeExec.apply(this, arguments) || arguments;
					}
					var result, args = [].slice.call(arguments); 
					args.push(aOrgFunc.apply(this, args));
					if (typeof(aAtferExec) == 'function') {
						result = aAtferExec.apply(this, args);
					}
					return (typeof(result) != 'undefined') ? result : args.pop();
				}
			},
			
			domReady: function(func){
				bindReady();
				isbindReady = true;
				if(typeof func === "function"){
					readyList.push(func);
				}
			},
			
			ready: function(){
				isReady = true;
				isbindReady = false;
				while( readyList.length > 0){
					var func = readyList.shift();
					if(typeof func === "function"){
						func();
					}
				}
			},
			
			each: function(o, callback) {
				var i = 0, length = o.length, key;
				if( this.isArray(o) ){
					for( ; i < length; i++ ) {
						callback(i, o[i]);
					}
				}
				else {
					for( key in o ) {
						callback(key, o[key]);
					}
				}
				return this;
			},
			
			useDebug: function(flag){
				c_debug = !!flag;
			},
			
			getIEVersion: function(){
				var ua = navigator.userAgent.toLowerCase();
				var ie = 0;
				if(window.ActiveXObject){
					ie = parseInt(ua.match(/msie\s*([\d.]+)/)[1]);
				}
				return ie;
			},
					
			isNull: function(a){
				return (a === null);
			},
			
			isUndef: function(a){
				return (typeof a === "undefined");
			},
			
			isArray: function(a){
				return toString.call(a) === "[object Array]";
			},
			
			isNumber: function(a){
				return toString.call(a) === "[object Number]";
			},
			
			isString: function(a) {
				return toString.call(a) === "[object String]";
			},
			
			isObject: function(a) {
				return toString.call(a) === "[object Object]";
			},
			
			isFunction: function(a) {
				return toString.call(a) === "[object Function]";
			},
			
			//把后面的object合并到前面一个object
			extend: function(des, src) {
				var self = this;
				if (this.isUndef(src)) {
					if (this.isObject(des)) {
						CHEER.each(des, function(key, value) {
							self[key] = value;
						});
					}
				}
				else {
					if (this.isObject(des) && this.isObject(src)) {
						CHEER.each(src, function(key, value) {
							des[key] = value;
						});
					}
				}
				return this;
			},
			
			template: function(tpl) {
				var index = 0;
				var source = "var __f = ''; var __p = ''; ";
				tpl.replace(/<\$=([\w\W]*?)=\$>|<\$(?!=)([\w\W]*?)\$>/gm, function(match, $1, $2, offset) {
					source += "__f+=" + "'" + tpl.slice(index, offset) + "'" + ";";
					if(!$1) {
						source += "try{__f+=" + $2 + ".escape()}catch(e){}" + ";";
					}
					else {
						source += $1;
					}
					index = offset + match.length;
				});
				source += "__f+=" + "'" + tpl.slice(index, tpl.length) + "'" + ";";
				source += "return __f;"
				source = source.replace(/\n/g, '');
				return new Function("data", source);
			},
			
			httpBuildQuery: function(obj) {
				var arr = [];
				for(var key in obj) {
					arr.push(key + "=" + encodeURIComponent(obj[key]));
				}
				return arr.join("&");
			},
			
			getFlash: function(name) {  
				if(window.navigator.userAgent.indexOf("MSIE") != -1){
					return document.getElementById(name);
				}else{
					var obj = document[name];
					if(obj && obj.length){
						for(var n=0;n<obj.length;++n){
							if(obj[n].nodeName.toUpperCase()=='EMBED')
								return obj[n];
						}
					}else{
						return obj;
					}
				}
			},
			
			arrayRandomShuffle: function(targetArray) {
				var arrayLength = targetArray.length;
				var tempArray1 = [];
				for (var i = 0; i < arrayLength; i ++) {
					tempArray1 [i] = i;
				}
				
				var tempArray2 = [];
				for (var i = 0; i < arrayLength; i ++) {
					tempArray2 [i] = tempArray1.splice (Math.floor (Math.random () * tempArray1.length) , 1);
				}
				
				var tempArray3 = [];
				for (var i = 0; i < arrayLength; i ++) {
					tempArray3 [i] = targetArray [tempArray2 [i]];
				}
				return tempArray3;
			}
			
		}
	})();
	
	CHEER.extend({
		//array
		//返回数组的第一个元素，如果有n，则返回前n个元素组成的数组
		arrFirst: function(arr, n) {
			if (CHEER.isArray(arr)) {
				return CHEER.isNumber(n) ? arr.slice(0, n) : arr[0];
			}
			throw new Error("invalid parameter, need a array");
			return null;
		},
		//object
		//LD距离算法，返回两个字符串距离，用于字符串相似度匹配，距离越大相似度越小
		strDistance: function(strA, strB) {
			if (!CHEER.isString(strA) && !CHEER.isString(strB)) {
				throw new SyntaxError("invalid parameter, need string");
			}
			
			var strALength = strA.length,
				strBLength = strB.length;

			if (strALength == 0 || strBLength == 0) {
				return Math.max(strALength, strBLength);
			}
			
			if (strA[0] == strB[0]) {
				this.strDistance(strA.slice(1), strB.slice(1));
			}
			else {
				var t1 = this.strDistance(strA, strB.slice(1));
				var t2 = this.strDistance(strA.slice(1), strB);
				var t3 = this.strDistance(strA.slice(1), strB.slice(1));
				return Math.min(t1, t2, t3) + 1;
			}
		},
		
		addStyle: function(css) {
			var style = document.createElement("style");
			style.type = "text/css";
			try {
				style.appendChild(document.createTextNode(css));
			}
			catch(e) {
				style.styleSheet.cssText = css;
			}
			var head = document.getElementsByTagName("head")[0]; 
			head.appendChild(style); 
		},
		
		error: function() {
			throw slice.call(arguments, 0).join(" ");
		}
	});
	
	//CHEER的Loader模块
	CHEER.namespace("CHEER.Loader");
	CHEER.Loader = (function(){
		//发送过请求的模块
		var requestedScripts = {},
			queuedScripts = [];
		return {
			getScript: function (url, callback) {
				var scriptdom = document.createElement('script');
				scriptdom.type = 'text/javascript';
				scriptdom.loaded = false;
				scriptdom.src = url;
				document.getElementsByTagName("head")[0].appendChild(scriptdom);
				scriptdom.onload = function(){
					scriptdom.loaded = true;
					scriptdom.onload = scriptdom.onreadystatechange = null;
					if (typeof callback === "function") {
						callback();
					}
				};

				scriptdom.onreadystatechange = function(){
					if ((scriptdom.readyState === 'loaded' || scriptdom.readyState === 'complete') && !scriptdom.loaded) {
						scriptdom.loaded = true;
						scriptdom.onload = scriptdom.onreadystatechange = null;
						if(typeof callback === "function"){
							callback();
						}
					}
				};
			},
			
			loadCSS: function(conf){
				var css = conf.css;
				var len = css.length;
				var head = document.getElementsByTagName("head")[0];
				for(var i = 0; i < len; i++){
					var cssLink = document.createElement("link");
					cssLink.rel = "stylesheet";
					cssLink.type = "text/css";
					cssLink.href = css[i];
					head.appendChild(cssLink);
				}
			},
			 /*
			 * 异步加载脚本
			 * @param conf = {
					"script": [], 需要加载的脚本集合 
					"bOrder": true 是否需要保持顺序执行，默认为true
				};
			 * @param function onload,所有脚本加载完成之后的回调
			 */
			loadScripts: function(conf, onload){
				var aUrls = conf.script;
				var bOrder = conf.bOrder || true;
				var len = aUrls.length;
				var bDifferent = false;
				for(var i = 0; i < len; i++) {
					if(this.differentDomain(aUrls[i])){
						bDifferent = true;
						break;
					}
				}
				var loadFunc = this.loadScriptXhrInjection;
				if (bDifferent) {
					//经过测试用chrome用append script标签也能保持执行顺序
					if (navigator.userAgent.indexOf('FireFox') != -1 || navigator.userAgent.indexOf('Opera') != -1 || navigator.userAgent.indexOf('Chrome') != -1){
						loadFunc = this.getScript;
					}
					else{
						loadFunc = this.loadScriptDocWrite;
					}
				}

				for(var i = 0; i < len; i++){
					//已经请求过的不需要再次请求
					if (!requestedScripts[aUrls[i]]) {
						loadFunc(aUrls[i], (i+1 == len ? onload : null), bOrder);
						requestedScripts[aUrls[i]] = true;
					}
				}
			},
			
			loadScriptXhrInjection: function(url, onload, bOrder){
				var len = queuedScripts.length;
				if (bOrder) {
					var qScript = {"response": null, "onload": onload, done: false};
					queuedScripts[len] = qScript;
				}
				var xhrObj = this.getXHRObject();
				xhrObj.onreadystatechange = function(){
					if(xhrObj.readyState == 4){
						if(bOrder){
							queuedScripts[len].response = xhrObj.responseText;
							this.injectScripts();
						}
						else{
							eval(xhrObj.responseText);
							if(onload){
								onload();
							}
						}
					}
				};
				xhrObj.open("Get", url, true);
				xhrObj.send("");
			},
			
			injectScripts: function(){
				var len = queuedScripts.length;
				for(var i = 0; i < len; i++){
					var qScript = queuedScripts[i];
					if(!qScript.done){
						if(!qScript.response){
							break;
						}
					}
					else{
						eval(qScript.response);
						if(qScript.onload){
							onload();
						}
						qScript.done = true;
					}
				}
			},
			
			getXHRObject: function(){
				var xhrObj = false;
				try{
					xhrObj = new XMLHttpRequest();
				}
				catch(e){
					var aTypes = ["Msxml12.XMLHTTP.6.0", "Msxml12.XMLHTTP.3.0", "Msxml12.XMLHTTP", "Microsoft.XMLHTTP"];
					var length = aTypes.length;
					for(var i = 0; i < length; i++){
						try{
							xhrObj = new ActiveXObject(aTypes[i]);
						}
						catch(e){
							continue;
						}
						break;
					}
				}
				return xhrObj;
			},
			
			loadScriptDocWrite: function(url, onload){
				document.write('<scr' + 'ipt src="' + url + '" type="text/javascript"></scr' + 'ipt>');
				if(onload){
					this.addHandler(window, "load", onload);
				}
			},
			
			addHandler: function(elem, type, func){
				if(elem.addEventListener){
					elem.addEventListener(type, func, false);
				}
				else if(elem.attachEvent){
					elem.attachEvent("on" + type, func);
				}
			},
			
			differentDomain: function(url){
				if(url.indexOf("http://") === 0 || url.indexOf("https://") === 0){
					var mainDomain = document.location.protocol + "://" + document.location.host + "/";
					return (url.indexOf(mainDomain) !== 0);
				}
				return false;
			}
			
		}; //end return;
	})();
	
	CHEER.namespace("CHEER.CSS");
	CHEER.CSS = (function(){
		var	events = {};
			/*
				event = {
					originalFn: func, //存储原始绑定的事件函数
					actualFn: func   //存储包装后触发的事件函数
				}
			*/
		var elemData = [];
			/*
				数组存储的是一个对象
				obj = {
					elem: xxx, //存储的dom对象
					display: xxx   //存储原始dom对象的display属性
				}
			*/
		function html2Node(html, el) {
			if( typeof html === "object" && html.nodeType ) {
				return html;
			}
			if( CHEER.isString(html) ) {
				var doc = (el && el.ownerDocument) || document,
					fragment = doc.createDocumentFragment(),
					div = doc.createElement("div");
				div.innerHTML = html;
				while( div.childNodes.length > 0 ) {
					fragment.appendChild(div.childNodes[0]);
				}
				div = null;
				return fragment;
			}
			return null;
		}
		
		function CSS(el){
			return new CSS.prototype.init(el);
		}
		
		CSS.fn = CSS.prototype = {
			constructor: CSS,
			
			init: function(el) {
				this._el = el;
				return this;
			},
			
			getComputedStyle: function( el, name ){
				if( el.style[name] ){
					return el.style[name];
				}
				else if( el.currentStyle ){
					return el.currentStyle[name];
				}
				else if( document.defaultView && document.defaultView.getComputedStyle ){
					var rupper = /([A-Z]|^ms)/g;
					name = name.replace( rupper, "-$1" ).toLowerCase();
					var ret = document.defaultView.getComputedStyle(el, null);
					return ret && ret.getPropertyValue(name);
				}
				return null;
			},
			
			css: function(name, value) {
				if( value !== undefined ) {
					this._el.style[name] = value;
				}
				else{
					return this.getComputedStyle(this._el, name);
				}
				return this;
			},
			
			attr: function(name, value) {
				if( value !== undefined ) {
					this._el.setAttribute(name, value);
				}
				else{
					return this._el.getAttribute(name);
				}
				return this;
			},
			
			removeAttr: function(name) {
				this._el.removeAttribute(name);
				return this;
			},
			
			data: function(name, value) {
				if( Object.prototype.toString.call(name) === "[object Object]" ){
					CHEER.each(name, CHEER.proxy(function(key, value) {
						this.attr("data-" + key, value);
					}, this));
				}
				else {
					if( value !== undefined ) {
						this.attr("data-" + name, value);
					}
					else {
						return this.attr("data-" + name);
					}
				}
				return this;
			},
			
			removeData: function(name) {
				this._el.removeAttribute("data-" + name);
				return this;
			},
			
			setClass: function(name) {
				this._el.className = name;
			},
			
			hasClass: function(name) {
				var arr = name.trim().split(/\s+/),
					className = this._el.className;
				for( var i = 0, j = arr.length; i < j; i++ ) {
					if( ! new RegExp("\\b" + arr[i] + "\\b").test(className) ) {
						return false;
					}
				}
				return true;
			},
			
			removeClass: function(name) {
				if( this._el.className.trim() === "" ) {
					return this;
				}
				else {
					this._el.className = this._el.className.replace(new RegExp("\\b(" + name.trim().split(/\s+/).join("|") + ")\\b","g"),"").split(/\s+/).join(" ");
				}
				return this;
			},
			
			addClass: function(name) {
				if( this._el.className.trim() === "" ) {
					this._el.className = name;
					return this;
				}
				CHEER.each(name.trim().split(/\s+/), CHEER.proxy(function(i,value) {
					if( !this.hasClass(value) ) {
						this._el.className += " " + value;
					}
				},this));
				return this;
			},
			
			empty: function(){
				this._el.innerHTML = "";
				return this;
			},
			
			append: function(node) {
				this._el.appendChild(html2Node(node));
				return this;
			},
			
			prepend: function(node) {
				this._el.firstChild ? this._el.insertBefore(html2Node(node),this._el.firstChild) : this.append(node);
				return this;
			},
			
			before: function(node) {
				this._el.parentNode.insertBefore(html2Node(node),this._el);
				return this;
			},
			
			after: function(node) {
				this._el.nextSibling ? this._el.parentNode.insertBefore(html2Node(node),this._el.nextSibling) : this.parentNode.appendChild(html2Node(node));
				return this;
			},
			
			remove: function(node) {
				this._el.parentNode.removeChild(this._el);
				this._el = null;
				return this;
			},
			
			html: function(html) {
				if( html === undefined ) {
					return this._el.innerHTML;
				}
				else {
					this.empty();
					this._el.innerHTML = html;
				}
				return this;
			},
			
			show: function() {
				if (this._display === "" || this._display === undefined) {
					CHEER.each(elemData, CHEER.bind(function(i, value) {
						if (value.elem === this._el) {
							this._display = value.display;
						}
					}, this));
				}
				this.css("display", this._display);
				return this;
			},
			
			hide: function() {
				var display = this.css("display");
				display = (display == "none") ? "" : display;
				this._display = display;
				if (this._display !== "") {
					var findFlag = false;
					CHEER.each(elemData, CHEER.bind(function(i, value) {
						if (value.elem === this._el) {
							this._display = value.display;
							findFlag = true;
						}
					}, this));
					if (!findFlag) {
						elemData.push({
							elem: this._el,
							display: display
						});
					}
				}
				this.css("display", "none");
				return this;
			},
			
			bind: function(type, callback) {
				if( this._el.attachEvent ) {
					this._el.attachEvent("on" + type, this._proxy(callback, this, type));
				}
				else if(this._el.addEventListener) {
					this._el.addEventListener(type, this._proxy(callback, this, type), false);
				}
				return this;
			},
			
			unbind: function(type, callback) {
				if( this._el.detachEvent ) {
					this._el.detachEvent("on" + type, this._reflexProxy(callback, type));
				}
				else if(this._el.removeEventListener) {
					this._el.removeEventListener(type, this._reflexProxy(callback, type), false);
				}
				return this;
			},
			
			_proxy: function(func, thisObj, type){
				var tmp = func,
					name = func.name;
				func = function(){
					if( window.ActiveXObject && window.event ) {
						var e = window.event;
						e.target = e.srcElement;
						return tmp.call(thisObj, e);
					}
					else {
						return tmp.apply(thisObj, slice.call(arguments, 0));
					}
				};
				//非匿名函数
				if( name != "" ) {
					if( events[type] === undefined ) {
						events[type] = [];
					}
					events[type].push({
						originalFn: tmp,
						actualFn: func
					});
				}
				return func;
			},
			
			_reflexProxy: function(func, type) {
				if( events[type] !== undefined ) {
					var arr = events[type],
						length = arr.length;
					for( var i = 0; i < length; i++ ) {
						if( arr[i].originalFn === func ){
							var tmp = arr[i].actualFn;
							arr.splice(i,1);
							return tmp;
						}
					}
				}
				return func;
			},
			
			target: function(e) {
				return (e && e.target) ? e.target : e.srcElement || document;
			}
			
		}
		
		CSS.fn.init.prototype = CSS.fn;

		return CSS;

	})();
	
	CHEER.namespace("CHEER.Dom");
	CHEER.Dom = (function(){
		var de = document.documentElement;
		return {
			getElementsByClass: function(className){
				var r = [];
				var re = new RegExp("(^|\\s)" + className + "(\\s|$)");
				var all = document.getElementsByTagName("*");
				for( var i = 0,j = all.length; i < j; i++){
					if(re.test(all[i].className)){
						r.push(all[i]);
					}
				}
				return r;
			},
			
			getElemX: function(elem){
				return elem.offsetParent ? elem.offsetLeft + this.getElemX(elem.offsetParent) : elem.offsetLeft;
			},
			
			getElemY: function(elem){
				return elem.offsetParent ? elem.offsetTop + this.getElemY(elem.offsetParent) : elem.offsetTop;
			},
			
			getClientHeight: function(){
				return (de && de.clientHeight ) ? de.clientHeight : document.body.clientHeight;
			},
			
			getClientWidth: function(){
				return (de && de.clientWidth ) ? de.clientWidth : document.body.clientWidth;
			},
			
			getWindowScrollX: function(){
				return (de && de.scrollLeft ) ? de.scrollLeft : document.body.scrollLeft;
			},
			
			getWindowScrollY: function(){
				return (de && de.scrollTop ) ? de.scrollTop : document.body.scrollTop;
			},
			
			getPageHeight: function(){
				return document.body.scrollHeight;
			},
			
			getPageWidth: function(){
				return document.body.scrollWidth;
			},
			
			getElementPageX: function(elem){
				return elem.offsetParent ? elem.offsetLeft + getElementPageX(elem.offsetParent) : elem.offsetLeft;
			},
			
			getElementPageY: function(elem){
				return elem.offsetParent ? elem.offsetTop + getElementPageY(elem.offsetParent) : elem.offsetTop;
			},
			
			getMouseX: function(e){
				return e.pageX || e.clientX + this.getWindowScrollX();
			},
			
			getMouseY: function(e){
				return e.pageY || e.clientY + this.getWindowScrollY();
			},
			
			//获取相对于触发事件的对象的坐标
			getOffsetX: function(e){
				return ( e && e.layerX ) || e.offsetX;
			},
			
			getOffsetY: function(e){
				return ( e && e.layerY ) || e.offsetY;
			},
			
			isMouseInElem: function(e,elem){
				var mouseX = this.getMouseX(e);
				var mouseY = this.getMouseY(e);
				var elemX = this.getElemX(elem);
				var elemY = this.getElemY(elem);
				var elemWidth = Math.max(elem.clientWidth,elem.offsetWidth);
				var elemHeight = Math.max(elem.clientHeight,elem.offsetHeight);
				if( mouseX > elemX && mouseX < (elemX + elemWidth) && mouseY > elemY && mouseY < (elemY + elemHeight) ){
					return true;
				}
				else{
					return false;
				}
			}
		};
	})();
	
	CHEER.namespace("CHEER.Event");
	CHEER.Event = (function(){
		return {
			addHandler: function(elem, type, func){
				if(elem.addEventListener){
					elem.addEventListener(type, func, false);
				}
				else if(elem.attachEvent){
					elem.attachEvent("on" + type, func);
				}
			},
			preventDefault: function(e){
				if(e.preventDefault){
					e.preventDefault();
				}
				else{
					e.returnValue = false;
				}
			},
			stopPropagation: function(e){
				if(e.stopPropagation){
					e.stopPropagation();
				}
				else{
					e.cancelBubble = true;
				}
			}
		};
	})();
	
	//管理环境中的全局变量
	CHEER.namespace("CHEER.Global");
	CHEER.Global = (function(){
		return {
			setVariable: function(key, value){
				this[key] = value;
			},
			getVariable: function(key){
				return this[key];
			}
		};
	})();

	CHEER.namespace("CHEER.JSONP");
	CHEER.JSONP = (function(){
		var Global = CHEER.Global;
		var Loader = CHEER.Loader;
		return {
			getJSONP: function(url,callback){
				var index = url.indexOf("{callback}");
				if( index == -1 ){
					throw new SyntaxError('Invalid parameter, Can not find callback');
				}
				var key = "jsonp" + "_" + CHEER.generateID() + "_" + new Date().getTime();
				var bk = "CHEER.Global." + key;
				Global.setVariable(key,callback);
				url = url.replace("{callback}", bk);
				Loader.getScript(url);
			}
		};
	})();
	
	CHEER.namespace("CHEER.Ajax");
	CHEER.Ajax = (function(){
		var xhr = null;
		return {
			getXHRObject: function(){
				var xhrObj = false;
				try{
					xhrObj = new XMLHttpRequest();
				}
				catch(e){
					var aTypes = ["Msxml12.XMLHTTP.6.0", "Msxml12.XMLHTTP.3.0", "Msxml12.XMLHTTP", "Microsoft.XMLHTTP"];
					var length = aTypes.length;
					for(var i = 0; i < length; i++){
						try{
							xhrObj = new ActiveXObject(aTypes[i]);
						}
						catch(e){
							continue;
						}
						break;
					}
				}
				return xhrObj;
			},
			
			/*
				options = {
					url :
					data :
					type : get or post or head or put or deleta
					header :
					success :
				}
			*/
			ajax: function(options) {
				options = options || {};
				var url = options.url,
					data = options.data,
					type = options.type || "GET",
					header = options.header,
					success = options.success,
					param = [];
					
				if( xhr === null ) {
					xhr = this.getXHRObject();
				}
				xhr.open(type, url, true);
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencode");
				if( !!header ) {
					CHEER.each(header, function(key,value){
						xhr.setRequestHeader(key, value);
					});
				}
				
				if( !!data ) {
					CHEER.each(data, function(key,value){
						para.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
					});
				}
				
				xhr.send(param.join("&").replace(/%20/g, "+"));
				xhr.onreadystatechange = function() {
					if( xhr.readyState == 4 && xhr.status == 200 && success !== undefined ) {
						var response = xhr.responseText;
						success(response);
					}
				};
			}
		}
	})();
	
	CHEER.namespace("CHEER.Logger");
	CHEER.Logger = (function(){
		var _div = null;
		var _contentDiv = null;
		var event = CHEER.Event,
			dom = CHEER.Dom,
			_timerID = null;
		return {
			init: function(){
				if(!c_debug){
					return;
				}
				var div = document.createElement("div");
				var body = document.body;
				div.id = "cheerLog";
				div.style.border = "1px";
				div.style.borderColor = "#000";
				div.style.borderStyle = "solid";
				if(CHEER.getIEVersion() == 6){
					div.style.position = "absolute";
				}
				else{
					div.style.position = "fixed";
				}
				div.style.left = "5px";
				div.style.bottom = "5px";
				div.style.overflow = "hidden";
				div.style.fontSize = "12px";
				div.style.zIndex = "9999";
				div.style.backgroundColor = "#fff";
				body.appendChild(div);
				var arr = [];
				arr.push("<div style='margin:5px'>");
				arr.push("	<a id='cheerLog_Clear' href='javascript:void(0)' style='text-decoration:none'>清空</a>");
				arr.push("	<a id='cheerLog_hideOrShow' href='javascript:void(0)' style='text-decoration:none'>隐藏</a>");
				arr.push("</div>");
				arr.push("<div id = 'cheerLog_Content'></div>");
				div.innerHTML = arr.join(" ");;
				_contentDiv = document.getElementById("cheerLog_Content");
				_contentDiv.style.overflow = "auto";
				_contentDiv.style.width = "270px";
				_contentDiv.style.height = "256px";
				_contentDiv.style.marginLeft = "5px";
				_div = div;
				
				var clear = document.getElementById("cheerLog_Clear");
				var hideOrShow = document.getElementById("cheerLog_hideOrShow");
				event.addHandler(clear, "click", function(){
									_contentDiv.innerHTML = "";
								});
								
				event.addHandler(hideOrShow, "click", function(){
									var display = _contentDiv.style.display;
									if( display == "none"){
										_contentDiv.style.display = "";
										hideOrShow.innerHTML = "隐藏";
									}
									else{
										_contentDiv.style.display = "none";
										hideOrShow.innerHTML = "显示";
									}
								});
								
				event.addHandler(window, "scroll", function(e){
					if(_div.style.position == "fixed"){
						return;
					}
					e = e || window.event;
					if( _timerID !== null ){
						clearTimeout(_timerID);
					}
					_timerID = setTimeout(function(){
											var scrollTop = dom.getWindowScrollY();
											var windowHeight = dom.getClientHeight();
											_div.style.top = scrollTop + windowHeight - 285 + "px";
											clearTimeout(_timerID);
										},100);
				});
			},
			
			log: function(para,options){
				if(!c_debug){
					return this;
				}
				var str = "";
				options = options || {};
				var color = options.color || "#000";
				if( _div === null ){
					this.init();
				}
				var p = document.createElement("p");
				p.style.margin = "0 0 8px";
				if(typeof para === "object"){
					str += "Object -> <br>";
					for(var i in para){
						str += i + " : " + para[i] + "<br>";
					}
				}
				else{
					str = para;
				}
				p.innerHTML = str;
				p.style.color = color;
				_contentDiv.appendChild(p);
			},
			
			assert: function(msg, expr){
				if(!c_debug){
					return;
				}
				if(!expr){
					this.log(msg, {color: "#C00"});
					throw new Error(msg);	
				}
			}
		};
	})();
	
	//事件代理，为了解除数据的依赖，观察者
	CHEER.namespace("CHEER.EventEmitter");
	CHEER.EventEmitter = (function(){
		var _listeners = {};
		return {
			//事件订阅
			subscribe: function(type, callback){
				( _listeners[type] || ( _listeners[type] = [] ) ).push(callback);
				return this;
			},
			
			//事件发送
			publish: function(){
				var args = Array.prototype.slice.call(arguments,0);
				var type = args.shift();
				//如果没有事件绑定则直接返回
				if( !_listeners[type] ){
					return this;
				}
				var list = _listeners[type];
				for( var i = 0, j = list.length; i < j; i++ ){
					list[i].apply(this, args);
				}
				return this;
			}
		};
	})();
	
	CHEER.namespace("CHEER.Control");
	CHEER.Control = (function(){
		return {
			//获取远程图片信息
			getRomoteImgInfo: function (url, load, error){
				var img = new Image();
				img.src = url;
				// 如果图片被缓存，则直接返回缓存数据
				if (img.complete) {
					load && load(img);
					return;
				};

				// 加载错误后的事件
				img.onerror = function () {
					error && error(img);
					img = img.onload = img.onerror = null;
				};
		 
				// 完全加载完毕的事件
				img.onload = function () {
					load && load(img);
					// IE gif动画会循环执行onload，置空onload即可
					img = img.onload = img.onerror = null;
				};
			}
		};
	})();
	
	CHEER.namespace("CHEER.Deferred");
	CHEER.Deferred = (function(){
		var slice = Array.prototype.slice;
		//call constructor
		function Deferred(func){
			return new Deferred.fn.init(func);
		}
		
		Deferred.fn = Deferred.prototype = {
			constructor: Deferred,
			
			init: function(func){
				//构造函数
				this._firing = [];
				this._fired = [];
				if(typeof func === "function")
					return this.then(func)
				return this;
			},
			
			//把参数包装成数组
			makeArray: function(){
			   return slice.call(arguments, 0);
			},
			
			_add: function(func){
				this._firing.push(func);
				return this;
			},
			
			wait: function(timeout){
				//两个按位非运算转换成整数
				this._firing.push(~~timeout);
				return this;
			},
			
			then: function(func){
				return this._add(func)
			},
			
			//给fire传的参数会传递到第一个回调函数
			fire: function(){
				return this._fire.apply( this, slice.call(arguments, 0) );
			},
			
			_fire: function(){
				var args = slice.call(arguments, 0);
				var that = this;
				var func = this._firing.shift();
				this._fired.push(func);
				//如果只是单纯串行的
				if( typeof func === "function" ){
					result = func.apply( func, args );
					//如果函数没有返回值，则把第一次fire时的参数依次传递
					if( typeof result !== "undefined"){
						
						args = this.makeArray(result);
					}
					this._fire.apply(this,args);
				}
				//如果是串行的夹杂setTimeout延迟操作
				else if( typeof func === "number" ){
					setTimeout(function(){
						that._fire.apply(that,args);
					}, func);
				}
				return this;
			}
		};
		
		Deferred.fn.init.prototype = Deferred.fn;

		//Deferred类接口
		return {
			Deferred: Deferred
		};
	})();
	
	//事件代理，为了解除数据的依赖，观察者
	CHEER.namespace("CHEER.Animation");
	CHEER.Animation = (function(){
		var requestAnimationFrame = window.requestAnimationFrame 
		|| window.mozRequestAnimationFrame 
		|| window.webkitRequestAnimationFrame 
		|| window.msRequestAnimationFrame 
		|| window.oRequestAnimationFrame 
		|| function(callback) { setTimeout(callback, 1000 / 60); };
		
		function isNumber(num) {
			return Object.prototype.toString.call(num) === "[object Number]";
		}
		
		function Animation(){
			return new Animation.fn.init();
		}
		
		Animation.fn = Animation.prototype = {
			constructor: Animation,
			
			init: function() {
				//_delay存储then之后每个动画需要延迟的时间
				this._delay = [];
				//_duration存储每段动画的持续时间
				this._duration = [];
				//为了计算每段动画设置的变量
				this._totalDuration = [];
				return this;
			},
			
			animate: function(obj) {
				var runFn = obj.run,
					endFn = obj.end,
					duration = obj.duration || 500,
					startTime = new Date().getTime(),
					self = this;
				var value = this._delay.shift();
				this._totalDuration.push(duration);
				
				if( isNumber(value) ) {
					setTimeout(function(){
						self.animate(obj)
					}, value);
					return this;
				}
				
				function go(timestamp) {
					timestamp = timestamp || new Date().getTime();
					var progress = timestamp - startTime;
					if( progress >= duration ) {
						if( typeof runFn === "function" ) {
							runFn(1);
						}
						if( typeof endFn === "function" ) {
							endFn();
						}
						return this;         
					}
					if( typeof runFn === "function" ) {
						runFn(progress / duration);
					}
					requestAnimationFrame(go);
				}
				requestAnimationFrame(go);
				return this;
			},
			
			then: function() {
				this._duration.push(Math.max.apply(Math, this._totalDuration));
				this._totalDuration = [];
				var dealy = 0;
				for( var i=0,j=this._duration.length; i < j; i++ ){
					dealy += this._duration[i];
				}
				this._delay.push(dealy);
				return this;
			}
		}
		
		Animation.fn.init.prototype = Animation.fn;
		
		return Animation;
	})();
	
	//CSS3动画模块，The code is heavily inspired by Move.js
	CHEER.namespace("CHEER.CSS3Animation");
	CHEER.CSS3Animation = (function(){
		//私有变量
		var eventEmitter = CHEER.EventEmitter;
		var current = window.getComputedStyle || window.currentStyle;
		var map = {
			'top': 'px',
			'bottom': 'px',
			'left': 'px',
			'right': 'px',
			'width': 'px',
			'height': 'px',
			'font-size': 'px',
			'margin': 'px',
			'margin-top': 'px',
			'margin-bottom': 'px',
			'margin-left': 'px',
			'margin-right': 'px',
			'padding': 'px',
			'padding-top': 'px',
			'padding-bottom': 'px',
			'padding-left': 'px',
			'padding-right': 'px'
		};
				
		CSS3Animation.ease = {
			  'in':                'ease-in'
			, 'out':               'ease-out'
			, 'in-out':            'ease-in-out'
			, 'snap':              'cubic-bezier(0,1,.5,1)'
			, 'linear':            'cubic-bezier(0.250, 0.250, 0.750, 0.750)'
			, 'ease-in-quad':      'cubic-bezier(0.550, 0.085, 0.680, 0.530)'
			, 'ease-in-cubic':     'cubic-bezier(0.550, 0.055, 0.675, 0.190)'
			, 'ease-in-quart':     'cubic-bezier(0.895, 0.030, 0.685, 0.220)'
			, 'ease-in-quint':     'cubic-bezier(0.755, 0.050, 0.855, 0.060)'
			, 'ease-in-sine':      'cubic-bezier(0.470, 0.000, 0.745, 0.715)'
			, 'ease-in-expo':      'cubic-bezier(0.950, 0.050, 0.795, 0.035)'
			, 'ease-in-circ':      'cubic-bezier(0.600, 0.040, 0.980, 0.335)'
			, 'ease-in-back':      'cubic-bezier(0.600, -0.280, 0.735, 0.045)'
			, 'ease-out-quad':     'cubic-bezier(0.250, 0.460, 0.450, 0.940)'
			, 'ease-out-cubic':    'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			, 'ease-out-quart':    'cubic-bezier(0.165, 0.840, 0.440, 1.000)'
			, 'ease-out-quint':    'cubic-bezier(0.230, 1.000, 0.320, 1.000)'
			, 'ease-out-sine':     'cubic-bezier(0.390, 0.575, 0.565, 1.000)'
			, 'ease-out-expo':     'cubic-bezier(0.190, 1.000, 0.220, 1.000)'
			, 'ease-out-circ':     'cubic-bezier(0.075, 0.820, 0.165, 1.000)'
			, 'ease-out-back':     'cubic-bezier(0.175, 0.885, 0.320, 1.275)'
			, 'ease-out-quad':     'cubic-bezier(0.455, 0.030, 0.515, 0.955)'
			, 'ease-out-cubic':    'cubic-bezier(0.645, 0.045, 0.355, 1.000)'
			, 'ease-in-out-quart': 'cubic-bezier(0.770, 0.000, 0.175, 1.000)'
			, 'ease-in-out-quint': 'cubic-bezier(0.860, 0.000, 0.070, 1.000)'
			, 'ease-in-out-sine':  'cubic-bezier(0.445, 0.050, 0.550, 0.950)'
			, 'ease-in-out-expo':  'cubic-bezier(1.000, 0.000, 0.000, 1.000)'
			, 'ease-in-out-circ':  'cubic-bezier(0.785, 0.135, 0.150, 0.860)'
			, 'ease-in-out-back':  'cubic-bezier(0.680, -0.550, 0.265, 1.550)'
		};
  
		//提供给外部可以重写的接口
		CSS3Animation.defaults = {
			duration: 500
		};
		
		
		/*
		 * 构造函数
		 * @param el,传入的动画的dom对象
		 */
		function CSS3Animation(el){
			return new CSS3Animation.fn.init(el);
		}
		
		CSS3Animation.fn = CSS3Animation.prototype = {
			constructor: CSS3Animation,
			
			init: function(el){
				//动画作用的dom对象
				this.el = el;
				//保存需要设置的动画属性
				this._props = {}; 
				this._rotate = 0;
				//保存transition-properties所有属性
				this._transitionProps = [];
				//保存transform的属性
				this._transforms = [];
				this.duration(CSS3Animation.defaults.duration)
				return this;
			}
		}
		
		CSS3Animation.fn.init.prototype = CSS3Animation.fn;
		
		CSS3Animation.prototype.transform = function(transform){
			this._transforms.push(transform);
			return this;
		};
		
		CSS3Animation.prototype.skew = function(x, y){
			y = y || 0;
			return this.transform('skew('+ x + 'deg, '+ y + 'deg)');
		};
		
		CSS3Animation.prototype.skewX = function(n){
			return this.transform('skewX(' + n + 'deg)');
		};
		
		CSS3Animation.prototype.skewY = function(n){
			return this.transform('skewY(' + n + 'deg)');
		};
		
		CSS3Animation.prototype.translate = 
		CSS3Animation.prototype.to = function(x, y){
			y = y || 0;
			return this.transform('translate(' + x + 'px, ' + y + 'px)');
		};
		
		CSS3Animation.prototype.translateX =
		CSS3Animation.prototype.x = function(n){
			return this.transform('translateX(' + n + 'px)');
		};
		
		CSS3Animation.prototype.translateY =
		CSS3Animation.prototype.y = function(n){
			return this.transform('translateY(' + n + 'px)');
		};
		
		CSS3Animation.prototype.scale = function(x, y){
			y = null == y ? x : y;
			return this.transform('scale(' + x + ', ' + y + ')');
		};
		
		CSS3Animation.prototype.scaleX = function(n){
			return this.transform('scaleX(' + n + ')')
		};
		
		CSS3Animation.prototype.scaleY = function(n){
			return this.transform('scaleY(' + n + ')')
		};
		
		CSS3Animation.prototype.rotate = function(n){
			return this.transform('rotate(' + n + 'deg)');
		};
		
		CSS3Animation.prototype.ease = function(fn){
			fn = CSS3Animation.ease[fn] || fn || 'ease';
			return this.setVendorProperty('transition-timing-function', fn);
		};
		
		// CSS3Animation.prototype.animate = function(name, props){
			// for (var i in props){
				// if (props.hasOwnProperty(i)){
					// this.setVendorProperty('animation-' + i, props[i])
				// }
			// }
			// return this.setVendorProperty('animation-name', name);
		// };
		
		CSS3Animation.prototype.duration = function(n){
			n = this._duration = 'string' == typeof n ? parseFloat(n) * 1000 : n;
			return this.setVendorProperty('transition-duration', n + 'ms');
		};
		
		CSS3Animation.prototype.delay = function(n){
			n = 'string' == typeof n ? parseFloat(n) * 1000 : n;
			return this.setVendorProperty('transition-delay', n + 'ms');
		};
		
		CSS3Animation.prototype.transition = function(prop){
			if (!this._transitionProps.indexOf(prop)) {
				return this;
			}
			this._transitionProps.push(prop);
			return this;
		};
		
		CSS3Animation.prototype.set = function(prop, val){
			this.transition(prop);
			if ('number' == typeof val && map[prop]) {
				val += map[prop]; 
			}
			this._props[prop] = val;
			return this;
		};
		
		CSS3Animation.prototype.setProperty = function(prop, val){
			this._props[prop] = val;
			return this;
		};
		
		//设置动画的属性，并保存在对象 _props 中
		CSS3Animation.prototype.setVendorProperty = function(prop, val){
			this.setProperty('-webkit-' + prop, val);
			this.setProperty('-moz-' + prop, val);
			this.setProperty('-ms-' + prop, val);
			this.setProperty('-o-' + prop, val);
			return this;
		};
		
		//设置元素的style动画属性
		CSS3Animation.prototype.applyProperties = function(){
			var props = this._props, el = this.el;

			for (var prop in props) {
				if (props.hasOwnProperty(prop)) {
					try{
						el.style.setProperty(prop, props[prop], '');
					}
					catch(e){
						el.style[prop] = props[prop];
					}
				}
			}

			return this;
		};
		
		CSS3Animation.prototype.getComputedStyle = function( el, name ){
			if( el.style[name] ){
				return el.style[name];
			}
			else if( el.currentStyle ){
				return el.currentStyle[name];
			}
			else if( document.defaultView && document.defaultView.getComputedStyle ){
				var rupper = /([A-Z]|^ms)/g;
				name = name.replace( rupper, "-$1" ).toLowerCase();
				var ret = document.defaultView.getComputedStyle(el, null);
				return ret && ret.getPropertyValue(name);
			}
			return null;
		};
		
		CSS3Animation.prototype.testCSSAnimation = function () {
			var prefixed = " -webkit- -moz- -o- -ms-".split(' ');
			for ( var i = 1,j = prefixed.length; i < j; i++) {
				if( !!this.getComputedStyle(this.el, prefixed[i]+"transform") && !!this.getComputedStyle(this.el, prefixed[i]+"transition-duration") ) {
					return true;
				}
			}
			return false;
		}
		
		CSS3Animation.prototype.end = function(failFn, startFn, endFn){
			var self = this;
			if( !this.testCSSAnimation() ){
				if(typeof failFn === "function"){
					failFn.call(self);
					return this;
				}
			}
			
			if(typeof startFn === "function"){
				startFn.call(self);
			}
			if (this._transforms.length) {
				this.setVendorProperty('transform', this._transforms.join(' '));
			}

			this.setVendorProperty('transition-properties', this._transitionProps.join(', '));
			this.applyProperties();

			setTimeout( function(){
				if(typeof endFn === "function"){
					endFn.call(self);
				}
			}, this._duration );
			
			return this;
		};
  
		return {
			CSS3Animation: CSS3Animation
		};
	})();
	
	CHEER.namespace("CHEER.MVC");
	CHEER.MVC = (function(){
		function MVC(obj) {
			return new MVC.prototype.init(obj);
		}
		
		MVC.fn = MVC.prototype = {
			constructor: MVC,
			
			init: function(obj) {
				this._listeners = {};
				var self = this;
				if (CHEER.isObject(obj)) {
					CHEER.each(obj, function(key, value) {
						self[key] = value;
					});
				}
				if (CHEER.isFunction(this["init"])) {
					this["init"].call(this);
				}
			},
			
			on: function(type, callback) {
				var self = this;
				if (CHEER.isString(type)) {
					( this._listeners[type] || (this._listeners[type] = []) ).push(callback);
				}
				else if (CHEER.isObject(type)) {
					CHEER.each(type, function(key, value){
						( self._listeners[key] || (self._listeners[key] = []) ).push(value);
					});
				}
				return this;
			},
			
			emit: function() {
				var arr = slice.call(arguments, 0);
				var type = arr.shift();
				if (!this._listeners[type]) {
					return this;
				}
				else {
					var length = this._listeners[type].length,
						listeners = this._listeners[type];
					for( var i = 0; i < length; i++ ) {
						listeners[i].apply(this, arr);
					}
				}
				return this;
			},
			
			extend: function() {
				var self = this;
				if (CHEER.isObject(obj)) {
					CHEER.each(obj, function(key, value) {
						self[key] = value;
					});
				}
				return this;
			}
		}
		
		MVC.fn.init.prototype = MVC.fn;
		
		return {
			MVC: MVC
		};
		
	})();
	
	CHEER.namespace("CHEER.AMD");
	CHEER.AMD = (function() {
		// var mods = [], modID = 0, loader = CHEER.Loader;
		// function define(moduleName, deps, factory) {
			// var mod = {};
			// mod.name = moduleName;
			// if (factory === undefined) {
				// mod.factory = deps();
				// mod.deps = null;
			// }
			// else {
				// mod.factory = factory();
				// mod.deps = deps;
			// }
			// mod.id = modID++;
			// mods.push(mod);
		// }
		
		// function require(modules, callback) {
			// if (CHEER.isString(modules)) {
				// CHEER.each(mods, function (i,value){
					// if (value.name == modules) {
						// callback(value.factory);
						// return;
					// }
				// });
			// }
			// else if (CHEER.isArray(modules)) {
				// var args = [];
				// CHEER.each(mods, function (i,value){
					// if (value.name == modules) {
						// args.push(value.factory);
					// }
				// });
				// callback.apply(callback, args);
			// }
		// }
		
		// require.load = function(modules, callback) {
			// if (CHEER.isString(modules)) {
				// loader.getScript(modules, function(){
					// callback();
				// })
			// }
			// else if (CHEER.isArray(modules)) {
				// loader.loadScripts(modules, function() {
					// callback();
				// });
			// }
		// }
		
		// window.define = define;
		// window.require = require;
	})();
	
})(window,document);