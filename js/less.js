
function lessAlert(obj, type, msg)
{
    if (type == "") {
        $(obj).hide();
    } else {
        $(obj).removeClass().addClass("alert "+ type).html(msg).fadeOut(200).fadeIn(200);
    }
}


var lessModalData        = {};
var lessModalCurrent     = null;
var lessModalNextHistory = null;
var lessModalBodyWidth   = null;
var lessModalBodyHeight  = null;

function lessModalNextPost(url, title, opt, post)
{
    lessModalOpenRaw('POST', url, null, null, null, title, opt, post);
}

function lessModalNext(url, title, opt)
{
    lessModalOpen(url, null, null, null, title, opt);
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

function lessModalOpenPost(url, pos, w, h, title, opt, post)
{
    lessModalOpenRaw('POST', url, pos, w, h, title, opt, post)
}

function lessModalOpen(url, pos, w, h, title, opt)
{
    lessModalOpenRaw('GET', url, pos, w, h, title, opt, "")
}

function lessModalOpenRaw(method, url, pos, w, h, title, opt, post)
{
    var urid = lessCryptoMd5("modal"+url);

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
        type    : method,
        timeout : 30000,
        data    : post,
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

            var pl = '<div class="less-modal-body-pagelet less_scroll" id="'+urid+'">'+rsp+'</div>';
            
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
                $("body").append('<div class="less-modal-bg hide">');
                $(".less-modal-bg").fadeIn(150);                
            }
            
            if (firstload) {
                $(".less-modal").css({
                    "z-index": 100,
                    "top": t +'px',
                    "left": l +'px',
                //}).hide().slideDown(200, function() {
                }).hide().show(100, function() {
                    lessModalResize();
                });
            }
            $('.less-modal-body-page').animate({top: 0, left: "-"+ mov +"px"}, 240, function() {
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
            // TODO hdev_header_alert('error', xhr.responseText);
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
    $(".less_scroll").scrollTop(0);
}

function lessModalButtonAdd(id, title, func, style)
{
    lessModalButtonClean(id);

    $(".less-modal-footer")
        .append("<button id='"+ lessModalCurrent + id +"' class='btn btn-small "+style+"' onclick='"+func+"'>"+ title +"</button>")
        .show(0, function() {
            lessModalResize();
            lessModalData[lessModalCurrent].btns[id] = {
                "title":    title,
                "func":     func,
                "style":    style,
            }
        });
}

function lessModalButtonClean(id)
{
    $("#"+ lessModalCurrent + id).remove();
}

function lessModalButtonCleanAll()
{
    $(".less-modal-footer button").each(function(index) {
        $(this).remove();
    });
}


function lessModalClose()
{
    $(".less-modal").hide(100, function(){
        $(this).remove();
        lessModalData = {};
        lessModalCurrent = null;
        lessModalBodyWidth = null;
        lessModalBodyHeight = null;
    });
    $(".less-modal-bg").fadeOut(150);
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

var lessCookie = {};
lessCookie.Set = function(key, val, sec)
{
    var expires = "";
    
    if (sec) {
        var date = new Date();
        date.setTime(date.getTime() + (sec * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    
    document.cookie = key + "=" + val + expires + "; path=/";
}
lessCookie.SetByDay = function(key, val, day)
{
    lessCookie.Set(key, val, day * 86400);
}
lessCookie.Get = function(key)
{
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
lessCookie.Del = function(key)
{
    lessCookie.Set(key, "", -1);
}


var lessSession = {};
lessSession.Set = function(key, val)
{
    sessionStorage.setItem(key, val);
}
lessSession.Get = function(key)
{
    return sessionStorage.getItem(key);
}
lessSession.Del = function(key)
{
    sessionStorage.removeItem(key);
}
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

var lessLocalStorage = {};
lessLocalStorage.Set = function(key, val)
{
    localStorage.setItem(key, val);
}
lessLocalStorage.Get = function(key)
{
    return localStorage.getItem(key);
}
lessLocalStorage.Del = function(key)
{
    localStorage.removeItem(key);
}
lessLocalStorage.DelByPrefix = function(prefix)
{
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

function lessCryptoMd5(str)
{
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

    var rotateLeft = function (lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    };

    var addUnsigned = function (lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
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

    var _F = function (x, y, z) {
        return (x & y) | ((~x) & z);
    };
    var _G = function (x, y, z) {
        return (x & z) | (y & (~z));
    };
    var _H = function (x, y, z) {
        return (x ^ y ^ z);
    };
    var _I = function (x, y, z) {
        return (y ^ (x | (~z)));
    };

    var _FF = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _GG = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _HH = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _II = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var convertToWordArray = function (str) {
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

    var wordToHex = function (lValue) {
        var wordToHexValue = "",
            wordToHexValue_temp = "",
            lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValue_temp = "0" + lByte.toString(16);
            wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
        }
        return wordToHexValue;
    };

    var x = [],
        k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
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

    var utf8_encode = function (string) {

        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
 
        for (var n = 0; n < string.length; n++) {
 
            var c = string.charCodeAt(n);
 
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
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
