/*!
 * Pagination v1.0.0
 * Copyright (c) 2011, in shenzhen. luzhao@xunlei.com
 */
 
(function(win) {
	var doc = win.document;
	var FRONTPAGE = -5,
		PREPAGE   = -4,
		NEXTPAGE  = -3,
		LASTPAGE  = -2;

	var Pagination = function (options) {
		if (!options.total || !options.el || !options.el.nodeType) {
			throw new Error("Missing parameter");
			return this;
		}
		if (!(this instanceof Pagination)) {
			var obj = new Pagination(options);
			return obj;
		}
		options = options || {};
		this._pagenum = options.pagenum || 10;
		this._total = options.total;
		this._el = options.el;
		//防止用户一直在同一个地方不停的调用构造函数初始化化事件
		this._el.onclick = null;
		//当前选中页
		this._currentpage = options.currentPage || 1;
		//规定分页一共显示多少页,至少显示3个
		this._showPageNum = (options.showPageNum && options.showPageNum >= 3) ? options.showPageNum : 5;				
		this._callback = options.callback || function(){};
		this._totalpage = Math.ceil(this._total/this._pagenum);
		if(this._showPageNum > this._totalpage) {
			this._showPageNum = this._totalpage;
		}
		//当前分页中的最大页
		this._currentMaxPage = 0;		
		//当前分页中的最小页	
		this._currentMinPage = 0;
		//步长
		this._moveStepSize = options.moveStepSize || 3;
		this._moveStepSize = this._moveStepSize > this._showPageNum ? this._showPageNum - 1 : this._moveStepSize;
		this._init();
		if(this._currentpage !== 1) {
			this._freshUI(this._currentpage);
		}
	}
	
	Pagination.prototype._gotoPage = function(clickpage, tarObj) {
		var tarpage = 0;
		if (clickpage == this._currentpage) {
			return;
		}
		if (clickpage == NEXTPAGE) {
			tarpage = this._currentpage + 1;
			if (tarpage > this._totalpage || tarpage == this._currentpage)
				return;
		}
		else if (clickpage == PREPAGE) {
			tarpage = this._currentpage - 1;
			if(tarpage < 1 || tarpage == this._currentpage)
				return;
		}
		else if (clickpage == FRONTPAGE){
			tarpage = 1;
			if(tarpage == this._currentpage)
				return;
		}
		else if (clickpage == LASTPAGE){
			tarpage = this._totalpage;
			if(tarpage == this._currentpage)
				return;
		}
		else{
			tarpage = clickpage;
		}
		this._currentpage = tarpage;
		if (util.isNumber(tarpage)) {
			this._callback(tarpage);
		}
		this._freshUI(tarpage);
	}
	
	Pagination.prototype._init = function(){
		var obj = this._el;
		var self = this;
		var content = "<span id='pagination-page'>";
		this._currentMinPage = this._currentpage;
		var i = (this._currentpage + this._showPageNum) > this._totalpage ? this._totalpage - this._showPageNum + 1 : this._currentpage;
		for (var j = i + this._showPageNum; i < j; i++) {
			if (i == this._currentpage) {
				content +=  "<a data-page='" + i + "' href='javascript:void(0)' class='on'>" + i + "</a>";
			}
			else {
				content +=  "<a data-page='" + i + "' href='javascript:void(0)'>" + i + "</a>";
			}
		}
		this._currentMaxPage = i - 1;
		content +=  "</span>";
		content +=  "<a data-page='" + NEXTPAGE + "' href='javascript:void(0)'>下一页</a>";
		content +=  "<a data-page='" + LASTPAGE + "' href='javascript:void(0)'>末页</a>" + "<strong>共" + this._totalpage + "页</strong>";
		content += "</div>";
		content = "<a data-page='" + PREPAGE + "' href='javascript:void(0)'>上一页</a>".concat(content);
		content = "<a data-page='" + FRONTPAGE + "' href='javascript:void(0)'>首页</a>".concat(content);
		content = "<div class='pagination'>".concat(content);
		obj.innerHTML = content;
		// util.addEvent(this._el, "click", function(e){
			// e = e || window.event;
			// var tar = util.getTarget(e);
			// var page = parseInt(tar.getAttribute("data-page"), 10);
			// if ( Object.prototype.toString.call(page) === "[object Number]") {
				// self._gotoPage(page,tar);
			// }
			// return false;
		// });
		
		this._el.onclick = function(e) {
			e = e || window.event;
			var tar = util.getTarget(e);
			var page = parseInt(tar.getAttribute("data-page"), 10);
			if (util.isNumber(page) && !util.isNaN(page)) {
				self._gotoPage(page,tar);
			}
			return false;
		};
	}
	
	//点击了页按钮跳转之后，刷新UI
	Pagination.prototype._freshUI = function(tarpage){
		var father = this._el;
		var child = document.getElementById("pagination-page").childNodes;
		var length = child.length;
		if (tarpage > this._currentMinPage && tarpage < this._currentMaxPage) {
			for (var i = 0; i < length; i++) {
				var obj = child[i];
				var text = obj.innerHTML;
				if (child[i].getAttribute("data-page") == tarpage) {
					obj.className = "on";
				}
				else{
					obj.className = "";
				}
			}
		}
		
		//点击的是最左边的最小页或者是首页
		if (tarpage <= this._currentMinPage || tarpage == 1) {
			var startIndex = tarpage - this._moveStepSize;
			while (startIndex < 1){
				startIndex += 1;
			}
			this._currentMinPage = startIndex;		
			for (var i = 0; i < this._showPageNum && i < this._totalpage; i++) {
				var obj = child[i];
				if(typeof obj == 'undefined'){
					break;
				}
				else{
					obj.innerHTML = startIndex;
					if(startIndex == tarpage){
						obj.className = "on";
					}
					else{
						obj.className = "";
					}
					obj.setAttribute("data-page", startIndex);
					startIndex += 1;
				}
			}
			this._currentMaxPage = startIndex - 1;
			return;
		}
		
		//点击的是最右边的最大页或者是末页
		if (tarpage == this._currentMaxPage || tarpage == this._totalpage) {
			var endIndex = tarpage + this._moveStepSize;
			while (endIndex > this._totalpage){
				endIndex -= 1;
			}
			this._currentMaxPage = endIndex;
			for(var i = endIndex - 1, j = this._showPageNum - 1; j >= 0 && i >= 0; i--,j--){
				var obj = child[j];
				if(typeof obj == 'undefined'){
					break;
				}
				else{
					obj.innerHTML = endIndex;
					if (endIndex == tarpage) {
						obj.className = "on";
					}
					else{
						obj.className = "";
					}
					obj.setAttribute("data-page", endIndex);
					endIndex -= 1;
				}
			}
			this._currentMinPage = endIndex + 1;
			return;
		}
	}
	
	Pagination.prototype.rePaint = function(options) {
		options = options || {};
		this._pagenum = options.pagenum || this._pagenum;
		this._total = options.total || this._total;
		this._currentpage = options.currentPage || this._currentpage;
		this._showPageNum = options.showPageNum || this._showPageNum;
		this._callback = options.callback || this._callback;
		this._totalpage = Math.ceil(this._total/this._pagenum);
		if(this._showPageNum > this._totalpage) {
			this._showPageNum = this._totalpage;
		}
		this._moveStepSize = options.moveStepSize || this._moveStepSize;
		this._moveStepSize = this._moveStepSize > this._showPageNum ? this._showPageNum - 1 : this._moveStepSize;
		this._el.innerHTML = "";
		this._el.onclick = null;
		this._init();
		if(this._currentpage !== 1) {
			this._freshUI(this._currentpage);
		}
	}
	
	//util
	var util = {
		addEvent: function(elem, type, func) {
			if(elem.addEventListener){
				elem.addEventListener(type, func, false);
			}
			else if(elem.attachEvent){
				elem.attachEvent("on" + type, func);
			}
		},
		
		removeEvent: function(elem, type, func) {
			if(elem.addEventListener){
				elem.removeEventListener(type, func);
			}
			else if(elem.attachEvent){
				elem.detachEvent("on" + type, func);
			}
		},
		
		getTarget: function(e) {
			return (e && e.target) ? e.target : e.srcElement || document;
		},

		isNumber: function(obj) {
			return Object.prototype.toString.call(obj) === "[object Number]";
		},

		isNaN: function(obj) {
			return this.isNumber(obj) && obj != obj;
		}
	};
	
	window.Pagination = Pagination;
})(window)