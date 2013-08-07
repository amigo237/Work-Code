/*!
 * jqCrossDomain v1.0.0
 * Copyright (c) 2013, in shenzhen. luzhao@xunlei.com
 */
 
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';

	var counter = 0;
	if (!$.support.cors) {
		$.postForm =  function (options) {
			if (!options.url) {
				throw new Error("非法url");
			}
			
			var data = options.data || {};
			if (!$.isPlainObject(data)) {
				throw new Error("非法数据");
			}

			var url = options.url,
				success = $.isFunction(options.success) ? options.success : $.noop(),
				error = $.isFunction(options.error) ? options.error : $.noop();
			var form, iframe, addParamChar;
			
			form = $('<form style="display:none;"></form>');
			addParamChar = /\?/.test(options.url) ? '&' : '?';
			counter += 1;
			iframe = $('<iframe src="javascript:false;" name="iframe-transport-' + counter + '" style="display:none;" scrolling="no" frameborder="0"></iframe>');
		
			$.each(data, function(key, value) {
				$('<input name="' + key + '" type="text" value="' + value + '" />').appendTo(form);
			});
			
			if (options.redirect) {
				$('<input name="redirect" type="text" value=' + options.redirect + ' />').appendTo(form);
			}
			
			form.prop("target", iframe.prop("name"))
				.prop("action", options.url)
				.prop("method", "post")
				.append(iframe)
				.appendTo(document.body);
			
			iframe.unbind('load').bind('load', function () {
				var response;
				try {
					response = iframe.contents();
					if (!response.length || !response[0].firstChild) {
						throw new Error();
					}
				} catch (e) {
					response = undefined;
				}
				if (response === undefined) {
					error();
				}
				else {
					success($.parseJSON(decodeURIComponent(iframe.get(0).contentWindow.location.search.slice(1))));
				}

				// Fix for IE endless progress bar activity bug
				// (happens on form submits to iframe targets):
				$('<iframe src="javascript:false;"></iframe>').appendTo(form);
				window.setTimeout(function () {
					form.remove();
				}, 0);
			})
			.bind("error abort", function() {
				if (iframe) {
					iframe.unbind('load')
						  .prop('src', 'javascript'.concat(':false;'));
					}
					if (form) {
						form.remove();
					}
			});
			
			form.submit();
		};
	}
	else {
		$.postForm = $.ajax;
	}
}));
