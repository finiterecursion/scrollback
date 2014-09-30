var config = require("../client-config.js");
var host = config.server.protocol + config.server.host;
var validate = require("../lib/validate.js");
var iframeCount = 0, widgets = {};


var domReady = (function(){
	var ready = document.readyState === "complete", listeners = [], fun;

	if(!ready) {
		document.addEventListener("readystatechange", function(){
			var funl
			if (document.readyState === "complete") {
				ready = true;
				while(listeners.length){
					listeners.splice(0,1)[0]();
				}
			}
		});
	}
	
	fun = function(cb){
		if(ready) return cb();
		listeners.push(cb);
	};

	return fun;
}());

function onMessage(e){
	var data, frames, i, widgetID;
	if (e.origin !== host) return;
	frames = document.getElementsByTagName('iframe');

	for (i = 0,l = frames.length; i < l; i++) {
	    if (frames[i].contentWindow === e.source) {
	    	widgetID = frames[i].dataset.id;
	        break;
	    }
	}
	if(i==l) return;
	console.log("Message for widget: ", widgetID, e.data);
	console.log(widgets[widgetID]);
	try{
		data = JSON.parse(e.data);
	}catch(e) {
		return;
	}
	
	widgets[widgetID].message(data);

	/**/
}
window.addEventListener("message",onMessage, false);
function addStyles(){
	var style;
	style = document.createElement("link");
	style.rel = "stylesheet";
	style.type = "text/css";
	style.href = host + "/s/styles/dist/embed.css";
	document.head.appendChild(style);
}

domReady(function(){
	addStyles();
});

function constructEmbed(options) {
	var embed = {},
		host = config.server.protocol + config.server.host;

	if (!validate(options.room)) {
		console.log("Invalid room");
		return;
	}
	embed.room = options.room;
	embed.form = options.form || "toast";
	if (options.nick) embed.nick = options.nick;
	embed.minimize = (typeof options.minimize === "boolean") ? options.minimize : false;

	embed.origin = {
		protocol: location.protocol,
		host: location.host,
		path: location.pathname + location.search + location.hash
	};
	return embed;
}

function addWidget(self){
	var iframe, style, options = self.options, embed = self.embed;
	
	iframe = document.createElement("iframe");
	iframe.src = host + "/" + options.room + (options.thread ? "/" + options.thread : "") + "?embed=" + encodeURIComponent(JSON.stringify(embed));
	iframe.className = "scrollback-stream scrollback-" + embed.form + " " + ((embed.minimize && embed.form == "toast") ? " scrollback-minimized" : "");
	iframe.dataset.id = ++iframeCount;
	widgets[iframe.dataset.id] = self;
	// temp thing. implement better way to position these things.
	if(Object.keys(widgets).length>1) {
		iframe.style.left = 50;
	}
	domReady(function(){
		var container = document.getElementById(self.options.container);
		if (!container) {
			embed.form = "toast";
			document.body.appendChild(iframe);
		} else {
			container.appendChild(iframe);
		}
	});
	
	return iframe;
}

function scrollback(opts) {
	var style, embed, widget={}, self = {
		pendingCallbacks: {},
		options: opts,
		state: {},
		iframe: null,
		embed: null,
		config: config
	};

	self.embed = constructEmbed(opts);
	self.message = function (message) {
		if(message.hasOwnProperty("minimize")) {
			var minReg = /\bscrollback-minimized\b/;

			if (message.minimize && !minReg.test(this.iframe.className)) {
				this.iframe.className = this.iframe.className + " scrollback-minimized";
			} else {
				this.iframe.className = this.iframe.className.replace(minReg, "").trim();
			}
		}else{
			if (message.type === "domain-challenge") {
				this.iframe.contentWindow.postMessage(JSON.stringify({
					type: "domain-response",
					token: message.token
				}), host);
			}
		}
	};

	self.iframe = addWidget(self);
	if (!self.embed) return;
	
	widget.navigation = require("./navigation.js")(self);
	widget.following = require("./following.js")(self);
	widget.options = require("./options.js")(self);
	widget.signin = require("./signin.js")(self);
	self.widget = widget;
	return widget;
}


window.scrollback = scrollback;