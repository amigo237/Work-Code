(function(window, document) {
	var Util = {
		//导入行内样式
		//cssText: 需要导入的行内样式
		//example: importStyle('.login_link_in a { color: #8f8f8f }')
		importStyle: function(cssText) {
			var element = document.createElement('style');
			element.appendChild(document.createTextNode(cssText));
			document.head.appendChild(element);
		}
	};
	
	window["Util"] = window.Util || Util;
})(window, document)