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

	function hideString(isShow) {
		return isShow ? "" : "display:none";
	}

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

		//规定分页一共显示多少页,至少显示3个
		this._showPageNum = (options.showPageNum && options.showPageNum >= 3) ? options.showPageNum : 5;

		//是否显示首页，末页两个按钮
		this._isShowFrontPageBtn = options.isShowFrontPageBtn !== undefined ? !!options.isShowFrontPageBtn : true;

		//是否显示总页数
		this._isShowTotalPageText = options.isShowTotalPageText !== undefined ? !!options.isShowTotalPageText : true;

		//点击翻页按钮的回调函数
		this._callback = options.callback || function(){};

		//分页的总页数
		this._totalpage = Math.ceil(this._total/this._pagenum);

		//当前选中页
		this._currentPage = options.currentPage || 1;
		this._currentPage = this._currentPage > this._totalpage ? this._totalpage : this._currentPage;
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
		this._freshUI(this._currentPage);
	}
	
	Pagination.prototype.gotoPage = function(clickpage) {
		var tarpage = 0;
		if (clickpage == this._currentPage) {
			return;
		}
		if (clickpage == NEXTPAGE) {
			tarpage = this._currentPage + 1;
			if (tarpage > this._totalpage || tarpage == this._currentPage)
				return;
		}
		else if (clickpage == PREPAGE) {
			tarpage = this._currentPage - 1;
			if(tarpage < 1 || tarpage == this._currentPage)
				return;
		}
		else if (clickpage == FRONTPAGE){
			tarpage = 1;
			if(tarpage == this._currentPage)
				return;
		}
		else if (clickpage == LASTPAGE){
			tarpage = this._totalpage;
			if(tarpage == this._currentPage)
				return;
		}
		else{
			tarpage = clickpage;
		}
		this._currentPage = tarpage;
		if (util.isNumber(tarpage)) {
			this._callback(tarpage);
		}
		this._freshUI(tarpage);
	}
	
	Pagination.prototype._init = function(){
		var obj = this._el;
		var self = this;
		var content = "";
		content += "<span id='pagination-frontgap' style='display:none'>";
		content += "<a data-page='1' href='javascript:void(0)'>1</a>";
		content += "<a data-page='2' href='javascript:void(0)'>2</a>";
		content += "<span id='pagination-frontgap-ellipsis' class='gap'>...</span>";
		content += "</span>";
		content += "<span id='pagination-page'>";
		var i = (this._currentPage + this._showPageNum) > this._totalpage ? this._totalpage - this._showPageNum + 1 : this._currentPage;
		this._currentMinPage = i;
		for (var j = i + this._showPageNum; i < j; i++) {
			if (i == this._currentPage) {
				content +=  "<a data-page='" + i + "' href='javascript:void(0)' class='on'>" + i + "</a>";
			}
			else {
				content +=  "<a data-page='" + i + "' href='javascript:void(0)'>" + i + "</a>";
			}
		}
		this._currentMaxPage = i - 1;
		content += "</span>";
		content += "<span id='pagination-backgap' style='display:none'>";
		content += "<span id='pagination-backgap-ellipsis' class='gap'>...</span>";
		content += "<a data-page='" + (this._totalpage - 1) + "' href='javascript:void(0)'>" + (this._totalpage - 1) + "</a>";
		content += "<a data-page='" + this._totalpage + "' href='javascript:void(0)'>" + this._totalpage + "</a>";
		content += "</span>";
		content += "<a data-page='" + NEXTPAGE + "' href='javascript:void(0)'>下一页</a>";
		content += "<a data-page='" + LASTPAGE + "' href='javascript:void(0)' style='" + hideString(this._isShowFrontPageBtn) + "'>末页</a>" + "<span style='" + hideString(this._isShowTotalPageText) + "'>共" + this._totalpage + "页</span>";
		content += "</div>";
		content = "<a data-page='" + PREPAGE + "' href='javascript:void(0)'>上一页</a>".concat(content);
		content = "<a data-page='" + FRONTPAGE + "' href='javascript:void(0)' style='" + hideString(this._isShowFrontPageBtn) + "'>首页</a>".concat(content);
		content = "<div class='pagination'>".concat(content);
		obj.innerHTML = content;
		//防止多次重复绑定事件
		this._el.onclick = null;
		this._el.onclick = function(e) {
			e = e || window.event;
			var tar = util.getTarget(e);
			var page = parseInt(tar.getAttribute("data-page"), 10);
			if (util.isNumber(page) && !util.isNaN(page)) {
				self.gotoPage(page);
			}
			return false;
		};
	}
	
	//点击了页按钮跳转之后，刷新UI
	Pagination.prototype._freshUI = function(tarpage) {
		var father = this._el,
			child = util.id("pagination-page").childNodes,
			length = child.length;

		//判断是否要显示最后和最前的几页
		function initPageGap() {
			var frontgap = util.id("pagination-frontgap"),
				backgap = util.id("pagination-backgap"),
				frontEllipsis = util.id("pagination-frontgap-ellipsis"),
				backEllipsis = util.id("pagination-backgap-ellipsis");
			this._currentMinPage <= 2 ? frontgap.style.display = "none" : frontgap.style.display = "inline";
			this._currentMinPage == 3 ? frontEllipsis.style.display = "none" : frontEllipsis.style.display = "inline";
			this._currentMaxPage >= this._totalpage - 1 ? backgap.style.display = "none" : backgap.style.display = "inline";
			this._currentMaxPage + 1 == this._totalpage - 1 ? backEllipsis.style.display = "none" : backEllipsis.style.display = "inline";
		}

		if (tarpage > this._currentMinPage && tarpage < this._currentMaxPage) {
			for (var i = 0; i < length; i++) {
				var obj = child[i];
				if (obj.nodeType !== 1) { 
					break; 
				}
				var text = obj.innerHTML;
				if (child[i].getAttribute("data-page") == tarpage) {
					obj.className = "on";
				}
				else{
					obj.className = "";
				}
			}
			(util.bind(initPageGap, this))();
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
				if (obj.nodeType !== 1 || typeof obj == 'undefined') { 
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
			(util.bind(initPageGap, this))();
			return;
		}
		
		//点击的是最右边的最大页或者是末页
		if (tarpage >= this._currentMaxPage || tarpage == this._totalpage) {
			var endIndex = tarpage + this._moveStepSize;
			while (endIndex > this._totalpage){
				endIndex -= 1;
			}
			this._currentMaxPage = endIndex;
			for(var i = endIndex - 1, j = this._showPageNum - 1; j >= 0 && i >= 0; i--,j--){
				var obj = child[j];
				if (obj.nodeType !== 1 || typeof obj == 'undefined') { 
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
			(util.bind(initPageGap, this))();
			return;
		}
	}
	
	Pagination.prototype.rePaint = function(options) {
		options = options || {};
		this._pagenum = options.pagenum || this._pagenum;
		this._total = options.total || this._total;
		this._currentPage = options.currentPage || this._currentPage;
		this._currentPage = this._currentPage > this._totalpage ? this._totalpage : this._currentPage;
		this._showPageNum = options.showPageNum || this._showPageNum;
		this._callback = options.callback || this._callback;
		this._totalpage = Math.ceil(this._total/this._pagenum);
		if(this._showPageNum > this._totalpage) {
			this._showPageNum = this._totalpage;
		}
		this._moveStepSize = options.moveStepSize || this._moveStepSize;
		this._moveStepSize = this._moveStepSize > this._showPageNum ? this._showPageNum - 1 : this._moveStepSize;
		this._el.innerHTML = "";
		this._init();
		this._freshUI(this._currentPage);
	}
	
	//util
	var util = {
		id: function(id) {
			return document.getElementById(id);
		},

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
		},

		bind: function(func, context){
			if (Function.prototype.bind) {
				return func.bind(context);
			}
			else {
				return function(){
					return func.apply(context, Array.prototype.slice.call(arguments, 0));
				};
			}
		}
	};
	
	window.Pagination = Pagination;
})(window)