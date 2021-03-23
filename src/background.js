// Initialize OSC over UDP
const osc 		= new osc();
const udpPort 	= new osc.UDPPort({
    // This is the port we're listening on.
    localAddress: "127.0.0.1",
    localPort: 57121,

    // This is where sclang is listening for OSC messages.
    remoteAddress: "127.0.0.1",
    remotePort: 57120,
    metadata: true
});

// Handle errors
udpPort.on("error", function (error) {
    console.log("An error occurred: ", error.message);
});

// Open the socket.
udpPort.open();

// Synthesizer
const synth 	= new Tone.Synth().toDestination();
const scale 	= ["C", "D", "E", "F", "G", "A", "B"];
let notebook 	= {};

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

    console.log("Sending packets", msgs, "to", udpPort.options.remoteAddress + ":" + udpPort.options.remotePort);
    udpPort.send(msgs);

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
  console.log('Hello from the background')

  browser.tabs.executeScript({
    file: 'content-script.js',
  });
})