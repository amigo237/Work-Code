/*!
 * LoopRoll v1.0.0
 * Copyright (c) 2011, in shenzhen. luzhao@xunlei.com
 */

(function( window ) {

	/*
	需要滚动的元素最后不要用id属性，因为循环滚动会clone相应的滚动元素，
	如果有id会造成id重复
	*/

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
		this._rollPixel = options.rollPixel || 1;
		this._init();
	};

	LoopRoll.prototype._init = function() {
		if( this._container.style.position == "static" ) {
			this._container.style.position = "relative";
		}

		if( this._rollElement.style.position == "static" ) {
			this._rollElement.style.position == "absolute";
		}

		this._container.style.overflow = "hidden";
		this._rollElementClone = this._rollElement.cloneNode(true);
		this._container.appendChild(this._rollElementClone);
		this._rollElementClone.style.top = this._rollElement.offsetHeight;
		this._rollElement.style.top = "0px";
		this._timerId = setInterval( util.bind( this._marquee, this ), this._speed );

		util.addEvent( this._container, "mouseover", util.bind( function() {
			clearInterval( this._timerId );
		}, this ) );

		util.addEvent( this._container, "mouseout", util.bind( function() {
			this._timerId = setInterval( util.bind( this._marquee, this ), this._speed ); 
		}, this ) );
	}

	LoopRoll.prototype._marquee = function() {
		if( this._rollElement.offsetHeight - this._container.scrollTop <= 0 ) {
			this._container.scrollTop -= this._rollElement.offsetHeight;
		}
		else {
			this._container.scrollTop += this._rollPixel;
		}
	}

	var util = {
		isElement: function( obj ) {
			return ( obj && obj.nodeType && obj.nodeType === 1 ) ? true : false;
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
		}
	}

	window["LoopRoll"] = window.LoopRoll || LoopRoll; 
})( window );