(function() {
	var doc = document, shade, closeLayer, pop, height, width, 
		alpha = true,
		slide = true,
		inbody = false,
		opacity = 0.5,
		color = "black",
		closeLayerImg = "popup_close_layer.png";

	function getPageViewport() {
		var obj = {};
		obj.toString = function() {
			return this.width + ", " + this.height;
		};
		if (doc.compatMode == "BackCompat") {
			obj.width = doc.body.clientWidth;
			obj.height = doc.body.clientHeight;
		} else {
			obj.width = doc.documentElement.clientWidth;
			obj.height = doc.documentElement.clientHeight;
		}
		return obj;
	}

	function showAnimate(elem, top, left) {
		var startY = top - 25,
			opacity = 0,
			opa, fag;

		elem.style.top = startY + "px";
		elem.style.left = left + "px";
		elem.style.opacity = opacity;

		if (!alpha) {
			elem.style.opacity = 1;
		}
		if (!slide) {
			elem.style.top = top + "px";
		}
		fag = setInterval(function() {
			if (alpha) {
				opacity = opacity + 2;
				opa = opacity / 10;
				opa = (opa > 1 || opa < 0) ? 1 : opa;
				elem.style.opacity = opa;
			}
			if (slide) {
				startY = startY + 5;
				elem.style.top = startY + "px";
			}

			if (startY - top >= 0 || opa >= 1) {
				clearInterval(fag);
			}
		}, 25);
	}
	function hideAnimate(elem) {
		var opacity = elem.style.opacity,
			startY, 
			top, 
			fag, 
			opa; //此变量解决opacity浮点数精度问题

		opacity = parseInt(elem.style.opacity * 10, 10);
		top = parseInt(elem.style.top, 10);
		startY = top - 25;

		fag = setInterval(function() {
			if (alpha) {
				opacity = opacity - 2;
				opa = opacity / 10;
				opa = (opa < 0 || opa > 1) ? 0 : opa;
				elem.style.opacity = opa;
			}

			if (slide) {
				top = top - 5;
				elem.style.top = top + "px";
			}

			if (top - startY <= 0 || opa <= 0) {
				clearInterval(fag);
				shade.style.display = "none";
				pop.style.display = "none";
				closeLayer.style.display = "none";
			}
		}, 25);
	}

	function setPosition(first) {
		var scrollTop, scrollLeft, pageWidth, pageHeight, top, left, pageView = getPageViewport();

		scrollTop = doc.body.scrollTop + doc.documentElement.scrollTop;
		scrollLeft = doc.body.scrollLeft + doc.documentElement.scrollLeft;

		pageWidth = Math.max(doc.body.scrollWidth, doc.documentElement.clientWidth, doc.documentElement.scrollWidth);
		pageHeight = Math.max(doc.body.scrollHeight, doc.documentElement.clientHeight, doc.documentElement.scrollHeight);

		top = ((pageView.height - height) / 2) + scrollTop;
		left = ((pageView.width - width) / 2) + scrollLeft;

		top = parseInt(top, 10);
		left = parseInt(left, 10);

		shade.style.width = pageWidth + "px";
		shade.style.height = pageHeight + "px";
		closeLayer.style.top = scrollTop + "px";

		if (first === true && (alpha || slide)) {
			showAnimate(pop, top, left);
		} else {
			pop.style.top = top + "px";
			pop.style.left = left + "px";
		}
	}

	function addEventListener(element, type, handler) {
		if (element.addEventListener) {
			element.addEventListener(type, handler, false);
		} else if (element.attachEvent) {
			element.attachEvent('on' + type, handler);
		} else {
			element['on' + type] = handler;
		}
	}

	function removeEventListener(element, type, handler) {
		if (element.removeEventListener) {
			element.removeEventListener(type, handler, false);
		} else if (element.detachEvent) {
			element.detachEvent('on' + type, handler);
		} else {
			element['on' + type] = null;
		}
	}
	function isDOM(dom) {
		if (typeof dom == "object" && dom.getElementsByTagName) {
			return true;
		}
		return false;
	}

	function getOffset(pop) {
		return {
			height: Math.max(pop.scrollHeight, pop.clientHeight, pop.offsetHeight),
			width: Math.max(pop.scrollWidth, pop.clientWidth, pop.offsetWidth)
		};
	}

	function setOptions(options) {
		alpha = true;
		slide = true;
		opacity = 0.5;
		color = "black";
		closeLayerImg = "popup_close_layer.png";

		if (typeof options == "object") {
			if (typeof options.opacity == "number") {
				opacity = options.opacity;
			}
			if (typeof options.alpha == "boolean") {
				alpha = options.alpha;
			}
			if (typeof options.slide == "boolean") {
				slide = options.slide;
			}
			if (typeof options.color == "string") {
				color = options.color;
			}
			if (typeof options.closeLayerImg == "string") {
				closeLayerImg = options.closeLayerImg;
			}
		}
	}

	function createCloseLayer() {
		var closeLayer, closeBtn, closeText, cssText = '';

		closeLayer = doc.createElement("div");
		closeBtn = doc.createElement("a");
		closeText = doc.createTextNode("关闭");

		cssText = "cursor:pointer;display:block;height:46px;width:46px;background:url('" + closeLayerImg + "') no-repeat 0px 0px;";
		closeBtn.style.cssText = cssText;
		cssText = "height:46px;line-height:150px;overflow:hidden;position:absolute;right:0px;top:0px;width:46px;z-index:9988;";
		closeLayer.style.cssText = cssText;

		closeBtn.appendChild(closeText);
		closeLayer.appendChild(closeBtn);

		addEventListener(closeBtn, "click", function() {
			popUp.hide();
			return false;
		});

		addEventListener(closeBtn, "mouseover", function(event) {
			var evt = event || window.event;
			var target = evt.target || evt.srcElement;
			target.style.background = "url('" + closeLayerImg + "') -47px 0px";
		});

		addEventListener(closeBtn, "mouseout", function(event) {
			var evt = event || window.event;
			var target = evt.target || evt.srcElement;
			target.style.background = "url('" + closeLayerImg + "') 0px 0px";
		});

		return closeLayer;
	}

	var popUp = {
		show: function(popUp, size, options) {
			var offset = null,
				cssText = "";
			if (isDOM(popUp)) {
				if (popUp !== pop) {
					pop = popUp;
					offset = getOffset(pop);
					height = parseInt(size.height, 10) || offset.height;
					width = parseInt(size.width, 10) || offset.width;
					inbody = false;
				}
				setOptions(options);
			} else {
				return;
			}
			if (!shade) {
				shade = doc.createElement("div");
			}

			if (!closeLayer) {
				closeLayer = createCloseLayer();
			} else {
				closeLayer.style.display = "block";
			}

			cssText += "background-color:" + color + ";opacity:" + opacity + ";filter:alpha(opacity=" + (opacity * 100) + ")";
			cssText += ";position:absolute;left:0px;top:0px;z-index:8888;display:none";
			shade.style.cssText = cssText;

			cssText = "position:absolute;overflow:hidden;z-index:9999;display:none";
			pop.style.cssText = cssText;
			pop.style.height = height + "px";
			pop.style.width = width + "px";

			if (!inbody) {
				doc.body.appendChild(pop);
				doc.body.appendChild(closeLayer);
				doc.body.appendChild(shade);
				inbody = true;
			}
			setTimeout(function() {
				setPosition(true);
				pop.style.display = "block";
				shade.style.display = "block";
			}, 150);

			addEventListener(window, 'resize', setPosition);
			addEventListener(window, 'scroll', setPosition);
		},
		hide: function() {
			if (isDOM(shade)) {
				if (alpha || slide) {
					hideAnimate(pop);
				} else {
					shade.style.display = "none";
					pop.style.display = "none";
					closeLayer.style.display = "none";
				}
				removeEventListener(window, 'resize', setPosition);
				removeEventListener(window, 'scroll', setPosition);
			}
		}
	};

	window.popUp = popUp;
})();