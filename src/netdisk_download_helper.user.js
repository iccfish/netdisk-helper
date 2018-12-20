// ==UserScript==
// @name         网盘提取工具
// @namespace    http://www.fishlee.net/
// @version      3.2
// @description  尽可能在支持的网盘自动输入提取码，省去下载的烦恼。
// @author       木鱼(iFish)
// @match        *://*/*
// @grant        unsafeWindow
// @icon         https://ssl-static.fishlee.net/resources/emot/xr/22.gif
// ==/UserScript==

(function(window, self, unsafeWindow) {
    'use strict';
    let timeStart = new Date().getTime();
    let location = self.location;
    let host = location.host;
    let path = location.pathname;
    let code, input;
    let getCode = function(rule) {
        code = location.hash.slice(1, 5);
        if ((rule || /([a-z\d]{4})/i.exec(code))) {
            code = RegExp.$1;
        } else code = null;
        return code;
    };
    if (/(pan|e?yun)\.baidu\.com/.test(host)) {
        //百度云盘
        if (path.indexOf("/share/") !== -1 && document.querySelector('form[name="accessForm"]') && getCode()) {
            let target = document.querySelector('.pickpw input');
            if (!target)
                return;

            target.value = code;
            unsafeWindow.document.querySelector('form[name="accessForm"]').onsubmit();
        }
    } else if (/(pan|d|www)\.lanzous?\.com/.test(host) && getCode()) {
        let target = document.querySelector('#pwd');
        if (!target)
            return;

        target.value = code;
        unsafeWindow.document.querySelector('#sub').dispatchEvent(new UIEvent('click'));
    } else if (/cloud.189.cn/.test(host) && getCode()) {
        let target = document.getElementById('code_txt');
        if (!target)
            return;

        target.value = code;

        let nameLabel = document.querySelector('.shareDate');
        let delayFunc = () => {
            if (!nameLabel.innerText) {
                console.log('delay 500ms due to page load not complete.');
                setTimeout(delayFunc, 500);
            } else {
                unsafeWindow.$(target.nextElementSibling).click();
            }
        };
        setTimeout(delayFunc, 500);
    } else {
        //其它网站，检测链接
        Array.prototype.slice.call(document.querySelectorAll("a[href*='pan.baidu.com'], a[href*='lanzou.com'], a[href*='lanzous.com']")).forEach(function(link) {
            let txt = link.nextSibling && link.nextSibling.nodeValue;
            let linkcode = /码.*?([a-z\d]{4})/i.exec(txt) && RegExp.$1;
            if (!linkcode) {
                txt = link.parentNode.innerText;
                linkcode = /码.*?([a-z\d]{4})/i.exec(txt) && RegExp.$1;
            }
            if (linkcode) {
                let href = link.getAttribute("href");
                link.setAttribute("href", href + "#" + linkcode);
            }
        });
    }
    let timeEnd = new Date().getTime();
    console.log("[网盘提取工具] 链接处理完成，耗时：" + (timeEnd - timeStart) + "毫秒. 处理模式：DOM处理");
})(window, window.self, unsafeWindow);
(function() {
    'use strict';
    //consts...
    let CODE_RULE_COMMON = /^([a-z\d]{4})$/i;
    let MAX_SEARCH_CODE_RANGE = 5;
    //functions...
    let textNodesUnder = function(el) {
        let n, a = [],
            walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        while ((n = walk.nextNode())) {
            if (n.nodeName === '#text')
                a.push(n);
        }
        return a;
    };
    let generalLinkifyText = function(source, eles, index, testReg, validateRule) {
        let count = 0,
            text = source,
            match;
        while ((match = testReg.exec(source))) {
            count++;

            let url = (match[1] || "http://") + match[2];
            let originalText = (match[1] || "") + match[2];
            let code = match[3] || findCodeFromElements(eles, index, validateRule) || "";
            if (!code)
                continue;
            console.log("[网盘提取工具] 已处理网盘地址，URL=" + url + "，提取码=" + code + "模式：TEXTNODE");
            //fix double #
            url = url.split('#')[0];
            text = text.replace(originalText, "<a href='" + url + "#" + code + "' target='_blank'>" + url + '</a>');
        }
        return {
            count,
            text
        };
    };
    let linkifyTextBlockBaidu = function(...args) {
        return generalLinkifyText(...[
            ...args,
            /(https?:\/\/)?((?:pan|e?yun)\.baidu\.com\/s\/(?:[a-z\d\-_]+)(?:#[a-z\d-_]*)?)(?:.*?码.*?([a-z\d]+))?/gi,
            CODE_RULE_COMMON
        ]);
    };
    let linkifyTextBlockLanZou = function(...args) {
        return generalLinkifyText(...[
            ...args,
            /(https?:\/\/)?((?:pan|d|www)\.lanzous?\.com\/(?:[a-z\d]+))(?:.*?码.*?([a-z\d]+))?/gi,
            CODE_RULE_COMMON
        ]);
    };
    let linkifyTextBlock189cn = function(...args) {
        return generalLinkifyText(...[
            ...args,
            /(https?:\/\/)?(cloud\.189?\.cn\/t\/(?:[a-z\d]+))(?:.*?码.*?([a-z\d]+))?/gi,
            CODE_RULE_COMMON
        ]);
    }
    let findCodeFromElements = function(eles, index, rule) {
        for (let i = 0; i < MAX_SEARCH_CODE_RANGE && i < eles.length; i++) {
            let txt = eles[i + index].textContent;
            let codeReg = /码.*?([a-z\d]+)/gi;
            let codeMatch = codeReg.exec(txt) && RegExp.$1;
            if (!codeMatch) continue;
            let linkTestReg = /(https?:|\.(net|cn|com|gov|cc|me))/gi;
            if (linkTestReg.exec(txt) && linkTestReg.lastIndex <= codeReg.lastIndex) {
                break;
            }
            if (rule.test(codeMatch)) return codeMatch;
        }
        return null;
    };
    let linkify = function() {
        let eles = textNodesUnder(document.body);
        let processor = [
            linkifyTextBlockBaidu,
            linkifyTextBlockLanZou,
            linkifyTextBlock189cn
        ];
        for (let i = 0; i < eles.length; i++) {
            let ele = eles[i];
            if (ele.parentNode.tagName == 'a' || !ele.textContent) continue;

            let txt = ele.textContent;
            let loopCount = 0;

            for (var action of processor) {
                let {
                    count,
                    text
                } = action(txt, eles, i + 1);
                loopCount += count;
                txt = text;
            }
            if (loopCount > 0) {
                var span = document.createElement("span");
                span.innerHTML = txt;
                ele.parentNode.replaceChild(span, ele);
            }
        }
    };
    let timeStart = new Date().getTime();
    linkify();
    let timeEnd = new Date().getTime();
    console.log("[网盘提取工具] 链接处理完成，耗时：" + (timeEnd - timeStart) + "毫秒. 处理模式：TEXTNODE处理");
})();