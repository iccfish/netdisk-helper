// ==UserScript==
// @name         网盘提取工具
// @namespace    http://www.fishlee.net/
// @version      2.4
// @description  尽可能在支持的网盘（新浪微盘、百度网盘、360云盘等）自动输入提取码，省去下载的烦恼。
// @author       木鱼(iFish)
// @match        *://*/*
// @grant        unsafeWindow
// ==/UserScript==
(function(window, self, unsafeWindow) {
    'use strict';
    var timeStart = new Date().getTime();
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
    var timeEnd = new Date().getTime();
    console.log("[网盘提取工具] 链接处理完成，耗时：" + (timeEnd - timeStart) + "毫秒. 处理模式：DOM处理");
})(window, window.self, unsafeWindow);
(function() {
    'use strict';
    //consts...
    var CODE_RULE_BAIDU = /^([a-z\d]{4})$/i;
    var CODE_RULE_YUNPAN = /^([a-z\d]{4})$/i;
    var MAX_SEARCH_CODE_RANGE = 5;
    //functions...
    var textNodesUnder = function(el) {
        var n, a = [],
            walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        while ((n = walk.nextNode())) a.push(n);
        return a;
    };
    var generalLinkifyText = function(text, eles, index, testReg, validateRule) {
        var loopCount = 0,
            originalText, code, match, url,
            linkifiedText = text;
        while ((match = testReg.exec(text))) {
            loopCount++;
            url = (match[1] || "http://") + match[2];
            originalText = match[1] + match[2];
            code = match[3] || findCodeFromElements(eles, index, validateRule) || "";
            console.log("[网盘提取工具] 已处理网盘地址，URL=" + url + "，提取码=" + code + "模式：TEXTNODE");
            linkifiedText = linkifiedText.replace(originalText, "<a href='" + url + "#" + code + "' target='_blank'>" + url + '</a>');
        }
        return [loopCount, linkifiedText];
    };
    var linkifyTextBlockBaidu = function(text, eles, index) {
        return generalLinkifyText(text, eles, index, /(http:\/\/)?((?:pan|yun)\.baidu\.com\/s\/(?:[a-z\d]+))(?:.*?码.*?([a-z\d]+))?/gi, CODE_RULE_BAIDU);
    };
    var linkifyTextBlockYunpan = function(text, eles, index) {
        return generalLinkifyText(text, eles, index, /(http:\/\/)?(yunpan\.cn\/(?:[a-z\d]+))(?:.*?码.*?([a-z\d]+))?/gi, CODE_RULE_YUNPAN);
    };
    var findCodeFromElements = function(eles, index, rule) {
        for (var i = 0; i < MAX_SEARCH_CODE_RANGE && i < eles.length; i++) {
            var txt = eles[i + index].textContent;
            var codeReg = /码.*?([a-z\d]+)/gi;
            var codeMatch = codeReg.exec(text) && RegExp.$1;
            if (!codeMatch) continue;
            var linkTestReg = /(https?:|\.(net|cn|com|gov|cc|me))/gi;
            if (linkTestReg.exec(txt) && linkTestReg.lastIndex <= codeReg.lastIndex) {
                break;
            }
            if (rule.test(codeMatch)) return codeMatch;
        }
        return null;
    };
    var linkify = function() {
        var eles = textNodesUnder(document.body);
        var ele, txt, loopCount;
        var processor = [
            linkifyTextBlockBaidu
        ];
        var callback = function(fun) {
            var data = fun(txt, eles, i + 1);
            loopCount += data[0];
            txt = data[1];
        };
        for (var i = 0; i < eles.length; i++) {
            ele = eles[i];
            if (ele.parentNode.tagName == 'a') continue;
            txt = ele.textContent;
            loopCount = 0;
            processor.forEach(callback);
            if (loopCount > 0) {
                var span = document.createElement("span");
                span.innerHTML = txt;
                ele.parentNode.replaceChild(span, ele);
            }
        }
    };
    var timeStart = new Date().getTime();
    linkify();
    var timeEnd = new Date().getTime();
    console.log("[网盘提取工具] 链接处理完成，耗时：" + (timeEnd - timeStart) + "毫秒. 处理模式：TEXTNODE处理");
})();