var l4i = {
    pos: {
        x: 0,
        y: 0
    },
    urlevs: {},
    urlevc: null,
}

$(document).ready(function() {
    // Firefox
    if (!window.event) {
        // $(document).mousemove(function(e) {
        $(document).mousedown(function(e) {
            l4i.pos.x = e.pageX;
            l4i.pos.y = e.pageY;
        });
    }

    $(document).on("click", ".l4i-nav-item", function() {
        // $(this).closest("ul").find("a.active").removeClass("active");
        // $(this).addClass("active");
        l4i.UrlEventHandler($(this));
    });

// if (('onhashchange' in window) && ((typeof document.documentMode === 'undefined') || document.documentMode == 8)) {
//     window.onhashchange = l4i.UrlEventHandler;
// } else {
//     setInterval(function() {
//         var ischanged = l4i.urlEventChanged();
//         if (ischanged) {
//             l4i.UrlEventHandler();
//         }
//     }, 150);
// }
});

l4i.UrlEventRegister = function(name, func, pid) {
    if (!name || typeof name != "string" || !func || typeof func != "function") {
        return;
    }

    l4i.urlevs[name] = {
        func: func,
        pid: pid,
    };
}

l4i.UrlEventClean = function(pid) {
    if (!pid) {
        return;
    }

    for (var i in l4i.urlevs) {
        if (pid == l4i.urlevs[i].pid) {
            delete l4i.urlevs[i];
        }
        if (i == l4i.urlevc) {
            l4i.urlevc = null;
        }
    }
}

l4i.UrlEventActive = function(nav_target) {
    l4i.url_event_action(nav_target, null, false);
}

l4i.UrlEventHandler = function(nav_target, auto_prev) {
    l4i.url_event_action(nav_target, auto_prev, true);
}

l4i.url_event_action = function(nav_target, auto_prev, call_func) {
    var nav_name = "";
    if (typeof nav_target == "string") {
        nav_name = nav_target.replace("#", "");
        nav_target = $("body").find("a[href='#" + nav_name + "']");
    }

    if (typeof nav_target != "object") {
        return;
    }

    if (nav_name.length < 1) {
        nav_name = nav_target.attr("href");
        if (!nav_name) {
            nav_name = nav_target.find("a").attr("href");
        }
        if (!nav_name) {
            return;
        }
        nav_name = nav_name.replace("#", "");
    }

    if (nav_name == l4i.urlevc) {
        return;
    }

    // $(this).closest("ul").find("a.active").removeClass("active");
    // $(this).addClass("active");


    // name = name.replace("#", "");
    // var name = location.hash.replace("#", "");
    // if (!name) {
    //     return;
    // }

    if (l4i.urlevs[nav_name]) {

        if (l4i.urlevs[nav_name].pid) {

            if (auto_prev) {
                var nav_prev = l4iStorage.Get("lui_" + l4i.urlevs[nav_name].pid);
                if (nav_prev) {
                    if (l4i.urlevs[nav_prev]) {
                        if (call_func) {
                            l4i.urlevs[nav_prev].func(nav_prev);
                        }
                        l4i.urlevc = nav_prev;
                        var prev_tg = $("body").find("a[href='#" + nav_prev + "']");
                        if (prev_tg) {
                            prev_tg.parent().find(".active:first").removeClass("active");
                            prev_tg.addClass("active");
                        }
                        return;
                    }
                }
            }

            var elem = $("#" + l4i.urlevs[nav_name].pid);
            if (elem) {
                elem.find(".active:first").removeClass("active");
                // elem.find("a[href='#"+ nav_name +"']").addClass("active");
                nav_target.addClass("active");
                l4iStorage.Set("lui_" + l4i.urlevs[nav_name].pid, nav_name);
            }
        } else {
            // nav_name.closest("ul").find("a.active:first").removeClass("active");
            nav_target.parent().find(".active:first").removeClass("active");
            nav_target.addClass("active");
        }

        if (call_func) {
            l4i.urlevs[nav_name].func(nav_name);
        }
        l4i.urlevc = nav_name;
    }
}

l4i.urlEventChanged = function() {
    return false;
}

l4i.Pager = function(metalist) {
    if (!metalist.startIndex) {
        metalist.startIndex = 0;
    }

    if (!metalist.totalResults) {
        metalist.totalResults = 0;
    }

    if (!metalist.itemsPerList) {
        metalist.itemsPerList = 10;
    } else if (metalist.itemsPerList < 1) {
        metalist.itemsPerList = 10;
    }

    if (!metalist.RangeLen) {
        metalist.RangeLen = 10;
    } else if (metalist.RangeLen < 1) {
        metalist.RangeLen = 1;
    }

    var pg = {
        ItemCount: metalist.totalResults,
        CountPerPage: metalist.itemsPerList,
        PageCount: 0,
        CurrentPageNumber: 0,
        FirstPageNumber: 0,
        PrevPageNumber: 0,
        NextPageNumber: 0,
        LastPageNumber: 0,
        RangeLen: metalist.RangeLen,
        RangeStartNumber: 1,
        RangeEndNumber: 0,
        RangePages: [],
    }

    if (metalist.startIndex > 0) {
        pg.CurrentPageNumber = parseInt(metalist.startIndex / metalist.itemsPerList) + 1;
    }

    //
    pg.PageCount = parseInt(pg.ItemCount / pg.CountPerPage);
    if (pg.ItemCount % pg.CountPerPage > 0) {
        pg.PageCount++;
    }

    if (pg.CurrentPageNumber < 1) {
        pg.CurrentPageNumber = 1;
    } else if (pg.CurrentPageNumber > pg.PageCount) {
        pg.CurrentPageNumber = pg.PageCount;
    }

    //
    if (pg.CurrentPageNumber > (pg.RangeLen / 2)) {
        pg.RangeStartNumber = pg.CurrentPageNumber - pg.RangeLen / 2;
    }

    pg.RangeEndNumber = pg.PageCount;
    if ((pg.RangeStartNumber + pg.RangeLen) < pg.PageCount) {
        pg.RangeEndNumber = pg.RangeStartNumber + pg.RangeLen - 1;
    }

    // taking previous page
    if (pg.CurrentPageNumber > 1) {
        pg.PrevPageNumber = pg.CurrentPageNumber - 1;
    }

    // taking next page
    if (pg.CurrentPageNumber < pg.PageCount) {
        pg.NextPageNumber = pg.CurrentPageNumber + 1;
    }

    // taking pages list
    for (var i = pg.RangeStartNumber; i <= pg.RangeEndNumber; i++) {
        pg.RangePages.push(i);
    }

    if (pg.RangeStartNumber > 1) {
        pg.FirstPageNumber = 1;
    }

    if (pg.RangeEndNumber < pg.PageCount) {
        pg.LastPageNumber = pg.PageCount;
    }

    return pg;
}

l4i.PosGet = function() {
    var pos = null;

    if (window.event) {
        pos = {
            "left": window.event.pageX,
            "top": window.event.pageY
        };
    } else {
        pos = {
            "left": l4i.pos.x,
            "top": l4i.pos.y
        };
    }

    return pos;
}

l4i.InnerAlert = function(obj, type, msg) {
    if (type == "") {
        $(obj).hide(200);
    } else {
        var type_css = type;
        switch (type) {
            case "ok":
                type_css = "alert-success";
                break;

            case "info":
                type_css = "alert-primary";
                break;

            case "warn":
                type_css = "alert-warning";
                break;

            case "error":
                type_css = "alert-danger";
                break;
        }

        $(obj).removeClass(function(i, className) {
            return (className.match(/(^|\s)alert-\S+/g) || []).join(' ');
        }).addClass(type_css).html(msg).fadeOut(200).fadeIn(200);
    }
}

// TODO i18n
l4i.T = function() {
    return _sprintf.apply(this, arguments);
}

l4i.TR = function(text) {
    return text.replace(/{%([^%}]+)?%}/g, function(key) {
        return _sprintf.call(this, key.replace(/[{%%}]+/g, ""));
    });
}

l4i.Clone = function(obj) {
    var copy;

    if (null == obj || typeof obj != "object") {
        return obj;
    }

    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
    } else if (obj instanceof Array) {
        return obj.slice(0);
    } else if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = l4i.Clone(obj[attr]);
            }
        }
    }

    return copy;
}

l4i.timeChars = {
    // Year
    Y: function() {
        return this.getFullYear();
    },
    // Month
    m: function() {
        return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1);
    },
    // Day
    d: function() {
        return (this.getDate() < 10 ? '0' : '') + this.getDate();
    },
    // Hour
    H: function() {
        return (this.getHours() < 10 ? '0' : '') + this.getHours();
    },
    // Minute
    i: function() {
        return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();
    },
    // Second
    s: function() {
        return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds();
    },
    u: function() {
        var m = this.getMilliseconds();
        return (m < 10 ? '00' : (m < 100 ? '0' : '')) + m;
    },
}

Date.prototype.l4iTimeFormat = function(format) {
    var date = this;
    return format.replace(/(\\?)(.)/g, function(_, esc, chr) {
        return (esc === '' && l4i.timeChars[chr]) ? l4i.timeChars[chr].call(date) : chr;
    });
}

// http://tools.ietf.org/html/rfc2822#page-14
// ISO 8601
l4i.MetaTimeParseFormat = function(time, format) {
    time = "" + time;
    if (time.length < 17) {
        return (new Date()).l4iTimeFormat(format);
    }

    var ut = Date.UTC(time.substr(0, 4), parseInt(time.substr(4, 2)) - 1, time.substr(6, 2), time.substr(8, 2), time.substr(10, 2), time.substr(12, 2));
    if (!ut) {
        return (new Date()).l4iTimeFormat(format);
    }

    return (new Date(ut)).l4iTimeFormat(format);
}

l4i.TimeParseFormat = function(time, format) {
    if (!time) {
        return (new Date()).l4iTimeFormat(format);
    }

    var tn = Date.parse(time);
    if (!tn) {
        tn = Date.parse(time.replace(/\-/g, "/"));
    }

    return (new Date(tn)).l4iTimeFormat(format);
}

l4i.UnixTimeFormat = function(time, format) {
    if (!time) {
        return "";
    }

    return (new Date(time * 1000)).l4iTimeFormat(format);
}

l4i.UnixMillisecondFormat = function(time, format) {
    if (!time) {
        return "";
    }

    return (new Date(time)).l4iTimeFormat(format);
}

l4i.UriQuery = function() {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to l4i.UriQuery!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");

    for (var i = 0; i < vars.length; i++) {

        var pair = vars[i].split("=");

        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
        // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], pair[1]];
            query_string[pair[0]] = arr;
        // If third or later entry with this name
        } else {
            query_string[pair[0]].push(pair[1]);
        }
    }

    return query_string;
}

l4i.StringTrim = function(str, chr) {
    var re = (!chr) ? new RegExp('^\\s+|\\s+$', 'g') : new RegExp('^' + chr + '+|' + chr + '+$', 'g');
    return str.replace(re, '');
}

l4iAlert = {}

l4iAlert.Open = function(type, msg, options) {
    options = options || {};

    if (!options.type) {
        options.type = "info";
    }

    if (options.close === undefined) {
        options.close = true;
    }

    var type_ui = "info";
    switch (type) {
        case "ok":
            type_ui = "success";
            break;
        case "error":
            type_ui = "danger";
            break;
        case "warn":
            type_ui = "warning";
            break;
        default:
            type_ui = "info";
    }

    var close_ctn = "";
    if (options.close) {
        close_ctn = '<button type="button" class="close" onclick="l4iAlert.Close()"><span aria-hidden="true">&times;</span></button>';
    }

    var btn_ctn = "";
    if (options.buttons && options.buttons.length > 0) {
        btn_ctn = '<div style="margin:20px 0 0 0">' + l4iModal.buttonRender(options.buttons) + "</div>";
    }

    var ctn = '<div id="l4i-alert" class="alert alert-' + type_ui + '" style="position: absolute;display:none">\
        ' + close_ctn + '\
        <span id="l4i-alert-msg"></span>\
        ' + btn_ctn + '\
        </div>';

    $("#l4i-alert").remove();
    $("body").append(ctn);

    var bw = $(window).width(),
        bh = $(window).height();
    var width = bw / 2;
    if (width < 200) {
        width = 200;
    } else if (width > 900) {
        width = 900;
    }

    var left = bw / 2 - width / 2;
    var top = 30;

    if (left > (bw - width)) {
        left = bw - width;
    }

    $("#l4i-alert").css({
        "width": width + "px",
        "min-height": "30px",
    });
    $("#l4i-alert-msg").text(msg);

    if (!$('#l4i-modal-bg').is(':visible')) {
        $("#l4i-modal-bg").remove();
        $("body").append('<div id="l4i-modal-bg" class="less-hide"></div>');
        $("#l4i-modal-bg").fadeIn(150);
    }

    $("#l4i-alert").css({
        "z-index": 2000,
        "top": top + 'px',
        "left": left + 'px',
    }).hide().slideDown(100, function() {});
}

l4iAlert.Close = function(cb) {
    $("#l4i-alert").remove();
    $("#l4i-modal-bg").remove();

    if (cb) {
        cb();
    }
}

l4iAlert.Error = function(msg) {
    l4iAlert.Open("error", msg);
}


// Modal Version 2.x
var l4iModal = {
    version: "2.0",
    current: null,
    CurOptions: null,
    nextHistory: null,
    width: 600,
    height: 400,
    position: "center",
    data: {}
};

l4iModal.Open = function(options) {
    options = options || {};

    if (typeof options.success !== "function") {
        options.success = function() {};
    }

    if (typeof options.error !== "function") {
        options.error = function() {};
    }

    if (!options.position) {
        options.position = l4iModal.position;
    } else if (options.position != "center" && options.position != "cursor") {
        options.position = "center";
    }

    if (options.id === undefined) {
        options.id = "less-modal-single";
    }

    if (options.close === undefined) {
        options.close = true;
    }

    if (options.buttons === undefined) {
        options.buttons = [];
    }

    // $("#"+ modalid).remove();

    if (!options.backEnable) {
        options.backEnable = true;
    }

    if (l4iModal.current != null && options.backEnable) {

        options.prevModalId = l4iModal.current;

        l4iModal.data[l4iModal.current].nextModalId = options.id;

        options.buttons.unshift({
            onclick: "l4iModal.Prev()",
            title: "Back",
            style: "btn-primary less-pull-left"
        });
    }

    l4iModal.data[options.id] = options;

    if (typeof options.callback === "function") {
        l4iModal.switch(options.id, options.callback);
    } else {
        l4iModal.switch(options.id);
    }
}

l4iModal.switch = function(modalid, cb) {
    var options = l4iModal.data[modalid];
    if (options.id === undefined) {
        return;
    }

    if (l4iModal.current == null) {
        $("#" + modalid).remove();
    }

    var firstload = false;
    if (!l4iModal.current) {

        $("#l4i-modal").remove();
        $("body").append('<div id="l4i-modal">\
            <div class="less-modal-header" style="display:none">\
                <span id="less-modal-header-title" class="title"></span>\
                <span class="close" onclick="l4iModal.Close()">×</span>\
            </div>\
            <div class="less-modal-body"><div id="less-modal-body-page" class="less-modal-body-page"></div></div>\
            <div class="less-modal-footer" style="display:none"><div>\
            </div>');

        firstload = true;

    } else {
        $(".less-modal-footer").empty();
    }

    if (options.title) {
        $(".less-modal-header").css({
            "display": "block"
        });
    } else {
        $(".less-modal-header").css({
            "display": "none"
        });
    }

    if (!options.close) {
        $(".less-modal-header").find(".close").css({
            "display": "none"
        });
    }

    var buttons = l4iModal.buttonRender(options.buttons);
    if (buttons.length > 10) {
        $(".less-modal-footer").css({
            "display": "inline-block"
        });
    }

    if (!document.getElementById(modalid)) {

        var body = "<div id='" + modalid + "' class='less-modal-body-pagelet less_scroll'>";

        if (options.tplsrc !== undefined) {

            if (options.data !== undefined) {
                var tempFn = doT.template(options.tplsrc);
                body += tempFn(options.data);
            } else {
                body += options.tplsrc;
            }

        } else if (options.tplid !== undefined) {

            var elem = document.getElementById(options.tplid);
            if (!elem) {
                return "";
            }

            var source = elem.value || elem.innerHTML;

            if (options.data !== undefined) {
                var tempFn = doT.template(source);
                body += tempFn(options.data);
            } else {
                body += source;
            }

        } else if (options.tpluri) {

            if (/\?/.test(options.tpluri)) {
                options.tpluri += "&_=";
            } else {
                options.tpluri += "?_=";
            }
            options.tpluri += Math.random();

            $.ajax({
                url: options.tpluri,
                type: "GET",
                timeout: 10000,
                async: false,
                success: function(rsp) {
                    if (options.data !== undefined) {
                        var tempFn = doT.template(rsp);
                        body += tempFn(options.data);
                    } else {
                        body += rsp;
                    }
                },
                error: function() {
                    body += "Failed on load template";
                }
            });
        }

        body += "</div>";

        if (options.i18n) {
            body = l4i.TR(body);
        }

        $("#less-modal-body-page").append(body);
    }

    $("#" + modalid).css({
        "z-index": "-100",
        "display": "block"
    });

    if (!$("#l4i-modal").is(':visible')) {
        $("#l4i-modal").css({
            "z-index": "-100"
        }).css({
            "display": "block"
        });
    }

    var bw = $(window).width(),
        bh = $(window).height();

    if (options.width && options.width == "max") {
        options.width = bw - 100;
    } else if (!options.width) {
        options.width = l4iModal.width;
    }

    if (options.height && options.height == "max") {
        options.height = bh - 120;
    } else if (!options.height) {
        options.height = l4iModal.height;
    }

    options.width = parseInt(options.width);
    options.height = parseInt(options.height);

    var hefoo_height = $(".less-modal-header").outerHeight(true);
    hefoo_height += $(".less-modal-footer").outerHeight(true);


    if (options.width < 1) {
        options.width = $("#" + modalid).outerWidth(true);
    }
    if (options.width < 200) {
        options.width = 200;
    }
    if (options.height < 1) {
        options.height = $("#" + modalid).outerHeight(true) + hefoo_height;
    }
    if (options.height < 100) {
        options.height = 100;
    }

    var top = 0,
        left = 0;

    if (options.position == "center") {
        left = bw / 2 - options.width / 2;
        top = bh / 2 - options.height / 2;
    } else {
        var p = l4i.PosGet();
        top = p.top - 10, left = p.left - 10;
    }
    if (left > (bw - options.width)) {
        left = bw - options.width;
    }
    if ((top + options.height + 40) > bh) {
        top = bh - options.height - 40;
    }
    if (top < 10) {
        top = 10;
    }

    $("#l4i-modal").css({
        "height": options.height + 'px',
        "width": options.width + 'px',
    });


    options.inlet_width = options.width - 20;
    options.inlet_height = options.height - hefoo_height - 20;

    var body_margin = "10px";
    if (buttons.length > 10) {
        body_margin = "10px 10px 0 10px";
        options.inlet_height += 10;
    }

    $(".less-modal-body").css({
        "margin": body_margin,
        "width": (options.inlet_width) + "px",
        "height": (options.inlet_height) + "px",
    });

    if (!$('#l4i-modal-bg').is(':visible')) {
        $("#l4i-modal-bg").remove();
        $("body").append('<div id="l4i-modal-bg" class="less-hide"></div>');
        $("#l4i-modal-bg").fadeIn(150);
    }


    $("#" + modalid).css({
        "z-index": 1,
        "width": options.inlet_width + "px", // options.width +"px",
        "height": options.inlet_height + "px",
    });


    var pp = $("#" + modalid).position();
    var mov = pp.left;
    if (mov < 0) {
        mov = 0;
    }

    if (firstload) {

        $("#l4i-modal").css({
            "position": "fixed",
            "z-index": 200,
            "top": top + 'px',
            "left": left + 'px'
        }).hide().slideDown(100, function() {
            // l4iModal.Resize();
            // options.success();
        });

        if (options.title) {
            $(".less-modal-header .title").text(options.title);
        }

        if (buttons.length > 10) {
            $(".less-modal-footer").html(buttons);
        }

    } else {

        $("#l4i-modal").animate({
            "position": "fixed",
            "z-index": 200,
            "top": top + 'px',
            "left": left + 'px'
        }, 50, function() {
            // l4iModal.Resize();
            // options.success();
        });
    }

    $('.less-modal-body-page').animate({
        top: 0,
        left: "-" + mov + "px"
    }, 300, function() {

        if (!firstload) {

            if (options.title !== undefined) {
                $(".less-modal-header .title").text(options.title);
            }

            if (buttons.length > 10) {
                $(".less-modal-footer").html(buttons);
            }
        }

        $("#" + modalid + " .inputfocus").focus();

        l4iModal.Resize();

        if (options.success) {
            options.success();

            if (prev = l4iModal.data[modalid]) {
                l4iModal.data[modalid].success = null;
            }
        }

        if (cb) {
            cb();
        }
    });

    l4iModal.current = options.id;
    l4iModal.CurOptions = options;
    l4iModal.width = options.width;
    l4iModal.height = options.height;
    l4iModal.position = options.position;

    if (options.nextModalId !== undefined) {
        delete l4iModal.data[options.nextModalId];
        $("#" + options.nextModalId).remove();
        l4iModal.data[options.id].nextModalId = undefined;
    }
}

l4iModal.PrevId = function() {
    var modal = l4iModal.data[l4iModal.current];
    if (modal.prevModalId !== undefined) {
        return modal.prevModalId;
    }
    return null;
}

l4iModal.Prev = function(cb) {
    var previd = l4iModal.PrevId();
    if (previd != null) {
        // l4iModal.nextHistory = l4iModal.current;
        l4iModal.switch(previd, cb);
    }
}


l4iModal.buttonRender = function(buttons) {
    var str = "";
    for (var i in buttons) {

        if (!buttons[i].title) {
            continue;
        }

        if (!buttons[i].style) {
            buttons[i].style = "btn-default";
        }

        if (buttons[i].href) {
            str += "<a class='btn btn-small " + buttons[i].style
                + "' href='" + buttons[i].href + "'>"
                + buttons[i].title + "</a>";
        } else if (buttons[i].onclick) {
            str += "<button class='btn btn-small " + buttons[i].style
                + "' onclick='" + buttons[i].onclick + "'>"
                + buttons[i].title + "</button>";
        }
    }

    return str;
}

l4iModal.Resize = function() {
    var h = $("#l4i-modal").height();
    var hh = $(".less-modal-header").outerHeight(true);
    var fh = $(".less-modal-footer").outerHeight(true);
    var lessModalBodyHeight = h - hh - fh - 20;
    if (l4iModal.CurOptions.buttons && l4iModal.CurOptions.buttons.length > 0) {
        lessModalBodyHeight += 10;
    }
    if (lessModalBodyHeight == l4iModal.CurOptions.inlet_height) {
        return;
    }
    l4iModal.CurOptions.inlet_height = lessModalBodyHeight;
    $(".less-modal-body").height(lessModalBodyHeight);
    $(".less-modal-body-pagelet").height(lessModalBodyHeight);
}

l4iModal.Close = function(cb) {
    if (!l4iModal.current) {
        if (cb) {
            cb();
        }
        return;
    }

    $("#l4i-modal").slideUp(100, function() {
        l4iModal.data = {};
        l4iModal.current = null;
        l4iModal.CurOptions = null;
        $("#l4i-modal").remove();
        $("#l4i-modal-bg").fadeOut(150, cb);
    });
}

l4iModal.ScrollTop = function() {
    $(".less-modal-body-pagelet.less_scroll").scrollTop(0);
}

// Cookie
var l4iCookie = {

};

l4iCookie.Set = function(key, val, sec, path) {
    var expires = "";

    if (sec) {
        var date = new Date();
        date.setTime(date.getTime() + (sec * 1000));
        expires = "; expires=" + date.toGMTString();
    }

    if (!path) {
        path = "/";
    }

    document.cookie = key + "=" + val + expires + "; path=" + path;
}

l4iCookie.SetByDay = function(key, val, day, path) {
    l4iCookie.Set(key, val, day * 86400, path);
}

l4iCookie.Get = function(key) {
    var keyEQ = key + "=";
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')
        c = c.substring(1, c.length);
        if (c.indexOf(keyEQ) == 0)
            return c.substring(keyEQ.length, c.length);
    }

    return null;
}

l4iCookie.Del = function(key, path) {
    l4iCookie.Set(key, "", -1, path);
}

//
var l4iSession = {

};

l4iSession.Set = function(key, val) {
    sessionStorage.setItem(key, val);
}

l4iSession.Get = function(key) {
    return sessionStorage.getItem(key);
}

l4iSession.Del = function(key) {
    sessionStorage.removeItem(key);
}

l4iSession.DelByPrefix = function(prefix) {
    var prelen = prefix.length;
    var qs = {};

    for (var i = 0, len = sessionStorage.length; i < len; i++) {
        if (sessionStorage.key(i).slice(0, prelen) == prefix) {
            qs[i] = sessionStorage.key(i);
        }
    }

    for (var i in qs) {
        sessionStorage.removeItem(qs[i]);
    }
}

//
var l4iStorage = {

};

l4iStorage.Set = function(key, val) {
    localStorage.setItem(key, val);
}

l4iStorage.Get = function(key) {
    return localStorage.getItem(key);
}

l4iStorage.Del = function(key) {
    localStorage.removeItem(key);
}

l4iStorage.DelByPrefix = function(prefix) {
    if (!prefix) {
        return;
    }

    var prelen = prefix.length;
    var qs = {};

    for (var i = 0, len = localStorage.length; i < len; i++) {
        if (localStorage.key(i).slice(0, prelen) == prefix) {
            qs[i] = localStorage.key(i);
        }
    }

    for (var i in qs) {
        localStorage.removeItem(qs[i]);
    }
}

// doT.js
// 2011-2014, Laura Doktorova, https://github.com/olado/doT
// Licensed under the MIT license.

(function() {
    "use strict";

    var doT = {
            version: "1.0.3",
            templateSettings: {
                evaluate: /\{\[([\s\S]+?(\}?)+)\]\}/g,
                interpolate: /\{\[=([\s\S]+?)\]\}/g,
                encode: /\{\[!([\s\S]+?)\]\}/g,
                use: /\{\[#([\s\S]+?)\]\}/g,
                useParams: /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
                define: /\{\[##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\]\}/g,
                defineParams: /^\s*([\w$]+):([\s\S]+)/,
                conditional: /\{\[\?(\?)?\s*([\s\S]*?)\s*\]\}/g,
                iterate: /\{\[~\s*(?:\]\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\]\})/g,
                varname: "it",
                strip: true,
                append: true,
                selfcontained: false,
                doNotSkipEncoded: false
            },
            template: undefined, //fn, compile template
            compile: undefined //fn, for express
        },
        _globals;

    doT.encodeHTMLSource = function(doNotSkipEncoded) {
        var encodeHTMLRules = {
                "&": "&#38;",
                "<": "&#60;",
                ">": "&#62;",
                '"': "&#34;",
                "'": "&#39;",
                "/": "&#47;"
            },
            matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
        return function(code) {
            return code ? code.toString().replace(matchHTML, function(m) {
                return encodeHTMLRules[m] || m;
            }) : "";
        };
    };

    _globals = (function() {
        return this || (0, eval)("this");
    }());

    if (typeof module !== "undefined" && module.exports) {
        module.exports = doT;
    } else if (typeof define === "function" && define.amd) {
        define(function() {
            return doT;
        });
    } else {
        _globals.doT = doT;
    }

    var startend = {
            append: {
                start: "'+(",
                end: ")+'",
                startencode: "'+encodeHTML("
            },
            split: {
                start: "';out+=(",
                end: ");out+='",
                startencode: "';out+=encodeHTML("
            }
        },
        skip = /$^/;

    function resolveDefs(c, block, def) {
        return ((typeof block === "string") ? block : block.toString())
            .replace(c.define || skip, function(m, code, assign, value) {
                if (code.indexOf("def.") === 0) {
                    code = code.substring(4);
                }
                if (!(code in def)) {
                    if (assign === ":") {
                        if (c.defineParams) value.replace(c.defineParams, function(m, param, v) {
                                def[code] = {
                                    arg: param,
                                    text: v
                                };
                            });
                        if (!(code in def))
                            def[code] = value;
                    } else {
                        new Function("def", "def['" + code + "']=" + value)(def);
                    }
                }
                return "";
            })
            .replace(c.use || skip, function(m, code) {
                if (c.useParams)
                    code = code.replace(c.useParams, function(m, s, d, param) {
                        if (def[d] && def[d].arg && param) {
                            var rw = (d + ":" + param).replace(/'|\\/g, "_");
                            def.__exp = def.__exp || {};
                            def.__exp[rw] = def[d].text.replace(new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"), "$1" + param + "$2");
                            return s + "def.__exp['" + rw + "']";
                        }
                    });
                var v = new Function("def", "return " + code)(def);
                return v ? resolveDefs(c, v, def) : v;
            });
    }

    function unescape(code) {
        return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
    }

    doT.template = function(tmpl, c, def) {
        c = c || doT.templateSettings;
        var cse = c.append ? startend.append : startend.split,
            needhtmlencode,
            sid = 0,
            indv,
            str = (c.use || c.define) ? resolveDefs(c, tmpl, def || {}) : tmpl;

        str = ("var out='" + (c.strip ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, " ")
            .replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g, "") : str)
            .replace(/'|\\/g, "\\$&")
            .replace(c.interpolate || skip, function(m, code) {
                return cse.start + unescape(code) + cse.end;
            })
            .replace(c.encode || skip, function(m, code) {
                needhtmlencode = true;
                return cse.startencode + unescape(code) + cse.end;
            })
            .replace(c.conditional || skip, function(m, elsecase, code) {
                return elsecase ?
                    (code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
                    (code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
            })
            .replace(c.iterate || skip, function(m, iterate, vname, iname) {
                if (!iterate) return "';} } out+='";
                sid += 1;
                indv = iname || "i" + sid;
                iterate = unescape(iterate);
                return "';var arr" + sid + "=" + iterate + ";if(arr" + sid + "){var " + vname + "," + indv + "=-1,l" + sid + "=arr" + sid + ".length-1;while(" + indv + "<l" + sid + "){"
                    + vname + "=arr" + sid + "[" + indv + "+=1];out+='";
            })
            .replace(c.evaluate || skip, function(m, code) {
                return "';" + unescape(code) + "out+='";
            })
        + "';return out;")
            .replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r")
            .replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");
            //.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

        if (needhtmlencode) {
            if (!c.selfcontained && _globals && !_globals._encodeHTML)
                _globals._encodeHTML = doT.encodeHTMLSource(c.doNotSkipEncoded);
            str = "var encodeHTML = typeof _encodeHTML !== 'undefined' ? _encodeHTML : ("
                + doT.encodeHTMLSource.toString() + "(" + (c.doNotSkipEncoded || '') + "));"
                + str;
        }
        try {
            return new Function(c.varname, str);
        } catch (e) {
            if (typeof console !== "undefined") console.log("Could not create a template function: " + str);
            throw e;
        }
    };

    doT.compile = function(tmpl, def) {
        return doT.template(tmpl, null, def);
    };
}());

//
var l4iTemplate = {

};

l4iTemplate.RenderFromID = function(idto, idfrom, data) {
    // TODO cache
    var elem = document.getElementById(idfrom);
    if (!elem) {
        return "";
    }
    var source = elem.value || elem.innerHTML;

    if (data) {
        var tempFn = doT.template(source);
        $("#" + idto).html(tempFn(data));
    } else {
        $("#" + idto).html(source);
    }
// var elemto = document.getElementById(idto);
// if (elemto) {
//     elemto.innerHTML = tempFn(data);
// }
}

l4iTemplate.RenderByID = function(idfrom, data) {
    // TODO cache
    var elem = document.getElementById(idfrom);
    if (!elem) {
        return "";
    }

    var source = elem.value || elem.innerHTML;
    var tempFn = doT.template(source);

    return tempFn(data);
}

l4iTemplate.Render = function(options) {
    options = options || {};

    if (typeof options.success !== "function") {
        options.success = function() {};
    }

    if (typeof options.error !== "function") {
        options.error = function() {};
    }

    if (options.dstid === undefined) {

        if (typeof options.callback === "function") {
            options.callback("dstid can not found", null);
        }

        options.error(400, "dstid can not be null");
        return;
    }

    if (options.tplsrc !== undefined) {

        if (options.i18n) {
            options.tplsrc = l4i.TR(options.tplsrc);
        }

        if (options.data !== undefined) {
            var tempFn = doT.template(options.tplsrc);

            if (options.prepend) {
                $("#" + options.dstid).prepend(tempFn(options.data));
            } else if (options.append) {
                $("#" + options.dstid).append(tempFn(options.data));
            } else {
                $("#" + options.dstid).html(tempFn(options.data));
            }

        } else {
            if (options.prepend) {
                $("#" + options.dstid).prepend(options.tplsrc);
            } else if (options.append) {
                $("#" + options.dstid).append(options.tplsrc);
            } else {
                $("#" + options.dstid).html(options.tplsrc);
            }
        }

        if (typeof options.callback === "function") {
            options.callback(null, null);
        }

        options.success();

    } else if (options.tplid !== undefined) {

        var elem = document.getElementById(options.tplid);
        if (!elem) {

            if (typeof options.callback === "function") {
                options.callback("tplid can not found", null);
            }

            options.error(400, "tplid can not found");
            return;
        }

        var source = elem.value || elem.innerHTML;

        if (options.i18n) {
            source = l4i.TR(source);
        }

        if (options.data !== undefined) {

            var tempFn = doT.template(source);

            if (options.prepend) {
                $("#" + options.dstid).prepend(tempFn(options.data));
            } else if (options.append) {
                $("#" + options.dstid).append(tempFn(options.data));
            } else {
                $("#" + options.dstid).html(tempFn(options.data));
            }

        } else {

            if (options.prepend) {
                $("#" + options.dstid).prepend(source);
            } else if (options.append) {
                $("#" + options.dstid).append(source);
            } else {
                $("#" + options.dstid).html(source);
            }
        }

        if (typeof options.callback === "function") {
            options.callback(null, null);
        }

        options.success();

    } else if (options.tplurl !== undefined) {

        if (/\?/.test(options.tplurl)) {
            options.tplurl += "&_=";
        } else {
            options.tplurl += "?_=";
        }
        options.tplurl += Math.random();

        $.ajax({
            url: options.tplurl,
            type: "GET",
            timeout: 10000,
            success: function(rsp) {

                if (options.i18n) {
                    rsp = l4i.TR(rsp);
                }

                if (options.data !== undefined) {
                    var tempFn = doT.template(rsp);
                    if (options.prepend) {
                        $("#" + options.dstid).prepend(tempFn(options.data));
                    } else if (options.append) {
                        $("#" + options.dstid).append(tempFn(options.data));
                    } else {
                        $("#" + options.dstid).html(tempFn(options.data));
                    }
                } else {

                    if (options.prepend) {
                        $("#" + options.dstid).prepend(rsp);
                    } else if (options.append) {
                        $("#" + options.dstid).append(rsp);
                    } else {
                        $("#" + options.dstid).html(rsp);
                    }
                }

                if (typeof options.callback === "function") {
                    options.callback(null, null);
                }

                options.success();
            },
            error: function() {
                options.error(400, "tplurl can not fetch")
            }
        });
    }
}


//
var l4iString = {

};

l4iString.CryptoMd5 = function(str) {
    // http://kevin.vanzonneveld.net
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: utf8_encode
    // *     example 1: md5('Kevin van Zonneveld');
    // *     returns 1: '6e658d4bfcb59cc13f96c14450ac40b9'
    var xl;

    var rotateLeft = function(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    };

    var addUnsigned = function(lX, lY) {
        var lX4,
            lY4,
            lX8,
            lY8,
            lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    };

    var _F = function(x, y, z) {
        return (x & y) | ((~x) & z);
    };
    var _G = function(x, y, z) {
        return (x & z) | (y & (~z));
    };
    var _H = function(x, y, z) {
        return (x ^ y ^ z);
    };
    var _I = function(x, y, z) {
        return (y ^ (x | (~z)));
    };

    var _FF = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _GG = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _HH = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _II = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var convertToWordArray = function(str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = new Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };

    var wordToHex = function(lValue) {
        var wordToHexValue = "",
            wordToHexValue_temp = "",
            lByte,
            lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValue_temp = "0" + lByte.toString(16);
            wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
        }
        return wordToHexValue;
    };

    var x = [],
        k,
        AA,
        BB,
        CC,
        DD,
        a,
        b,
        c,
        d,
        S11 = 7,
        S12 = 12,
        S13 = 17,
        S14 = 22,
        S21 = 5,
        S22 = 9,
        S23 = 14,
        S24 = 20,
        S31 = 4,
        S32 = 11,
        S33 = 16,
        S34 = 23,
        S41 = 6,
        S42 = 10,
        S43 = 15,
        S44 = 21;

    var utf8_encode = function(string) {

        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }

        return utftext;
    };

    str = utf8_encode(str);
    x = convertToWordArray(str);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    xl = x.length;
    for (k = 0; k < xl; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }

    var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

    return temp.toLowerCase();
}


function _sprintf() {
    //  discuss at: http://phpjs.org/functions/sprintf/
    // original by: Ash Searle (http://hexmen.com/blog/)
    // improved by: Michael White (http://getsprink.com)
    // improved by: Jack
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Dj
    // improved by: Allidylls
    //    input by: Paulo Freitas
    //    input by: Brett Zamir (http://brett-zamir.me)
    //   example 1: sprintf("%01.2f", 123.1);
    //   returns 1: 123.10
    //   example 2: sprintf("[%10s]", 'monkey');
    //   returns 2: '[    monkey]'
    //   example 3: sprintf("[%'#10s]", 'monkey');
    //   returns 3: '[####monkey]'
    //   example 4: sprintf("%d", 123456789012345);
    //   returns 4: '123456789012345'
    //   example 5: sprintf('%-03s', 'E');
    //   returns 5: 'E00'

    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g;
    var a = arguments;
    var i = 0;
    var format = a[i++];

    // pad()
    var pad = function(str, len, chr, leftJustify) {
        if (!chr) {
            chr = ' ';
        }
        var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0)
            .join(chr);
        return leftJustify ? str + padding : padding + str;
    };

    // justify()
    var justify = function(value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length;
        if (diff > 0) {
            if (leftJustify || !zeroPad) {
                value = pad(value, minWidth, customPadChar, leftJustify);
            } else {
                value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
            }
        }
        return value;
    };

    // formatBaseX()
    var formatBaseX = function(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0;
        prefix = prefix && number && {
                '2': '0b',
                '8': '0',
                '16': '0x'
            }[base] || '';
        value = prefix + pad(number.toString(base), precision || 0, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };

    // formatString()
    var formatString = function(value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision != null) {
            value = value.slice(0, precision);
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    };

    // doFormat()
    var doFormat = function(substring, valueIndex, flags, minWidth, _, precision, type) {
        var number,
            prefix,
            method,
            textTransform,
            value;

        if (substring === '%%') {
            return '%';
        }

        // parse flags
        var leftJustify = false;
        var positivePrefix = '';
        var zeroPad = false;
        var prefixBaseX = false;
        var customPadChar = ' ';
        var flagsl = flags.length;
        for (var j = 0; flags && j < flagsl; j++) {
            switch (flags.charAt(j)) {
                case ' ':
                    positivePrefix = ' ';
                    break;
                case '+':
                    positivePrefix = '+';
                    break;
                case '-':
                    leftJustify = true;
                    break;
                case "'":
                    customPadChar = flags.charAt(j + 1);
                    break;
                case '0':
                    zeroPad = true;
                    customPadChar = '0';
                    break;
                case '#':
                    prefixBaseX = true;
                    break;
            }
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
            minWidth = 0;
        } else if (minWidth === '*') {
            minWidth = +a[i++];
        } else if (minWidth.charAt(0) == '*') {
            minWidth = +a[minWidth.slice(1, -1)];
        } else {
            minWidth = +minWidth;
        }

        // Note: undocumented perl feature:
        if (minWidth < 0) {
            minWidth = -minWidth;
            leftJustify = true;
        }

        if (!isFinite(minWidth)) {
            throw new Error('sprintf: (minimum-)width must be finite');
        }

        if (!precision) {
            precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined;
        } else if (precision === '*') {
            precision = +a[i++];
        } else if (precision.charAt(0) == '*') {
            precision = +a[precision.slice(1, -1)];
        } else {
            precision = +precision;
        }

        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

        switch (type) {
            case 's':
                return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
            case 'c':
                return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
            case 'b':
                return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'o':
                return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'x':
                return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'X':
                return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
                    .toUpperCase();
            case 'u':
                return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'i':
            case 'd':
                number = +value || 0;
                // Plain Math.round doesn't just truncate
                number = Math.round(number - number % 1);
                prefix = number < 0 ? '-' : positivePrefix;
                value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            case 'e':
            case 'E':
            case 'f': // Should handle locales (as per setlocale)
            case 'F':
            case 'g':
            case 'G':
                number = +value;
                prefix = number < 0 ? '-' : positivePrefix;
                method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                value = prefix + Math.abs(number)[method](precision);
                return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
            default:
                return substring;
        }
    };

    return format.replace(regex, doFormat);
}


l4i.Ajax = function(url, options) {
    options = options || {};

    //
    if (l4i.debug || options.nocache) {
        if (/\?/.test(url)) {
            url += "&_=";
        } else {
            url += "?_=";
        }
        url += Math.random();
    } else if (l4i.app_version && l4i.app_version.length > 0) {
        if (/\?/.test(url)) {
            url += "&_=" + l4i.app_version;
        } else {
            url += "?_=" + l4i.app_version;
        }
    }

    //
    if (!options.method) {
        options.method = "GET";
    }

    //
    if (!options.timeout) {
        options.timeout = 10000;
    }
    if (!options.async || options.async !== false) {
        options.async = true;
    }

    //
    $.ajax({
        url: url,
        type: options.method,
        data: options.data,
        timeout: options.timeout,
        async: options.async,
        success: function(rsp) {
            if (typeof options.callback === "function") {
                options.callback(null, rsp);
            }
        },
        error: function(xhr, textStatus, error) {
            if (typeof options.callback === "function") {
                if (error) {
                    options.callback(error, null);
                } else {
                    options.callback(xhr.responseText, null);
                }
            }
        }
    });
}
