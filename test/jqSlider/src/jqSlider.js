(function ($) {
    "use strict"
    
	var Slider = function (el, options) {
	
		var defaults = {
            speed: 600,
			delay: 5000,
			item: ".slider-item",
            animation: "fade",
            startIndex: 0
        };
		
		options = $.extend(defaults, options);
		this._init(el, options);
		return this;
	}
	
	Slider.prototype = {
    
		constructor: Slider,
		
		_init: function(el, options) {
            var self = this;
            this._el = $(el);
			this._options = options;
			this._showItemIndex = options.startIndex;
			this._totalItem = $(options.item).length;
            
            if (this._totalItem <= 0) {
                return this;
            }
            
            if (options.animation === "fade") {
                $(".slider-item").css("marginRight", "-100%").slice(1).css("opacity", 0);
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
                self.to();
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
            this.stop().to(index);
            return this;
        },
        
        previous: function() {
            var index = this._showItemIndex - 1;
            index = index < 0 ? (this._totalItem - 1) : index;
            this.stop().to(index);
            return this;
        },
        
        to: function(toIndex) {
            var self = this;
            var index = self._showItemIndex,
                totalItem = self._totalItem;
            toIndex = toIndex !== undefined ? toIndex % totalItem : (index + 1) % totalItem;
            
            if (!$(".slider-item").eq(index).queue("fx").length) {
                $(".slider-item").eq(index).animate(
                    {opacity: 0},
                    {duration: self._options.speed}
                );
                
                $(".slider-item").eq(toIndex).animate(
                    {opacity: 1},
                    {
                        duration: self._options.speed,
                        complete: function() {
                            self._showItemIndex = toIndex;
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