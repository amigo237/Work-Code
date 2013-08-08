(function ($) {
    "use strict"
    
	var Slider = function (el, options) {
	
		var defaults = {
            speed: 600,
			delay: 5000,
			item: ".slider-item",
            animation: "fade"
        };
		
		options = $.extend(defaults, options);
		this._init(el, options);
		return this;
	}
	
	Slider.prototype = {
    
		constructor: "Slider",
		
		_init: function(el, options) {
			var self = this;
            this._el = $(el);
			this._options = options;
			this._showItemIndex = options.startIndex || 0;
			this._totalItem = $(options.item).length;
            
            if (options.animate === "fade") {
                $(".slider-item").css("marginRight", "-100%").slice(1).css("opacity", 0);
            }
            
			this.play();
            
            this._el.on("mouseenter", function() {
                self.pause();
            })
            .on("mouseleave", function() {
                self.play();
            });
		},
		
		play: function() {
            var self = this;
                
			this.timerId = setInterval(function() {
                var index = self._showItemIndex,
                    totalItem = self._totalItem;
                    
				$(".slider-item").eq(index).animate({
                    opacity: 0
                },
                {
                    duration: self._options.speed,
                    complete: function() {
                        
                    }
                });
                
                $(".slider-item").eq((index + 1) % totalItem).animate({
                    opacity: 1
                },
                {
                    duration: self._options.speed,
                    complete: function() {
                        self._showItemIndex = (index + 1) % totalItem;
                    }
                });
			}
			, this._options.delay);
		},
        
        pause: function() {
            this.timerId && clearInterval(this.timerId);
        },
        
        next: function() {
        
        },
        
        previous: function() {
            
        }
	};
	
	$.fn.jqSlider = function (options) {
	
		this.each(function() {
			var $this = $(this),
				instance = new Slider($this, options);
				
			$this.data("slider", instance);
		});
		
		return this;
	}
})(jQuery)