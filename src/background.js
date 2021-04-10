import * as Tone from 'tone';
import * as osc from 'osc';

// Initialize the synthesizer
// const synth     = new Tone.Synth().toDestination();
const scale     = ["C", "D", "E", "F", "G", "A", "B"];
let notebook    = {};

// Initialize OSC over WS
var oscPort = new osc.WebSocketPort({
    url: "ws://localhost:5678", // URL to your Web Socket server.
    metadata: true
});

oscPort.on("ready", function () {
    oscPort.send({
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
      /*10.do{arg i;
        Synth(\grain, [\out, array[2], array[3], array[4], \amp, array[6], \freq, array[8], \sustain, array[10], \pan, array[12]]);
        0.01.wait
      };*/
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
	// setTimeout(function() {
 //    synth.triggerAttackRelease(notebook[requestId], "8n"); // 8th note
 //  }, 100);

	// osc to SuperCollider
  const msgs = {
    address: "/s_new",
    args: [
      {
        type: "s",
        value: "grain"
      },
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
      },
      {
        type: "s",
        value: "amp"
      },
      {
        type: "i",
        value: 1
      },
      {
        type: "s",
        value: "freq"
      },
      {
        type: "f",
        value: notebook[requestId]
      },
      {
        type: "s",
        value: "sustain"
      },
      {
        type: "f",
        value: 0.1
      },
      {
        type: "s",
        value: "pan"
      },
      {
        type: "f",
        value: 0.0
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