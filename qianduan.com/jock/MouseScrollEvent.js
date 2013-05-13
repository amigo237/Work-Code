var MouseScrollEvent = (function(){
	
	/*监听事件*/
	function addMouseScrollListener(element, callback){
		if(element.addEventListener){
			element.addEventListener("DOMMouseScroll", callback, false);
			element.addEventListener("mousewheel", callback, false);
		}else if(element.attachEvent){
			element.attachEvent("onmousewheel", callback);
		}else{
			element.onmousewheel = callback;
		}
	}
	
	/*取消事件监听*/
	function removeMouseScrollListener(element, callback){
		if(element.removeEventListener){
			element.removeEventListener("DOMMouseScroll", callback, false);
			element.removeEventListener("mousewheel", callback, false);
		}else if(element.detachEvent){
			element.detachEvent("onmousewheel", callback);
		}else{
			element.onmousewheel = null;
		}
	}
	
	/*获取事件对象event*/
	function getEventObject(event){
		event = event ? event : window.event;
		if(event.detail && !event.wheelDelta){// firefox
			event.wheelDelta = event.detail * -40;
		}else if(!event.detail && event.wheelDelta){//webkit && IE
			/*企图修改webkit浏览器event对象，但是不起作用，event.detail始终为0*/
			event.detail = parseInt(event.wheelDelta / -40, 10);
		}else{
			/*
			 * opera中event对象同时支持detail和wheelDelta，为了编写跨浏览器代码.
			 * 推荐使用修正后的event对象的wheelDelta属性,向下滚动为-120的倍数，向上为正
			 */
		}
		return event;
	}
	
	/*获取鼠标滚动wheelDelta值*/
	function getWheelDelta(event){
		return getEventObject(event).wheelDelta;
	}

	return {
		addMouseScrollListener    : addMouseScrollListener,
		removeMouseScrollListener : removeMouseScrollListener,
		getEventObject            : getEventObject,
		getWheelDelta             : getWheelDelta
	};

}).call(this);