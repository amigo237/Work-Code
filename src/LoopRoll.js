/*!
 * LoopRoll v1.0.0
 * Copyright (c) 2013, in shenzhen. luzhao@xunlei.com
 */

(function( window ) {

	/*
	需要滚动的元素最后不要用id属性，因为循环滚动会clone相应的滚动元素，
	如果有id会造成id重复
	*/

	var requestAnimationFrame = window.requestAnimationFrame 
		|| window.mozRequestAnimationFrame 
		|| window.webkitRequestAnimationFrame 
		|| window.msRequestAnimationFrame 
		|| window.oRequestAnimationFrame 
		|| function(callback) { setTimeout(callback, 1000 / 60); };

	var noop = function(){};

	if( !Array.prototype.indexOf ) {
		Array.prototype.indexOf = function( value ) {
			for( var i = 0, j = this.length; i < j; i++ ) {
				if( this[i] === value ) {
					return i;
				}
			}
			return -1;
		}
	}

	function animate( run, end, duration ) {
		var startTime = new Date().getTime(),
		run = run || noop;
		end = end || noop;
		duration = duration || 500;

		function go() {
			var timestamp = new Date().getTime();
			var progress = timestamp - startTime;
			if( progress >= duration ) {
				if( util.isFunction(run) ) {
					run(1);
				}
				if( util.isFunction(end) ) {
					end();
				}
				return;
			}
			if( util.isFunction(run) ) {
				run( progress / duration );
			}
			requestAnimationFrame( go );
		}
		requestAnimationFrame( go );
	}

	var LoopRoll = function( options ) {
		if( !options.container || !options.rollElement || !util.isElement( options.container ) || !util.isElement( options.rollElement ) ) {
			throw new Error("Missing parameter");
			return this;
		}

		if( !( this instanceof LoopRoll ) ) {
			var obj = new LoopRoll( options );
			return obj;
		}

		this._container = options.container;
		this._rollElement = options.rollElement;
		this._speed = options.speed || 100;
		this._delay = options.delay || 0;
		this._rollPixel = options.rollPixel || ( this._delay == 0 ? this._container.clientHeight : 1 );
		this._direction = options.direction || "up";

		//间隔播放的时候判断是否要暂停播放的标志
		this._isStopLoop = false;

		//轮播的时候最多只能滚动容器的宽度或者高度那么多像素
		if( ["up", "down"].indexOf(this._direction) != -1 && this._delay != 0 ) {
			this._rollPixel = this._rollPixel > this._container.clientHeight ? this._container.clientHeight : this._rollPixel;
		}

		if( ["left", "right"].indexOf(this._direction) != -1 && this._delay != 0 ) {
			this._rollPixel = this._rollPixel > this._container.clientWidth ? this._container.clientWidth : this._rollPixel;
		}
		
		this._init();
	};

	LoopRoll.prototype._init = function() {
		if( util.getComputedStyle( this._container, "position" ) == "static" ) {
			this._container.style.position = "relative";
		}

		if( util.getComputedStyle( this._rollElement, "position" ) == "static" ) {
			this._rollElement.style.position = "absolute";
		}

		//marquee为循环滚动的处理函数，循环滚动意味着中途不会暂停
		var marquee = util.bind( this._marquee, this );

		//rollPlay为轮播的处理函数，轮播是指中间会暂定一下然后循环
		var rollPlay = util.bind( this._rollPlay, this );

		this._rollElementClone = this._rollElement.cloneNode( true );
		this._container.style.overflow = "hidden";
		this._container.appendChild( this._rollElementClone );

		if( this._direction == "up" ) {
			this._rollElement.style.top = "0px";
			this._rollElementClone.style.top = this._rollElement.offsetHeight + "px";
		}
		else if ( this._direction == "down" ) {
			this._rollElement.style.top = "0px";
			this._rollElementClone.style.top = -this._rollElement.offsetHeight + "px";
		}
		else if( this._direction == "left" ) {
			this._rollElement.style.left = "0px";
			this._rollElementClone.style.left = this._rollElement.offsetWidth + "px";
		}
		else if( this._direction == "right" ) {
			this._rollElement.style.left = "0px";
			this._rollElementClone.style.left = -this._rollElement.offsetWidth + "px";
		}
		
		if( this._delay == 0 ) {
			this._timerId = setInterval( marquee, this._speed );
		}
		else {
			setTimeout( rollPlay, this._delay );
		}
		
		util.addEvent( this._container, "mouseover", util.bind( function() {
			if( this._delay == 0 ) {
				clearInterval( this._timerId );
			}
			else {
				this._isStopLoop = true;
			}
		}, this ) );

		util.addEvent( this._container, "mouseout", util.bind( function() {
			if( this._delay == 0 ) {
				this._timerId = setInterval( marquee, this._speed );
			}
			else {
				this._isStopLoop = false;
				setTimeout( rollPlay, this._delay );
			}
		}, this ) );
	}

	LoopRoll.prototype._marquee = function() {
		if( this._direction == "up" ) {
			if( this._rollElement.offsetHeight - this._container.scrollTop <= 0 ) {
				this._container.scrollTop -= this._rollElement.offsetHeight;
			}
			else {
				this._container.scrollTop += this._rollPixel;
			}
		}
		else if ( this._direction == "down" ) {
			this._rollElement.style.top = util.css( this._rollElement, "top" ) + this._rollPixel + "px";
			this._rollElementClone.style.top = util.css( this._rollElementClone, "top" ) + this._rollPixel + "px";
			if( util.css( this._rollElement, "top" ) == 0 ) {
				this._rollElementClone.style.top = -this._rollElement.offsetHeight + "px";
			}
			if( util.css( this._rollElementClone, "top" ) == 0 ) {
				this._rollElement.style.top = -this._rollElement.offsetHeight + "px";
			}
		}
		else if( this._direction == "left" ) {
			if( this._rollElement.offsetWidth - this._container.scrollLeft <= 0 ) {
				this._container.scrollLeft -= this._rollElement.offsetWidth;
			}
			else {
				this._container.scrollLeft += this._rollPixel;
			}
		}
		else if ( this._direction == "right" ) {
			this._rollElement.style.left = util.css( this._rollElement, "left" ) + this._rollPixel + "px";
			this._rollElementClone.style.left = util.css( this._rollElementClone, "left" ) + this._rollPixel + "px";
			if( util.css( this._rollElement, "left" ) == 0 ) {
				this._rollElementClone.style.left = -this._rollElement.offsetWidth + "px";
			}
			if( util.css( this._rollElementClone, "left" ) == 0 ) {
				this._rollElement.style.left = -this._rollElement.offsetWidth + "px";
			}
		}
	}

	LoopRoll.prototype._rollPlay = function() {
		var end = util.bind( function() {
			if( !this._isStopLoop ) {
				setTimeout( util.bind( this._rollPlay, this ), this._delay );
			}
		}, this );

		if( this._direction == "up" ) {
			var top = this._container.scrollTop;
			var run = util.bind( function (progress) {
				this._container.scrollTop = ( top + parseInt( progress * this._rollPixel , 10 ) ) % this._rollElement.offsetHeight;
			}, this);

			animate( run, end, this._speed );
		}
		else if( this._direction == "down" ) {
			var rollElementTop = util.css( this._rollElement, "top" );
			var rollElementCloneTop = util.css( this._rollElementClone, "top" );
			var distance = this._rollPixel;
			var viewPortHeight = this._container.clientHeight;

			if( rollElementTop >= viewPortHeight ) {
				this._rollElement.style.top = -this._rollElement.offsetHeight + rollElementCloneTop + "px";
			}

			if( rollElementCloneTop >= viewPortHeight ) {
				this._rollElementClone.style.top = -this._rollElement.offsetHeight + util.css( this._rollElement, "top" ) + "px";
			}
			
			rollElementTop = util.css( this._rollElement, "top" );
			rollElementCloneTop = util.css( this._rollElementClone, "top" );

			var run = util.bind( function (progress) {
				var stepDistance = parseInt( distance * progress, 10 );
				this._rollElement.style.top = rollElementTop + stepDistance + "px";
				this._rollElementClone.style.top = rollElementCloneTop + stepDistance + "px";
			}, this);

			animate( run, end, this._speed );
		}
		else if( this._direction == "left" ) {
			var left = this._container.scrollLeft;
			var run = util.bind( function (progress) {
				this._container.scrollLeft = ( left + parseInt( progress * this._rollPixel , 10 ) ) % this._rollElement.offsetWidth;
			}, this);

			animate( run, end, this._speed );
		}
		else if( this._direction == "right" ) {
			var rollElementLeft = util.css( this._rollElement, "left" );
			var rollElementCloneLeft = util.css( this._rollElementClone, "left" );
			var distance = this._rollPixel;
			var viewPortWidth = this._container.clientWidth;

			if( rollElementLeft >= viewPortWidth ) {
				this._rollElement.style.left = -this._rollElement.offsetWidth + rollElementCloneLeft + "px";
			}

			if( rollElementCloneLeft >= viewPortWidth ) {
				this._rollElementClone.style.left = -this._rollElement.offsetWidth + util.css( this._rollElement, "left" ) + "px";
			}
			
			rollElementLeft = util.css( this._rollElement, "left" );
			rollElementCloneLeft = util.css( this._rollElementClone, "left" );

			var run = util.bind( function (progress) {
				var stepDistance = parseInt( distance * progress, 10 );
				this._rollElement.style.left = rollElementLeft + stepDistance + "px";
				this._rollElementClone.style.left = rollElementCloneLeft + stepDistance + "px";
			}, this);

			animate( run, end, this._speed );
		}
	}

	var util = {
		isElement: function( obj ) {
			return ( obj && obj.nodeType && obj.nodeType === 1 ) ? true : false;
		},

		isFunction: function( obj ) {
			return Object.prototype.toString.call(obj) == "[object Function]";
		},

		bind: function(func, context){
			if (Function.prototype.bind) {
				return func.bind(context);
			}
			else {
				return function(){
					return func.apply(context, Array.prototype.slice.call(arguments, 0));
				};
			}
		},

		addEvent: function(elem, type, func) {
			if(elem.attachEvent){
				elem.attachEvent("on" + type, func);
			}
			else if(elem.addEventListener){
				elem.addEventListener(type, func, false);
			}
		},
		
		removeEvent: function(elem, type, func) {
			if(elem.attachEvent){
				elem.detachEvent("on" + type, func);
			}
			else if(elem.removeEventListener){
				elem.removeEventListener(type, func);
			}
		},

		getComputedStyle: function( el, name ) {
			if( el.style && el.style[name] ){
				return el.style[name];
			}
			else if( el.currentStyle ) {
				return el.currentStyle[name];
			}
			else if( document.defaultView && document.defaultView.getComputedStyle ){
				var rupper = /([A-Z]|^ms)/g;
				name = name.replace( rupper, "-$1" ).toLowerCase();
				var ret = document.defaultView.getComputedStyle( el, null );
				return ret && ret.getPropertyValue( name );
			}
			return null;
		},

		css: function( elem, name, value ) {
			if( value !== undefined ) {
				elem.style[name] = value;
			}
			else{
				var result = this.getComputedStyle( elem, name );
				var IntValue = ["top", "left", "bottom", "right"];
				return IntValue.indexOf(name) != -1 ? parseInt( result, 10 ) : result;
			}
		}
	}

	window["LoopRoll"] = window.LoopRoll || LoopRoll; 
})( window );