/*
 * This plugin uses Steven Levithan's excellent Regex URI parser.
 * http://blog.stevenlevithan.com/archives/parseuri
 */

(function( window ) {

	function httpBuildQuery( data ) {
		var arr = [];
		for(var key in data) {
			arr.push( key + "=" + data[key] );
		}
		return arr.join("&");
	}

	//example url: http://amigo237:abc123@www.example.com/path/index.html?name=amigo237&sex=m#test=hash&age=25
	var URLParser = function( url ) {
		if( !( this instanceof URLParser ) ) {
			var obj = new URLParser( url );
			return obj;
		}
		url = url || location.href;
		this.url = url;
		this.parse();
	};

	URLParser.options = {
		strictMode: false,
		key: ["source","protocol","authority","userInfo","user","password","domain","port","relative","path","directory","file","query","anchor"],
		query: /(?:^|&)([^&=]*)=?([^&]*)/g,
		parser: {
			strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
			loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
		}
	};

	URLParser.prototype.parse = function( url ) {
		url = url || this.url;
		var	option = URLParser.options,
			model = option.parser[option.strictMode ? "strict" : "loose"].exec(url),
			i = 14;

		while( i-- ) {
			this[option.key[i]] = model[i] || "";
		}
	};

	URLParser.prototype.getQueryData = function( key ) {
		var queryData = {};
		this.query.replace( URLParser.options.query, function( $0, $1, $2 ) {
			if($1) {
				queryData[$1] = $2;
			} 
		});
		return key ? queryData[key] : queryData;
	};

	URLParser.prototype.getHashData = function( key ) {
		var hashData = {};
		this.anchor.replace(URLParser.options.query, function( $0, $1, $2 ) {
			if($1) {
				hashData[$1] = $2;
			} 
		});
		return key ? hashData[key] : hashData;
	};
	
	URLParser.prototype.setQuery = function( data ) {
		var queryData = this.getQueryData();
		var isQueryDataChange = false,
			queryString;

		for(var key in data) {
			if( data[key] !== queryData[key] ) {
				queryData[key] = data[key];
				isQueryDataChange = true;
			}
		}

		if(isQueryDataChange) {
			queryString = httpBuildQuery(queryData);
			if( this.query !== "" ) {
				var queryReg = /\?([^#]*)/;
				this.url = this.url.replace( queryReg, "?" + queryString );
			}
			else {
				this.url = this.url + "?" + queryString;
			}
			this.parse();
		}
		return this;
	}

	URLParser.prototype.setHash = function( data ) {
		var hashData = this.getHashData();
		var isHashDataChange = false,
			hashString;

		for(var key in data) {
			if( data[key] !== hashData[key] ) {
				hashData[key] = data[key];
				isHashDataChange = true;
			}
		}

		if(isHashDataChange) {
			hashString = httpBuildQuery(hashData);
			if( this.anchor !== "" ) {
				var hashReg = /#(.*)/;
				this.url = this.url.replace( hashReg, "#" + hashString );
			}
			else {
				this.url = this.url + "#" + hashString;
			}
			this.parse();
		}
		return this;
	}

	window["URLParser"] = window.URLParser || URLParser;
})( window );