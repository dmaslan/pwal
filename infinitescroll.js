/*
	--------------------------------
	Infinite Scroll
	--------------------------------
	+ https://github.com/paulirish/infinitescroll
	+ version 2.0b2.120311
	+ Copyright 2011 Paul Irish & Luke Shumard
	+ Licensed under the MIT license

	+ Documentation: http://infinite-scroll.com/

*/

(function(a, b, c) {
  b.infinitescroll = function f(a, c, d) {
    this.element = b(d);
    if (!this._create(a, c)) {
      this.failed = true
    }
  };
  b.infinitescroll.defaults = {
    loading: {
      finished: c,
      finishedMsg: "<em>Congratulations, you've reached the end of the internet.</em>",
	img: "https://www.infinite-scroll.com/loading.gif",
      msg: null,
      msgText: "<em>Loading the next set of posts...</em>",
      selector: null,
      speed: "fast",
      start: c
    },
    state: {
      isDuringAjax: false,
      isInvalidPage: false,
      isDestroyed: false,
      isDone: false,
      isPaused: false,
      currPage: 1
    },
    callback: c,
    debug: false,
    behavior: c,
    binder: b(a),
    nextSelector: "div.navigation a:first",
    navSelector: "div.navigation",
    contentSelector: null,
    extraScrollPx: 150,
    itemSelector: "div.post",
    animate: false,
    pathParse: c,
    dataType: "html",
    appendCallback: true,
    bufferPx: 40,
    errorCallback: function() {},
    infid: 0,
    pixelsFromNavToBottom: c,
    path: c
  };
  b.infinitescroll.prototype = {
    _binding: function g(a) {
      var b = this,
        d = b.options;
      d.v = "2.0b2.111027";
      if (!!d.behavior && this["_binding_" + d.behavior] !== c) {
        this["_binding_" + d.behavior].call(this);
        return
      }
      if (a !== "bind" && a !== "unbind") {
        this._debug("Binding value  " + a + " not valid");
        return false
      }
      if (a == "unbind") {
        this.options.binder.unbind("smartscroll.infscr." + b.options.infid)
      } else {
        this.options.binder[a]("smartscroll.infscr." + b.options.infid, function() {
          b.scroll()
        })
      }
      this._debug("Binding", a)
    },
    _create: function h(a, d) {
      var e = b.extend(true, {}, b.infinitescroll.defaults, a);
      if (!this._validate(a)) {
        return false
      }
      this.options = e;
      var f = b(e.nextSelector).attr("href");
      if (!f) {
        this._debug("Navigation selector not found");
        return false
      }
      e.path = this._determinepath(f);
      e.contentSelector = e.contentSelector || this.element;
      e.loading.selector = e.loading.selector || e.contentSelector;
      e.loading.msg = b('<div id="infscr-loading"><img alt="Loading..." src="' + e.loading.img + '" /><div>' + e.loading.msgText + "</div></div>");
      (new Image).src = e.loading.img;
      e.pixelsFromNavToBottom = b(document).height() - b(e.navSelector).offset().top;
      e.loading.start = e.loading.start || function() {
        b(e.navSelector).hide();
        e.loading.msg.appendTo(e.loading.selector).show(e.loading.speed, function() {
          beginAjax(e)
        })
      };
      e.loading.finished = e.loading.finished || function() {
        e.loading.msg.fadeOut("normal")
      };
      e.callback = function(a, f) {
        if (!!e.behavior && a["_callback_" + e.behavior] !== c) {
          a["_callback_" + e.behavior].call(b(e.contentSelector)[0], f)
        }
        if (d) {
          d.call(b(e.contentSelector)[0], f, e)
        }
      };
      this._setup();
      return true
    },
    _debug: function i() {
      if (this.options && this.options.debug) {
        return a.console && console.log.call(console, arguments)
      }
    },
    _determinepath: function j(a) {
      var b = this.options;
      if (!!b.behavior && this["_determinepath_" + b.behavior] !== c) {
        this["_determinepath_" + b.behavior].call(this, a);
        return
      }
      if (!!b.pathParse) {
        this._debug("pathParse manual");
        return b.pathParse(a, this.options.state.currPage + 1)
      } else if (a.match(/^(.*?)\b2\b(.*?$)/)) {
        a = a.match(/^(.*?)\b2\b(.*?$)/).slice(1)
      } else if (a.match(/^(.*?)2(.*?$)/)) {
        if (a.match(/^(.*?page=)2(\/.*|$)/)) {
          a = a.match(/^(.*?page=)2(\/.*|$)/).slice(1);
          return a
        }
        a = a.match(/^(.*?)2(.*?$)/).slice(1)
      } else {
        if (a.match(/^(.*?page=)1(\/.*|$)/)) {
          a = a.match(/^(.*?page=)1(\/.*|$)/).slice(1);
          return a
        } else {
          this._debug("Sorry, we couldn't parse your Next (Previous Posts) URL. Verify your the css selector points to the correct A tag. If you still get this error: yell, scream, and kindly ask for help at infinite-scroll.com.");
          b.state.isInvalidPage = true
        }
      }
      this._debug("determinePath", a);
      return a
    },
    _error: function k(a) {
      var b = this.options;
      if (!!b.behavior && this["_error_" + b.behavior] !== c) {
        this["_error_" + b.behavior].call(this, a);
        return
      }
      if (a !== "destroy" && a !== "end") {
        a = "unknown"
      }
      this._debug("Error", a);
      if (a == "end") {
        this._showdonemsg()
      }
      b.state.isDone = true;
      b.state.currPage = 1;
      b.state.isPaused = false;
      this._binding("unbind")
    },
    _loadcallback: function l(d, e) {
      var f = this.options,
        g = this.options.callback,
        h = f.state.isDone ? "done" : !f.appendCallback ? "no-append" : "append",
        i;
      if (!!f.behavior && this["_loadcallback_" + f.behavior] !== c) {
        this["_loadcallback_" + f.behavior].call(this, d, e);
        return
      }
      switch (h) {
        case "done":
          this._showdonemsg();
          return false;
          break;
        case "no-append":
          if (f.dataType == "html") {
            e = "<div>" + e + "</div>";
            e = b(e).find(f.itemSelector)
          }
          break;
        case "append":
          var j = d.children();
          if (j.length == 0) {
            return this._error("end")
          }
          i = document.createDocumentFragment();
          while (d[0].firstChild) {
            i.appendChild(d[0].firstChild)
          }
          this._debug("contentSelector", b(f.contentSelector)[0]);
          b(f.contentSelector)[0].appendChild(i);
          e = j.get();
          break
      }
      f.loading.finished.call(b(f.contentSelector)[0], f);
      if (f.animate) {
        var k = b(a).scrollTop() + b("#infscr-loading").height() + f.extraScrollPx + "px";
        b("html,body").animate({
          scrollTop: k
        }, 800, function() {
          f.state.isDuringAjax = false
        })
      }
      if (!f.animate) f.state.isDuringAjax = false;
      g(this, e)
    },
    _nearbottom: function m() {
      var d = this.options,
        e = 0 + b(document).height() - d.binder.scrollTop() - b(a).height();
      if (!!d.behavior && this["_nearbottom_" + d.behavior] !== c) {
        return this["_nearbottom_" + d.behavior].call(this)
      }
      this._debug("math:", e, d.pixelsFromNavToBottom);
      return e - d.bufferPx < d.pixelsFromNavToBottom
    },
    _pausing: function n(a) {
      var b = this.options;
      if (!!b.behavior && this["_pausing_" + b.behavior] !== c) {
        this["_pausing_" + b.behavior].call(this, a);
        return
      }
      if (a !== "pause" && a !== "resume" && a !== null) {
        this._debug("Invalid argument. Toggling pause value instead")
      }
      a = a && (a == "pause" || a == "resume") ? a : "toggle";
      switch (a) {
        case "pause":
          b.state.isPaused = true;
          break;
        case "resume":
          b.state.isPaused = false;
          break;
        case "toggle":
          b.state.isPaused = !b.state.isPaused;
          break
      }
      this._debug("Paused", b.state.isPaused);
      return false
    },
    _setup: function o() {
      var a = this.options;
      if (!!a.behavior && this["_setup_" + a.behavior] !== c) {
        this["_setup_" + a.behavior].call(this);
        return
      }
      this._binding("bind");
      return false
    },
    _showdonemsg: function p() {
      var a = this.options;
      if (!!a.behavior && this["_showdonemsg_" + a.behavior] !== c) {
        this["_showdonemsg_" + a.behavior].call(this);
        return
      }
      a.loading.msg.find("img").hide().parent().find("div").html(a.loading.finishedMsg).animate({
        opacity: 1
      }, 2e3, function() {
        b(this).parent().fadeOut("normal")
      });
      a.errorCallback.call(b(a.contentSelector)[0], "done")
    },
    _validate: function q(a) {
      for (var c in a) {
        if (c.indexOf && c.indexOf("Selector") > -1 && b(a[c]).length === 0) {
          this._debug("Your " + c + " found no elements.");
          return false
        }
      }
      return true
    },
    bind: function r() {
      this._binding("bind")
    },
    destroy: function s() {
      this.options.state.isDestroyed = true;
      return this._error("destroy")
    },
    pause: function t() {
      this._pausing("pause")
    },
    resume: function u() {
      this._pausing("resume")
    },
    retrieve: function v(a) {
      var d = this,
        e = d.options,
        f = e.path,
        g, h, i, j, k, a = a || null,
        l = !!a ? a : e.state.currPage;
      beginAjax = function m(a) {
        a.state.currPage++;
        d._debug("heading into ajax", f);
        g = b(a.contentSelector).is("table") ? b("<tbody/>") : b("<div/>");
        i = f.join(a.state.currPage);
        j = a.dataType == "html" || a.dataType == "json" ? a.dataType : "html+callback";
        if (a.appendCallback && a.dataType == "html") j += "+callback";
        switch (j) {
          case "html+callback":
            d._debug("Using HTML via .load() method");
            g.load(i + " " + a.itemSelector, null, function c(a) {
              d._loadcallback(g, a)
            });
            break;
          case "html":
          case "json":
            d._debug("Using " + j.toUpperCase() + " via $.ajax() method");
            b.ajax({
              url: i,
              dataType: a.dataType,
              complete: function e(a, b) {
                k = typeof a.isResolved !== "undefined" ? a.isResolved() : b === "success" || b === "notmodified";
                k ? d._loadcallback(g, a.responseText) : d._error("end")
              }
            });
            break
        }
      };
      if (!!e.behavior && this["retrieve_" + e.behavior] !== c) {
        this["retrieve_" + e.behavior].call(this, a);
        return
      }
      if (e.state.isDestroyed) {
        this._debug("Instance is destroyed");
        return false
      }
      e.state.isDuringAjax = true;
      e.loading.start.call(b(e.contentSelector)[0], e)
    },
    scroll: function w() {
      var a = this.options,
        b = a.state;
      if (!!a.behavior && this["scroll_" + a.behavior] !== c) {
        this["scroll_" + a.behavior].call(this);
        return
      }
      if (b.isDuringAjax || b.isInvalidPage || b.isDone || b.isDestroyed || b.isPaused) return;
      if (!this._nearbottom()) return;
      this.retrieve()
    },
    toggle: function x() {
      this._pausing()
    },
    unbind: function y() {
      this._binding("unbind")
    },
    update: function z(a) {
      if (b.isPlainObject(a)) {
        this.options = b.extend(true, this.options, a)
      }
    }
  };
  b.fn.infinitescroll = function A(a, c) {
    var d = typeof a;
    switch (d) {
      case "string":
        var e = Array.prototype.slice.call(arguments, 1);
        this.each(function() {
          var c = b.data(this, "infinitescroll");
          if (!c) {
            return false
          }
          if (!b.isFunction(c[a]) || a.charAt(0) === "_") {
            return false
          }
          c[a].apply(c, e)
        });
        break;
      case "object":
        this.each(function() {
          var d = b.data(this, "infinitescroll");
          if (d) {
            d.update(a)
          } else {
            d = new b.infinitescroll(a, c, this);
            if (!d.failed) {
              b.data(this, "infinitescroll", d)
            }
          }
        });
        break
    }
    return this
  };
  var d = b.event,
    e;
  d.special.smartscroll = {
    setup: function() {
      b(this).bind("scroll", d.special.smartscroll.handler)
    },
    teardown: function() {
      b(this).unbind("scroll", d.special.smartscroll.handler)
    },
    handler: function(a, c) {
      var d = this,
        f = arguments;
      a.type = "smartscroll";
      if (e) {
        clearTimeout(e)
      }
      e = setTimeout(function() {
        b.event.handle.apply(d, f)
      }, c === "execAsap" ? 0 : 100)
    }
  };
  b.fn.smartscroll = function(a) {
    return a ? this.bind("smartscroll", a) : this.trigger("smartscroll", ["execAsap"])
  }
})(window, jQuery);
