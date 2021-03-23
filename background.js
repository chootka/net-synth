const synth = new Tone.Synth().toDestination();
const scale = ["C", "D", "E", "F", "G", "A", "B"];
let notebook = {};

function listener(details) {

	console.log("webRequest details", details);

	const requestId = details.requestId;
    // const filter = browser.webRequest.filterResponseData(requestId);

	if (!notebook.requestId) notebook[requestId] = scale[Math.floor(Math.random()*7)]+Math.ceil(Math.random()*7);

	console.log("notebook", notebook);

	// filter.ondata = event => {
		synth.triggerAttackRelease(notebook[requestId], "8n");
	// }

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