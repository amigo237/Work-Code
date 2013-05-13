var MouseScrollEvent = (function(){
	
	/*�����¼�*/
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
	
	/*ȡ���¼�����*/
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
	
	/*��ȡ�¼�����event*/
	function getEventObject(event){
		event = event ? event : window.event;
		if(event.detail && !event.wheelDelta){// firefox
			event.wheelDelta = event.detail * -40;
		}else if(!event.detail && event.wheelDelta){//webkit && IE
			/*��ͼ�޸�webkit�����event���󣬵��ǲ������ã�event.detailʼ��Ϊ0*/
			event.detail = parseInt(event.wheelDelta / -40, 10);
		}else{
			/*
			 * opera��event����ͬʱ֧��detail��wheelDelta��Ϊ�˱�д�����������.
			 * �Ƽ�ʹ���������event�����wheelDelta����,���¹���Ϊ-120�ı���������Ϊ��
			 */
		}
		return event;
	}
	
	/*��ȡ������wheelDeltaֵ*/
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