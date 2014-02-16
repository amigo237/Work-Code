﻿/*
 *
 * 为了方便查看，业务逻辑和封装的类库都放在了一个js里，没有拆分成多个js文件
 *
 */

//Camera类和Util类
;(function(global) {
    var U,Util;
    
    U = Util = {
        id: function(id) {
            return document.getElementById(id);
        },
        
        on: function(dom, type, callback) {
            if (document.addEventListener) {
                dom.addEventListener(type, callback, false);
            }
            else {
                dom.attachEvent("on" + type, callback);
            }
            return this;
        },
        
        off: function(dom, type, callback) {
            if (document.addEventListener) {
                dom.removeEventListener(type, callback, false);
            }
            else {
                dom.detachEvent("on" + type, callback);
            }
            return this;
        },
        
        preventDefault: function(e) {
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        }
    };
    
    var Camera = function(options) {
        if (!(this instanceof Camera)) {
            return new Camera(options);
        }
        
        options = options || {};
        
        if (!options.box) {
            throw new Error("missing parameter box");
        }
        
        this.box = options.box;
        this.autoPlay = options.autoPlay || false;
        this.direction = options.direction || "down";
        this.isDrag = options.isDrag || false;
        this.index = 0;
        this.node = [];
        this.timer = null;
        this.isPlay = false;
        
        for (var i = 0, node = this.box.childNodes, j = node.length; i < j; i++) {
            if (node[i].nodeType === 1) {
                node[i].style.display = "none";
                this.node.push(node[i]);
            }
        }
        this.totalNum = this.node.length;
        this.node.length > 0 && (this.node[0].style.display = "");
        this._init();
    };
    
    Camera.prototype = {
        constructor: Camera,
        
        _init: function() {
            if (this.isDrag) {
                this._initDrag();
            }
            if (this.autoPlay) {
                this.play();
            }
        },
        
        _initDrag: function() {
            var self = this,
                originalY, 
                checkMousemove = false, 
                initialDirection;
                
            function mousemoveHandler(e) {
                e = e || window.event;
                var distance = Math.abs(originalY - e.screenY);
                if (distance > 5) {
                    var direction = originalY - e.screenY < 0 ? "down" : "up";
                    self.direction = direction;
                    var times = Math.floor(distance / 5);
                    originalY = e.screenY;
                    var timer = setInterval(function() {
                        times > 0 ? self.playFrame(): clearInterval(timer);
                        times--;
                    }, 20);
                }
                U.preventDefault(e);
            };
            
            U.on(this.box, "mousedown", function(e) {
                self.stop();
                e = e || window.event;
                originalY = e.screenY;
                checkMousemove = false;
                U.on(document, "mousemove", mousemoveHandler);
            });
            
            U.on(document, "mouseup", function() {
                U.off(document, "mousemove", mousemoveHandler);
            });
            
            U.on(this.box, "click", function() {
                self.stop();
                self.playFrame();
                return false;
            });
        },
        
        play: function() {
            var self = this;
            this.stop();
            this.isPlay = true;
            this.timer = setInterval(function() {
                self.playFrame();
            }, 1000/25);
        },
        
        stop: function() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            this.isPlay = false;
        },
        
        playFrame: function() {
            var self = this,
                index = this.index;
            this.node[index].style.display = "none";
            if (this.direction === "down") {
                index = (index + 1) % this.totalNum;
            }
            else {
                index = index <= 0 ? this.totalNum - 1 : index - 1;
            }
            this.index = index;
            this.node[this.index].style.display = "";
        }
    };
    
    if ("function" == typeof define && define.amd) {
        //如果有用AMD或者CMD等模块化类库，应该要把Util拆成一个模块，这儿为了方便没有拆分
        define(function(require, exports, module) {
            return Camera;
        });
    }
    else {
        global.Camera = Camera;
        global.U = U;
    }
})(window);


//和页面相关的具体逻辑
;(function(global) {
    var cameraBox = U.id("cameraBox");
    var playBtn = U.id("playBtn");
    var camera = Camera({
        box: cameraBox,
        autoPlay: false,
        isDrag: true
    });
    
    var Controller = {
        init: function() {
            this.bindEventHandlers();
        },

        bindEventHandlers: function() {
            U.on(playBtn, "click", function() {
                if (camera.isPlay) {
                    camera.stop();
                }
                else {
                    camera.play();
                }
                return false;
            });
        }
    }

    //页面入口
    Controller.init();
})(window);