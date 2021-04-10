
// you can try http requests from the browser:
"http://localhost:5678".openOS();
"http://localhost:5678/?HOST_INFO".openOS();

(
c = WebSocketClient();
b = ZeroconfBrowser("_oscjson._tcp", "supercollider", { |target|
	postln(format("[zeroconf] target resolved: % (%) at address: %:%",
	target.name, target.domain, target.address, target.port));
	target.onDisconnected = {
		postln(format("[zeroconf] target % is now offline", target.name));
	};
	// when our target 'supercollider' (our websocket server) is online and resolved
	// through zeroconf, automatically connect the client to it from its address and port.
	c.connect(target.address, target.port)
});

c.onConnected = {
	// client connection callback
	postln("[websocket-client] connected!");

	// requests root and host_info (for oscquery)
	c.request("/?HOST_INFO");
	c.request("/");
};

c.onHttpReplyReceived = { |reply|
	postln(format("[http-client] reply from server for uri: %, %", reply.uri, reply.body));
};

c.onTextMessageReceived = { |msg|
	postln(format("[websocket-client] message from server: %", msg));
};

c.onOscMessageReceived = { |msg|
	postln(format("[websocket-client] osc message from server: %", msg));
};

)

c.writeText("owls are not what they seem");
c.writeOsc('/world', 32004, 32.4343, "hellooo");
w[0].writeOsc("/world", 32001, 32.66, "two coopers");