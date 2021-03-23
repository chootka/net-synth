import * as Tone from 'tone';
import * as osc from 'osc';

// Initialize the synthesizer
const synth     = new Tone.Synth().toDestination();
const scale     = ["C", "D", "E", "F", "G", "A", "B"];
let notebook    = {};

// Initialize OSC over WS
var oscPort = new osc.WebSocketPort({
    url: "ws://localhost:8081", // URL to your Web Socket server.
    metadata: true
});

oscPort.on("ready", function () {
    oscPort.send({
        // Tags this bundle with a timestamp that is 60 seconds from now.
        // Note that the message will be sent immediately;
        // the receiver should use the time tag to determine
        // when to act upon the received message.
        timeTag: osc.timeTag(60),

        packets: [
            {
                address: "/s_new",
                args: [
                    {
                        type: "s",
                        value: "default"
                    },
                    {
                        type: "i",
                        value: 100
                    }
                ]
            }
        ]
    });
});

oscPort.open();

// const udpPort 	= new osc.UDPPort({
//     // This is the port we're listening on.
//     localAddress: "127.0.0.1",
//     localPort: 57121,

//     // This is where sclang is listening for OSC messages.
//     remoteAddress: "127.0.0.1",
//     remotePort: 57120,
//     metadata: true
// });

// // Listen for incoming OSC messages.
// udpPort.on("message", function (oscMsg, timeTag, info) {
//     console.log("An OSC message just arrived!", oscMsg);
//     console.log("Remote info is: ", info);
// });

// // Handle errors
// udpPort.on("error", function (error) {
//     console.log("An error occurred: ", error.message);
// });

// When the port is read, send an OSC message to SuperCollider
// udpPort.on("ready", function () {
//     udpPort.send({
//         address: "/s_new",
//         args: [
//             {
//                 type: "s",
//                 value: "default"
//             },
//             {
//                 type: "i",
//                 value: 100
//             }
//         ]
//     }, udpPort.options.remoteAddress, udpPort.options.remotePort);
// });

// Open the socket.
// udpPort.open();

function listener(details) {

	console.log("webRequest details", details);

	const requestId = details.requestId;

	if (!notebook.requestId) notebook[requestId] = scale[Math.floor(Math.random()*7)]+Math.ceil(Math.random()*7);

	console.log("notebook", notebook);

	// synthesizer
	synth.triggerAttackRelease(notebook[requestId], "8n"); // 8th note

	// osc to SuperCollider
	const msgs = {
        // Tags this bundle with a timestamp that is 60 seconds from now.
        // Note that the message will be sent immediately;
        // the receiver should use the time tag to determine
        // when to act upon the received message.
        timeTag: osc.timeTag(60),

        packets: [
            {
                address: "/carrier/frequency",
                args: [
                    {
                        type: "f",
                        value: notebook[requestId]
                    }
                ]
            },
            {
                address: "/carrier/amplitude",
                args: [
                    {
                        type: "f",
                        value: 0.5
                    }
                ]
            }
        ]
    };

    console.log("Sending packets", msgs, "to localhost:8081");
    oscPort.send(msgs);

	return {};
}

browser.webRequest.onBeforeSendHeaders.addListener(
	listener,
	{
		urls: ["<all_urls>"]
	},
	["requestHeaders"]
);

browser.webRequest.onHeadersReceived.addListener(
	listener,
	{
		urls: ["<all_urls>"]
	},
	["responseHeaders"]
);

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Hello from the background', request, sender, sendResponse)

  browser.tabs.executeScript({
    file: 'content-script.js',
  });
})