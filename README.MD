# 网盘提取工具

尽可能在支持的网盘自动输入提取码，省去下载的烦恼。

目前支持的网盘：

* 百度云盘

致力于提供更简便的网盘分享体验。

**源码@Github**： [https://github.com/iccfish/netdisk-helper](https://github.com/iccfish/netdisk-helper)

**官方博客**：[http://blog.fishlee.net/?p=3473](http://blog.fishlee.net/?p=3473)

## 安装说明

* 在 Firefox 上，您需要安装[**GreaseMonkey**](https://addons.mozilla.org/zh-CN/firefox/addon/greasemonkey/)或[**TamperMonkey**](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)扩展
* 在 Chrome 上，您需要安装[**TamperMonkey**](https://chrome.google.com/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo) 扩展

在浏览器准备就绪后，在[脚本发布页面](https://greasyfork.org/zh-CN/scripts/18733-%E7%BD%91%E7%9B%98%E6%8F%90%E5%8F%96%E5%B7%A5%E5%85%B7)安装即可。

## 更新记录

### 2018-04-12 `3.0`

* 增加了对蓝奏云的提取码支持

### 2018-04-08 `2.8`

* 合并了 @Heavensward 的提交，提供了对最新版百度网盘分享链接的支持

### 2017-11-09 `2.7`

* 修改对于百度云盘的支持

### 2017-06-07 `2.6`

* 修正对于企业百度云链接识别错误的 BUG
* 修正对于链接中自带锚点标记时重复加锚点的 BUG

### 2017-05-18 `2.5`

* 移除对 360 的支持
* 改善对最新版本 Chrome 的支持

### 2016-05-05 `2.4`

* 移除对新浪微盘的支持（反正丫快倒闭了 o(╯□╰)o）
* 部分代码重构

### 2016-05-05 `2.3`

* 增加文本匹配模式，自动识别非链接的文本并转换为超链接
