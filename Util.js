(function(window, document) {
	var Util = {
		//����������ʽ
		//cssText: ��Ҫ�����������ʽ
		//example: importStyle('.login_link_in a { color: #8f8f8f }')
		importStyle: function(cssText) {
			var element = document.createElement('style');
			element.appendChild(document.createTextNode(cssText));
			document.head.appendChild(element);
		}
	};
	
	window["Util"] = window.Util || Util;
})(window, document)