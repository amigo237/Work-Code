(function( window ) {
	var Dom = {
		id: function(id) {
			return document.getElementById(id);
		},

		firstElementChild: function( el ) {
			var element = el.firstElementChild,
				childNodes = el.childNodes,
				length = childNodes.length;
			
			for( var i = 0; i < length && !element; i++ ) {
				element = (childNodes[i].nodeType === 1) ? childNodes[i] : null;
			}
			
			return element;
			// children非w3c标准，所以这里不采用
			// return el.firstElementChild || el.children[0];
		},
		
		lastElementChild: function( el ) {
			var element = el.lastElementChild,
				childNodes = el.childNodes,
				length = childNodes.length;
			
			for( var i = length - 1; i > 0 && !element; i-- ) {
				element = (childNodes[i].nodeType === 1) ? childNodes[i] : null;
			}
			return element;
		},
		
		nextElementSibling: function( el ) {
			var element = el.nextElementSibling || el.nextSibling;
			while( element && element.nodeType !== 1 ) {
				element = element.nextSibling;
			}
			return element;
		},
		
		previousElementSibling: function( el ) {
			var element = el.previousElementSibling || el.previousSibling;
			while( element && element.nodeType !== 1 ) {
				element = element.previousSibling;
			}
			return element;
		},
		
		childElementCount: function( el ) {
			var count = el.childElementCount || 0,
				childNodes = el.childNodes,
				length = childNodes.length;
			
			if(!count) {
				for( var i = 0; i < length; i++ ) {
					count = (childNodes[i].nodeType === 1) && (count + 1);
				}
			}
			return count;
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

			var fold = {
				x: 0,
				y: 0
			}

			var viewportWidth, viewportHeight;

			if( container === document.body ) {
				viewportWidth = this.viewportWidth();
				viewportHeight = this.viewportHeight();
				fold.x += this.scrollLeft() + viewportWidth;
				fold.y += this.scrollTop() + viewportHeight;
			} 
			else {
				viewportWidth = this.viewportWidth(container);
				viewportHeight = this.viewportHeight(container);
				var containerRect = container.getBoundingClientRect();
				fold.x += this.scrollLeft() + viewportWidth + containerRect.left;
				fold.y += this.scrollTop() + viewportHeight + containerRect.top;
			}
			//Logger.log("元素距离页面顶部的距离：" + pos.y);
			//Logger.log("元素距离页面顶部的距离加上元素的高度：" + (pos.y + elem.clientHeight));
			//Logger.log("容器距离页面顶部的距离：" + fold.y);
			//Logger.log(fold);
			//Logger.log(this.scrollTop());

			return ( pos.y + threshold ) <= fold.y && ( pos.y + elem.clientHeight - threshold) >= ( fold.y - viewportHeight ) && ( pos.x + threshold ) <= fold.x && ( pos.x + elem.clientWidth - threshold ) >= ( fold.x - viewportWidth );
		},

		bind: function( elem, type, callback ) {
			window.addEventListener ? elem.addEventListener( type, callback ) : elem.attachEvent("on" + type, callback );
		}
	};
	
	window["Dom"] = window.Dom || Dom; 
})(window);