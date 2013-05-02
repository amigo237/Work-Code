(function(window, document) {
	var Util = {
		//导入行内样式
		//cssText: 需要导入的行内样式
		//example: importStyle('.page-content { width: 600px; margin: 0 auto!important }')
		importStyle: function(cssText) {
			var element = document.createElement('style');
			element.appendChild(document.createTextNode(cssText));
			document.head.appendChild(element);
		}
	};
	
	window["Util"] = window.Util || Util;
})(window, document)