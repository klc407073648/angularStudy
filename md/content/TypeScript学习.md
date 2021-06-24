# TypeScript学习

## 参考资料

* [TypeScript 教程 | 菜鸟教程](https://www.runoob.com/typescript/ts-tutorial.html)
* [angular 中文网站](https://angular.cn/)

## TypeScript基础 

* TypeScript 是 JavaScript 的一个超集，支持 ECMAScript 6 标准。
* TypeScript 设计目标是开发大型应用，它可以编译成纯 JavaScript，编译出来的 JavaScript 可以运行在任何浏览器上。
      * 即实际使用，是通过TypeScript Compiler将编写的TypeScript生成JavaScript来使用，以兼容原有的浏览器对JavaScript的使用

## vs中练习typescript语法

```
1.Windows PowerShell 以管理员身份打开
2.在终端执行：get-ExecutionPolicy，显示Restricted（禁止状态）
3.更新Powershell策略，在终端执行：set-ExecutionPolicy RemoteSigned

4. 在vscode中 cnpm install -g typescript
5. tsc hello.ts  ————> 生成hello.js
	node .\hello.js
	hello world Tom
6. ng new angularApp --skip-install   跳过npm install安装
7. 然后使用cnpm install 安装
```

## npm和cnpm 概念

1. npm (node package manager): nodejs的包管理器，用于node插件管理（包括安装、卸载、管理依赖等）

2. cnpm:因为npm安装插件是从国外服务器下载，受网络的影响比较大，可能会出现异常，如果npm的服务器在中国就好了，
所以我们乐于分享的淘宝团队干了这事。来自官网：“这是一个完整 http://npmjs.org 镜像，你可以用此代替官方版本(只读)，
同步频率目前为 10分钟 一次以保证尽量与官方服务同步。

```
安装cnpm
npm install cnpm -g --registry=https://registry.npm.taobao.org
```

