/*!
 * This file copy from jQuery Cookie Plugin v1.3.1, but this is not depend on jQuery.
 *
 * jQuery Cookie Plugin v1.3.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
 
(function(window){
	var pluses = /\+/g;
	
	function raw(s) {
		return s;
	}

	function decoded(s) {
		try {
			s = decodeURIComponent(s.replace(pluses, ' '));
		}
		catch(e){
			s = unescape(s);
		}
		return s;
	}
	
	function converted(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}
		return s;
	}
	
	function extend( des, src ) {
		if( typeof src === "object" ) {
			des = ( des === null || typeof des === "undefined" ) ? {} : des;
			for( var key in src ) {
				if( typeof src[key] === "object" ) {
					 des[key] = extend( des[key], src[key] );
				}
				else {
					des[key] = src[key];
				}
			}
		}
		return des;
	}
	
	var Cookie = {
		config: {
			expires : "",
			path    : "",
			domain  : "",
			secure  : false,
			raw     : false
		},
		
		set: function( key, value, options ) {
			options = extend( extend( {}, this.config ), options );

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			return (document.cookie = [
				options.raw ? key : encodeURIComponent(key),
				'=',
				options.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '',
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
			
			return this;
		},
		
		get: function(key) {
			var decode = this.config.raw ? raw : decoded;
			var cookies = document.cookie.split('; ');
			var result = key ? undefined : {};
			for (var i = 0, l = cookies.length; i < l; i++) {
				var parts = cookies[i].split('=');
				var name = decode(parts.shift());
				var cookie = decode(parts.join('='));

				if (key && key === name) {
					result = converted(cookie);
					break;
				}

				if (!key) {
					result[name] = converted(cookie);
				}
			}

			return result;
		},
		
		remove: function(name) {
			this.set( name, "", {expires: -1} );
			return this;
		},
		
		clear: function() {
			
		}
	};
	
	window["Cookie"] = window.Cookie || Cookie; 
})(window);