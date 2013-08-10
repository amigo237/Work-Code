/*!
 * jqValidate v1.0.0
 * Copyright (c) 2013, in shenzhen. luzhao@xunlei.com
 */

(function ($) {
    "use strict"
    
    var numericRegex = /^[0-9]+$/;
        
    var validate = {
        required: function (value) {
            return value !== "" && value !== null;
        },
        
        minLength: function (value, length) {
            if (!numericRegex.test(length)) {
                return false;
            }

            return (value.length >= parseInt(length, 10));
        },
        
        maxLength: function (value, length) {
            if (!numericRegex.test(length)) {
                return false;
            }
            
            return (value.length <= parseInt(length, 10));
        },
    };
    
    $.fn.validate = function (type, condition) {
        var result,
            value = $.trim(this.val()),
            func = validate[type];
        
        if ($.isFunction(func)) {
            result = func(value, condition);
        }
        else {
            throw new Error("can't find this validate type:" + type);
        }
        
        return result;
    };
    
    $.fn.monitor = function (type, condition, error) {
        error = $.isFunction(condition) ? condition : error;
        error = $.isFunction(error) ? error : $.noop;
        
        var typeSeparator = /\s+/,
            $this = this;
        
        this.on("change", function() {
            !$this.validate(type, condition) && error();
        });
        
        return this;
    };
    
    
})(jQuery)