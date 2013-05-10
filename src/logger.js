(function(window){
	var console = window.console;
	
	var Logger = new function(){
		this.isDebug = false;

		this.log = function() {
			if ( this.isDebug ) {
				var params = ( 1 == arguments.length ) ? arguments[0] : arguments;
				console && console.dir ? console.dir( params ) : alert( params );
			}
			return this;
		};

		this.error = function() {
			if ( this.isDebug ) {
				var params = ( 1 == arguments.length ) ? arguments[0] : arguments;
				console && console.error ? console.error( params ) : this.log( params );
			}
			return this;
		};

		this.warning = function() {
			if ( this.isDebug ) {
				var params = ( 1 == arguments.length ) ? arguments[0] : arguments;
				console && console.warn ? console.warn( params ) : this.log( params );
			}
			return this;
		};

		this.startTime = function() {
			if ( this.isDebug && arguments[0] ) {
				console && console.time && console.time( arguments[0] );
			}
			return this;
		};

		this.stopTime = function() {
			if ( this.isDebug && arguments[0] ) {
				console && console.timeEnd && console.timeEnd( arguments[0] );
			}
			return this;
		};

		this.trace = function() {
			if ( this.isDebug ) {
				console && console.trace && console.trace();
			}
			return this;
		};
	};

	window["Logger"] = window.Logger || Logger;
})(window);