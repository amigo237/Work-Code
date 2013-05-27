( function( window, document ) {
	var Util = {
		/**
		 * importStyle
		 *
		 * 导入行内样式
		 *
		 * @param {String} cssText - 需要导入的行内样式
		 */
		 
		importStyle: function( cssText ) {
			var element = document.createElement( 'style' );
			element.appendChild( document.createTextNode( cssText ) );
			document.head.appendChild( element );
		},

		getBytesLength: function( str ) {
			var len = 0;
			for( var i = 0, j = str.length; i < j; i++ ) {
				str.charCodeAt(i) > 255 ? len += 2 : len += 1;
			}
			return len;
		},

		random: function( min, max ) {
			return min + Math.random() * ( max - min );
		}
	};
	
	window["Util"] = window.Util || Util;
	
})( window, document )