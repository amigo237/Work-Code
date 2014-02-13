(function(global, $) {
    $.fn.drag = function() {
        this.each(function() {
            var $this = $(this),
            x,y,
            originalX, originalY;
        
            function mousemoveHandler(e) {
                $this.css("left", parseFloat(originalX, 10) + (e.pageX - x));
                $this.css("top", parseFloat(originalY, 10) + (e.pageY - y));
            };
            
            $this.on("mousedown", function(e) {
                x = e.pageX;
                y = e.pageY;
                originalX = $this.css("left");
                originalY = $this.css("top");
                $(document).on("mousemove", mousemoveHandler);
            });
            
            $(document).on("mouseup", function() {
                $(document).off("mousemove", mousemoveHandler);
            });
        });
        
        return this;
    };
})(window, jQuery);