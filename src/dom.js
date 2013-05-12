(function( window ) {
	var Dom = {
		id: function(id) {
			return document.getElementById(id);
		},

		scrollLeft: function( elem ) {
			return elem ? elem.scrollLeft : Math.max( window.pageXOffset || 0, document.body.scrollLeft, document.documentElement.scrollLeft );
		},

		scrollTop: function( elem ) {
			return elem ? elem.scrollTop : Math.max( window.pageYOffset || 0, document.body.scrollTop, document.documentElement.scrollTop );
		},

		scrollOffset: function( elem ) {
			return {
				x: this.scrollLeft( elem ),
				y: this.scrollTop( elem )
			}
		},

		viewportWidth: function(viewport) {
			var width = document.documentElement && document.documentElement.clientWidth;
			return viewport ? viewport.clientWidth : ( document.compatMode === "CSS1Compat" && width || document.body.clientWidth || width );
		},

		viewportHeight: function(viewport) {
			var height = document.documentElement && document.documentElement.clientHeight;
			return viewport ? viewport.clientHeight : ( document.compatMode === "CSS1Compat" && height || document.body.clientHeight || height );
		},

		viewportSize: function(viewport) {
			return {
				width : this.viewportWidth(viewport),
				height: this.viewportHeight(viewport)
			}
		},

		isInViewport: function( elem, container, threshold ) {
			container = container || document.body;
			threshold = threshold || 0;
			var rect = elem.getBoundingClientRect();
			var pos = {
				x: rect.left + this.scrollLeft(),
				y: rect.top + this.scrollTop()
			}

			var viewport = {
				x: 0,
				y: 0
			}

			var viewportWidth, viewportHeight;

			if( container === document.body ) {
				viewportWidth = this.viewportWidth();
				viewportHeight = this.viewportHeight();
				viewport.x += this.scrollLeft() + viewportWidth;
				viewport.y += this.scrollTop() + viewportHeight;
			} 
			else {
				viewportWidth = this.viewportWidth(container);
				viewportHeight = this.viewportHeight(container);
				var containerRect = container.getBoundingClientRect();
				viewport.x += this.scrollLeft() + viewportWidth + containerRect.left;
				viewport.y += this.scrollTop() + viewportHeight + containerRect.top;
			}
			//Logger.log("元素距离页面顶部的距离：" + pos.y);
			//Logger.log("元素距离页面顶部的距离加上元素的高度：" + (pos.y + elem.clientHeight));
			//Logger.log("容器距离页面顶部的距离：" + viewport.y);
			//Logger.log(viewport);
			//Logger.log(this.scrollTop());

			return ( pos.y + threshold ) <= viewport.y && ( pos.y + elem.clientHeight - threshold) >= ( viewport.y - viewportHeight ) && ( pos.x + threshold ) <= viewport.x && ( pos.x + elem.clientWidth - threshold ) >= ( viewport.x - viewportWidth );
		},

		bind: function( elem, type, callback ) {
			window.addEventListener ? elem.addEventListener( type, callback ) : elem.attachEvent("on" + type, callback );
		}
	};
	
	window["Dom"] = window.Dom || Dom; 
})(window);