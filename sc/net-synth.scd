(
var w = WebSocketServer(5678);
var z = ZeroconfService("supercollider", "_oscjson._tcp", w.port);
var p, s;

postln(format("[websocket-server] newly created on %", w.port));
// the server should be zeroconf-visible (as 'supercollider') by client devices (with the type '_oscjson._tcp', which is part of the oscquery specification, set here as an example)
// see https://github.com/Vidvox/OSCQueryProposal

w.onNewConnection = { |con|
	// each time a new client connects to the server, a WebSocketConnection is created
	// and stored within the server object, until closed/disconnected
	// the object is also passed in this callback, for convenience
	postln(format("[websocket-server] new connection from %:%", con.address, con.port));

	con.onTextMessageReceived = { |msg|
		// Callback for text/osc message reception
		postln(format("[websocket-server] new message from: %:%", con.address, con.port));
		postln(msg);
		// echo back the received message to the client
		con.writeText(msg);
	};

	con.onOscMessageReceived = { |array|
		// Callback for OSC over websocket
		// the array is of the same format as a standard OSC array sent from a NetAddr
		// array[0] being the method ('/s_new') and array[1..n] the arguments
		// e.g. [ /s_new, grain, -1, 0, 1, amp, 1, freq, 36.708095550537, sustain, 0.0099999997764826, pan, 0.0 ]

		postln(format("[websocket-server] new osc message from: %:%", con.address, con.port));

		postln(array[2]);
		postln(array[3]);
		postln(array[4]);
		postln(array[6]);
		postln(array[8]);
		postln(array[10]);
		postln(array[12]);

		{
			// 1.do{arg i;
				Synth(\grain, [\out, array[2], array[3], array[4], \amp, array[6], \freq, array[8], \sustain, array[11], \pan, array[12]]);
			// 0.01.wait
		// };
		}.fork

	};
};

w.onHttpRequestReceived = { |req|
	// the websocket server keeps its http-server functionalities
	// meaning it can receive standard non-websocket http requests from browsers or other http clients
	// here, we set the callback for passing these HttpRequest objects
	postln("[http-server] request received");
	postln(format("[http-server] uri: %", req.uri));

	if (req.query.isEmpty().not()) {
		postln(format("[http-server] query: %", req.query));
	};

	if (req.uri == "/") {
		if (req.query == "HOST_INFO") {
			// another oscquery example
			req.replyJson("{ \"NAME\": \"supercollider\", \"OSC_PORT\": 1234, \"OSC_TRANSPORT\": \"UDP\"}");
		} {
			req.reply(Http.ok, "hello world!", "text/plain");
		}
	}
};

w.onDisconnection = { |con|
	postln(format("[websocket-server] client %:%: disconnected", con.address, con.port));
};
)
