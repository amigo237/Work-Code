(function(window) {
    
    /*监听事件*/
    function addMouseScrollListener(element, callback) {
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
    function removeMouseScrollListener(element, callback) {
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
    function getEventObject(event) {
        var originalEvent = event ? event : window.event;

        var event = {
            originalEvent: originalEvent,
            target: originalEvent.target || originalEvent.srcElement,
            type  : "mousewheel",
            delta : 0,
            //deltaX: 0,
            //deltaY: 0,
            wheelDelta: 0,
            preventDefault: function() {
                originalEvent.preventDefault ?
                originalEvent.preventDefault() :
                originalEvent.returnValue = false;
            }
        };
        
        //delta > 0:往上滚, delta < 0:往下滚, 值越大或者越小表示滚动的幅度越大
        event.delta = originalEvent.wheelDelta ? (originalEvent.wheelDelta / 120) : (- originalEvent.detail / 3);
        event.wheelDelta = originalEvent.wheelDelta ? originalEvent.wheelDelta : (originalEvent.detail * -40);
        return event;
    }
    
    /*获取鼠标滚动wheelDelta值*/
    function getWheelDelta(event){
        return getEventObject(event).wheelDelta;
    }

    var MouseScroll = {
        addMouseScrollListener    : addMouseScrollListener,
        removeMouseScrollListener : removeMouseScrollListener,
        getEventObject            : getEventObject,
        getWheelDelta             : getWheelDelta
    };

    window["MouseScroll"] = window.MouseScroll || MouseScroll;
})(window);