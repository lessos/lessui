
function lessAlert(obj, type, msg)
{    
    if (type == "") {
        $(obj).hide();
    } else {
        $(obj).removeClass().addClass("alert "+ type).html(msg).show();
    }
}


var lessModalData        = {};
var lessModalCurrent     = null;
var lessModalNextHistory = null;
var lessModalBodyWidth   = null;
var lessModalBodyHeight  = null;

function lessModalNext(url, title, opt)
{
    lessModalOpen(url, null, null, null, title, opt)
}

function lessModalPrev()
{
    var prev = null;
    for (var i in lessModalData) {
        if (lessModalData[i].urid == lessModalCurrent && prev != null) {
            lessModalNextHistory = lessModalCurrent;
            lessModalSwitch(prev);            
            break;
        }
        prev = i;
    }
}

function lessModalSwitch(urid)
{
    if (!lessModalData[urid].title) {
        return;
    }
    pp = $('#'+ urid).position();
    mov = pp.left;
    if (mov < 0) {
        mov = 0;
    }
    $('.less-modal-body-page').animate({top: 0, left: "-"+ mov +"px"}, 300, function() {
        
        $('.less-modal-header .title').text(lessModalData[urid].title);
    
        $('.less-modal-footer').empty();
        for (var i in lessModalData[urid].btns) {
            lessModalButtonAdd(lessModalData[urid].btns[i].id, 
                lessModalData[urid].btns[i].title,
                lessModalData[urid].btns[i].func,
                lessModalData[urid].btns[i].style);
        }
        lessModalCurrent = urid;

        if (lessModalNextHistory != null) {
            delete lessModalData[lessModalNextHistory];
            $("#"+ lessModalNextHistory).remove();
            lessModalNextHistory = null;
        }
    });
}

function lessModalOpen(url, pos, w, h, title, opt)
{
    var urid = Crypto.MD5("modal"+url);

    if (/\?/.test(url)) {
        urls = url + "&_=";
    } else {
        urls = url + "?_=";
    }
    urls += Math.random();

    var p  = lessPosGet();
    var bw = $('body').width() - 60;
    var bh = $('body').height() - 50;
    
    $.ajax({
        url     : urls,
        type    : "GET",
        timeout : 30000,
        success : function(rsp) {

            var firstload = false;
            if (lessModalCurrent == null) {
                $(".less-modal").remove();
                firstload = true;
            }
            lessModalCurrent = urid;
            lessModalData[urid] = {
                "urid":     urid,
                "url":      url,
                "title":    title,
                "btns":     {},
            }
            $(".less-modal-footer").empty();            

            var pl = '<div class="less-modal-body-pagelet less_gen_scroll" id="'+urid+'">'+rsp+'</div>';
            
            if (firstload) {
                var apd = '<div class="less-modal">';
                
                apd += '<div class="less-modal-header">\
                <span class="title">'+title+'</span>\
                <button class="close" onclick="lessModalClose()">×</button>\
                </div>';
                
                apd += '<div class="less-modal-body">';
                apd += '<div class="less-modal-body-page">'+pl+'</div>';
                apd += '</div>';
                
                apd += '<div class="less-modal-footer"><div>';
                apd += '</div>'

                $("body").append(apd);
            } else {
                $(".less-modal-body-page").append(pl);
                
            }

            $("#"+urid).css({
                "z-index": "-100"
            }).show();

            if (!$('.less-modal').is(':visible')) {
                $(".less-modal").css({
                    "z-index": "-100"
                }).show();
            }
                
            if (firstload) {

                var hh = $('.less-modal-header').outerHeight(true);
                var fh = $('.less-modal-footer').outerHeight(true);
                
                if (w < 1) {
                    w = $("#"+urid).outerWidth(true);
                }
                if (w < 200) {
                    w = 200;
                }
                if (h < 1) {
                    h = $("#"+urid).outerHeight(true) + hh + fh + 10;
                }
                if (h < 100) {
                    h = 100;
                }

                var t = 0, l = 0;
                if (pos == 1) {
                    l = bw / 2 - w / 2;
                    t = bh / 2 - h / 2;
                } else {
                    l = p.left;
                    t = p.top;
                }
                if (l > (bw - w)) {
                    l = bw - w;
                }
                if ((t + h) > bh) {
                    t = bh - h;
                }
                if (t < 10) {
                    t = 10;
                }

                $(".less-modal").css({
                    "height": h +'px',
                    "width": w +'px',
                });
                
                lessModalBodyHeight = h - hh - fh - 10;
                lessModalBodyWidth  = $('.less-modal-body').width();
                $(".less-modal-body").height(lessModalBodyHeight);
            }
            
            $("#"+urid).css({
                "z-index"   : "1",
                "width"     : lessModalBodyWidth +"px",
                "height"    : lessModalBodyHeight +"px",
            });
            
            pp = $('#'+ urid).position();
            mov = pp.left;
            if (mov < 0) {
                mov = 0;
            }
            
            if (!$('.less-modal-bg').is(':visible')) {
                $(".less-modal-bg").remove();
                $("body").append('<div class="less-modal-bg">');
            }
            
            if (firstload) {
                $(".less-modal").css({
                    "z-index": 100,
                    "top": t +'px',
                    "left": l +'px',
                //}).hide().slideDown(200, function() {
                }).hide().show(150, function() {
                    lessModalResize();
                });
            }
            $('.less-modal-body-page').animate({top: 0, left: "-"+ mov +"px"}, 200, function() {
                $(".less-modal-header .title").text(title);
                $("#"+urid+" .inputfocus").focus();

                if (lessModalNextHistory != null) {
                    delete lessModalData[lessModalNextHistory];
                    $("#"+ lessModalNextHistory).remove();
                    lessModalNextHistory = null;
                }
            });
        },
        error: function(xhr, textStatus, error) {
            hdev_header_alert('error', xhr.responseText);
        }
    });
}

function lessModalResize()
{
    var h  = $('.less-modal').height();
    var hh = $('.less-modal-header').outerHeight(true);
    var fh = $('.less-modal-footer').outerHeight(true);
    lessModalBodyHeight = h - hh - fh - 10;
    $('.less-modal-body').height(lessModalBodyHeight);
    $('.less-modal-body-pagelet').height(lessModalBodyHeight);
}

function lessModalScrollTop()
{
    $(".less_gen_scroll").scrollTop(0);
}

function lessModalButtonAdd(id, title, func, style)
{
    $(".less-modal-footer")
        .append("<button class='btn btn-small "+style+"' onclick='"+func+"'>"+ title +"</button>")
        .show(0, function() {
            lessModalResize();
            lessModalData[lessModalCurrent].btns[id] = {
                "title":    title,
                "func":     func,
                "style":    style,
            }
        });
}

function lessModalClose()
{    
    $(".less-modal").hide(150, function(){
        $(this).remove();
        $(".less-modal-bg").remove();
        lessModalData = {};
        lessModalCurrent = null;
        lessModalBodyWidth = null;
        lessModalBodyHeight = null;
    });
}


function lessPosGet()
{
    var pos = null;
    
    if (window.event) {
        pos = {"left": window.event.pageX, "top": window.event.pageY};
    } else if (pos == null) {
        $(document).mousemove(function(e) {
            pos = {"left": e.pageX, "top": e.pageY};
        });
    }
    
    return pos;
}


function lessCookieSet(key, val, sec)
{
    var expires = "";
    
    if (sec) {
        var date = new Date();
        date.setTime(date.getTime() + (sec * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    
    document.cookie = key + "=" + val + expires + "; path=/";
}

function lessCookieGet(key)
{
    var keyEQ = key + "=";
    var ca = document.cookie.split(';');
    
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') 
            c = c.substring(1, c.length);
        if (c.indexOf(keyEQ) == 0) 
            return c.substring(keyEQ.length, c.length);
    }
    
    return null;
}

function lessCookieDel(key)
{
    lessCookieSet(key, "", -1);
}


var lessSession = {};
lessSession.DelByPrefix = function(prefix)
{
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

