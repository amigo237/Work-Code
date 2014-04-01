;(function (window,document) {
    
    var idReg = /^#.*/,
        classReg = /^\..*/;
    
    $$ = function(selector) {
        if (!(this instanceof $$)) {
            return new $$(selector);
        }
        
        if (typeof selector != "string") {
            throw new Error("selector must be string, not support other type");
        }
        this._init(selector);
    };
    
    $$.prototype = {
        constructor: $$,
        
        _init: function(selector) {
            // if (document.querySelectorAll) {
                // var data = document.querySelectorAll(selector);
                // this.makeArray(data);
            // }
            // else {
                if (idReg.test(selector)) {
                    var el = document.getElementById(selector.substr(1));
                    this.makeArray(el);
                }
                else if (classReg.test(selector)) {
                    this.makeArray(this._getElementsByClass(selector));
                }
            // }
            return this;
        },
        
        _getElementsByClass: function(className){
            var classElements = [],
                elments = document.getElementsByTagName("*"),
                pattern = new RegExp("(^|\\s)" + className.substr(1) + "(\\s|$)");
                
            for (var i = 0, j = elments.length; i < j; i++){
                if (pattern.test(elments[i].className)){   
                    classElements.push(elments[i]);
                }
            }
            return classElements;
        },
        
        _getElementsByAttr: function(attr){
        // /\[([^=]*)attr=attr \]/
            var classElements = [],
                elments = document.getElementsByTagName("*"),
                pattern = new RegExp("(^|\\s)" + className.substr(1) + "(\\s|$)");
                
            for (var i = 0, j = elments.length; i < j; i++){
                if (pattern.test(elments[i].className)){
                    classElements.push(elments[i]);
                }
            }
            return classElements;
        },
        
        makeArray: function(data) {
            if (data && data.length !== undefined) {
                for (var i = 0, j = data.length; i < j; i++) {
                    this[i] = data[i];
                }
                data.length > 0 && (this.length = data.length);
            }
            else {
                if (data) {
                    this[0] = data;
                    this.length = 1;
                }
            }

            return this;
        }
    };
	
    window.$$ = $$;;
})(window, document);