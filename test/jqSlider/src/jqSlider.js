/*!
 * jqSlider v1.0.0
 * Copyright (c) 2013, in shenzhen. luzhao@xunlei.com
 */

(function ($) {
    "use strict"
    
	var Slider = function (el, options) {
	
		var defaults = {
            speed: 600,
			delay: 5000,
			item: ".slider-item",
			container: ".slider-container",
            animation: "fade",
            startIndex: 0,
            complete: $.noop
        };
		
		options = $.extend(defaults, options);
		this._init(el, options);
		return this;
	}
	
	Slider.prototype = {
    
		constructor: Slider,
		
		_init: function(el, options) {
            var self = this,
                items = $(options.item),
                container = $(options.container);
            
            this._el = $(el);
			this._options = options;
			this._showItemIndex = options.startIndex;
			this._totalItem = $(options.item).length;
            
            if (this._totalItem <= 0) {
                return this;
            }
            
            if (options.animation === "fade") {
                items.css({"marginRight" : "-100%", "float" : "left"}).slice(1).css("opacity", 0);
            }
            else if (options.animation === "slide") {
                items.eq(0).css("left", 0);
                items.css("position", "absolute").slice(1).css("left", container.width());
            }
            
			this.play();
            
            this._el.on("mouseenter", function() {
                self.stop();
            })
            .on("mouseleave", function() {
                self.play();
            });
            
            return this;
		},
		
		play: function() {
            var self = this;
            
			this._timerId = setInterval(function() {
                self._to();
			}
			, this._options.delay);
            
            return this;
		},
        
        stop: function() {            
            this._timerId && clearInterval(this._timerId);
            return this;
        },
        
        next: function() {
            var index = (this._showItemIndex + 1) % this._totalItem;
            this.stop()._to(index, true);
            return this;
        },
        
        previous: function() {
            var index = this._showItemIndex - 1;
            index = index < 0 ? (this._totalItem - 1) : index;
            this.stop()._to(index, true);
            return this;
        },
        
        move: function(index) {
        
            //index超过slider的总个人，直接返回
            if (index >= this._totalItem) {
                return this;
            }
            
            //当前显示的slider和将要显示的slider一样则直接返回
            if (index === this._showItemIndex) {
                return this;
            }
            this.stop()._to(index, true);
        },
        
        _to: function(toIndex, isNeedCallPlayFunc) {
            var self = this,
                index = self._showItemIndex,
                totalItem = self._totalItem,
                options = self._options,
                animation = options.animation,
                items = $(options.item),
                cssFrom = {},
                cssTo = {},
                container = $(options.container),
                originalToIndex = toIndex;
                
            toIndex = toIndex !== undefined ? toIndex % totalItem : (index + 1) % totalItem;
            
            if (!items.eq(index).queue("fx").length) {
                if (animation === "fade") {
                    cssFrom["opacity"] = 0;
                    cssTo["opacity"] = 1;
                }
                else if (animation === "slide") {
                    if (index < toIndex || originalToIndex === undefined) {
                        items.eq(toIndex).css("left", container.width());
                        cssFrom["left"] = -container.width();
                        cssTo["left"] = 0;
                    }
                    else {
                        items.eq(toIndex).css("left", -container.width());
                        cssFrom["left"] = container.width();
                        cssTo["left"] = 0;
                    }
                }
                
                items.eq(index).animate(
                    cssFrom,
                    {duration: options.speed}
                );
                
                items.eq(toIndex).animate(
                    cssTo,
                    {
                        duration: options.speed,
                        complete: function() {
                            self._showItemIndex = toIndex;
                            options.complete(self._showItemIndex);
                            isNeedCallPlayFunc && self.play();
                        }
                    }
                );
            }

            return this;
        }
	};
	
	$.fn.jqSlider = function (options) {
	
		this.each(function() {
			var $this = $(this),
				instance;
			
            if (!$this.data("slider")) {
                instance = new Slider($this, options);
                $this.data("slider", instance);
            }
		});
		
		return this;
	}
})(jQuery)