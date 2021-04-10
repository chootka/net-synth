import * as Tone from 'tone';
import * as osc from 'osc';

// Initialize the synthesizer
const synth     = new Tone.Synth().toDestination();
const scale     = ["C", "D", "E", "F", "G", "A", "B"];
let notebook    = {};

// Initialize OSC over WS
var oscPort = new osc.WebSocketPort({
    url: "ws://localhost:5678", // URL to your Web Socket server.
    metadata: true
});

oscPort.on("ready", function () {
    oscPort.send({
        // Tags this bundle with a timestamp that is 60 seconds from now.
        // Note that the message will be sent immediately;
        // the receiver should use the time tag to determine
        // when to act upon the received message.
        timeTag: osc.timeTag(60),

        packets: 
        [
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

function listener(details) {

	console.log("webRequest details", details);

	const requestId = details.requestId;

	if (!notebook.requestId) notebook[requestId] = Tone.Frequency( scale[Math.floor(Math.random()*7)]+Math.ceil(Math.random()*7) ).toFrequency();

	console.log("notebook", notebook);

	// synthesizer
	setTimeout(function() {
    synth.triggerAttackRelease(notebook[requestId], "8n"); // 8th note
  }, 100);

	// osc to SuperCollider
	const msgs = {
        // Tags this bundle with a timestamp that is 60 seconds from now.
        // Note that the message will be sent immediately;
        // the receiver should use the time tag to determine
        // when to act upon the received message.
        timeTag: osc.timeTag(60),

        // s.sendMsg("s_new", \grain, -1, 0, 1, \freq, 500, \sustain, 0.1, \pan, -1.0);

        packets: [
            {
                address: "/grain",
                args: [
                    {
                        type: "i",
                        value: -1
                    },
                    {
                        type: "i",
                        value: 0
                    },
                    {
                        type: "i",
                        value: 1
                    }
                ]
            },
            {
                address: "/freq",
                args: [
                    {
                        type: "f",
                        value: notebook[requestId]
                    }
                ]
            },
            {
                address: "/sustain",
                args: [
                    {
                        type: "f",
                        value: 0.1
                    }
                ]
            },
            {
                address: "/pan",
                args: [
                    {
                        type: "f",
                        value: -1.0
                    }
                ]
            }
        ]
    };

    console.log("Sending packets", msgs, "to localhost:5678");
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