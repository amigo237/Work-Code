(function( window ) {

	//example url: http://rob:abcd1234@www.example.com/path/index.html?query1=test&silly=willy#test=hash&chucky=cheese
	var urlParse = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/;
		protocol = ,
		port = ,
		tld = ,
		host = ,
		domain = ,
		tld = ,
		path = ,
		file = ,
		filename = ,
		fileext = ,
		hash = ,
		para = ;

	var URLParser = function( url ) {
		if( !( this instanceof URLParser ) ) {
			var obj = new URLParser( url );
			return obj;
		}
		url = url || location.href;
		this.url = url;
		this.domain = this.getDomain();
	};

	URLParser.prototype.getDomain = function() {
		var res = urlParse.exec( this.url );
		Logger.log(res);
		return res[2];
	};
	
	window["URLParser"] = window.URLParser || URLParser; 
})( window );