/*
 * 为了方便查看，业务逻辑和封装的类库都放在了一个js里，没有拆分成多个js文件
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
    
    /*
     * Camera类可选设置参数
     * options: {
     *      box:        //包含每帧动画的容器，类型为dom对象,必填
     *      autoPlay:   //初始化完成之后是否自动播放，默认为false，不自动播放
     *      direction:  //摄像头移动的方向，可选参数："down", "up"。默认为"down"，向下移动
     *      isDrag:     //是否需要支持拖拽控制摄像头，默认为false，不需要支持拖拽
     * }
     */
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
                clickFameIndex = null,
                isMouseMove = false;
                
            function mousemoveHandler(e) {
                isMouseMove = true;
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
                isMouseMove = false;

                if (self.index >= (1 + self.totalNum / 2)) {
                    var currentNode = self.node[self.index];
                    var currentFrame = currentNode.getAttribute("data-frame");
                    clickFameIndex = self.index;
                    for (var i = 1, j = self.totalNum / 2; i < j; i++) {
                        var node = self.node[i];
                        if (node.getAttribute("data-frame") == currentFrame) {
                            self.index = i;
                            node.style.display = "";
                            currentNode.style.display = "none";
                            break;
                        }
                    }
                }
                else {
                    clickFameIndex = null;
                }
                U.on(document, "mousemove", mousemoveHandler);
            });
            
            U.on(document, "mouseup", function() {
                if (!isMouseMove) {
                    if (clickFameIndex !== null) {
                        self.node[clickFameIndex].style.display = "";
                        self.node[self.index].style.display = "none";
                        self.index = clickFameIndex;
                    }
                    self.playFrame();
                }
                U.off(document, "mousemove", mousemoveHandler);
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
        // define(function(require, exports, module) {
            // return Camera;
        // });
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