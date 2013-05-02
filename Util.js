(function(window, document) {
	var Util = {
		//����������ʽ
		//cssText: ��Ҫ�����������ʽ
		//example: importStyle('.page-content { width: 600px; margin: 0 auto!important }')
		importStyle: function(cssText) {
			var element = document.createElement('style');
			element.appendChild(document.createTextNode(cssText));
			document.head.appendChild(element);
		}
	};
	
	window["Util"] = window.Util || Util;
})(window, document)