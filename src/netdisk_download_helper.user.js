// ==UserScript==
// @name         网盘提取工具
// @namespace    http://www.fishlee.net/
// @version      1.0
// @description  尽可能在支持的网盘（新浪微盘、百度网盘、360云盘等）自动输入提取码，省去下载的烦恼。
// @author       木鱼(iFish)
// @match        *://*/*
// @grant        unsafeWindow
// ==/UserScript==
(function(window, self, unsafeWindow) {
    'use strict';
    var location = self.location;
    var host = location.host;
    var path = location.pathname;
    var code, input;
    var getCode = function(rule) {
        code = location.hash.slice(1, 5);
        if ((rule || /([a-z\d]{4})/i.exec(code))) {
            code = RegExp.$1;
        } else code = null;
        return code;
    };
    //..
    if ((host === 'pan.baidu.com' || host === 'yun.baidu.com')) {
        //百度云盘
        if (path.indexOf("/share/") !== -1 && document.getElementById("accessCode") && getCode()) {
            document.getElementById("accessCode").value = code;
            document.getElementById("submitBtn").click();
        }
    } else if (/^.*\.yunpan\.cn$/i.test(host)) {
        //360云盘
        if (self.location.pathname.indexOf("/lk/") !== -1) {
            input = document.querySelector("input.pwd-input");
            if (getCode() && input) {
                input.value = code;
                input.nextElementSibling.click();
            }
        }
    } else if (host === 'vdisk.weibo.com') {
        //新浪微盘
        if (self.location.pathname.indexOf("/lc/") !== -1) {
            input = document.querySelector("#keypass");
            if (getCode() && input) {
                input.value = code;
                document.querySelector("#validate a").click();
            }
        }
    } else {
        //其它网站，检测链接
        Array.prototype.slice.call(document.querySelectorAll("a[href*='pan.baidu.com'], a[href*='yunpan.cn'], a[href*='vdisk.weibo.com']")).forEach(function(link) {
            var txt = link.nextSibling && link.nextSibling.nodeValue;
            var linkcode = /码.*?([a-z\d]{4})/i.exec(txt) && RegExp.$1;
            if (!linkcode) {
                txt = link.parentNode.innerText;
                linkcode = /码.*?([a-z\d]{4})/i.exec(txt) && RegExp.$1;
            }
            if (linkcode) {
                var href = link.getAttribute("href");
                link.setAttribute("href", href + "#" + linkcode);
            }
        });
    }
})(window, window.self, unsafeWindow);