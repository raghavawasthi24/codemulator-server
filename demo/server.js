import { WebSocketServer, WebSocket } from "ws";
import puppeteer from "puppeteer";

const CLIENT_PORT = process.env.PORT || 8081;

async function start() {
    const wss = new WebSocketServer({ port: CLIENT_PORT });
    console.log(`Server listening on port ${CLIENT_PORT}`);

    wss.on("connection", async (client) => {
        let browser;
        try {
            // In Docker, we can omit executablePath if using the puppeteer package
            // as it will find the bundled Chromium.
            browser = await puppeteer.launch({
                headless: "new",
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                ]
            });

            const browserWSEndpoint = browser.wsEndpoint();
            const cdpHostPort = browserWSEndpoint.replace('ws://', '').split('/')[0];
            const cdpApiUrl = `http://${cdpHostPort}/json`;
            
            const res = await fetch(cdpApiUrl);
            
            if (!res.ok) {
                await browser.close();
                throw new Error(`Failed to fetch CDP targets: ${res.statusText}`);
            }
            
            const targets = await res.json();
        
            const pageTarget = targets.find(t => t.type === "page");
        
            if (!pageTarget) {
                console.error("No page targets found");
                await browser.close();
                return;
            }
        
            const cdpUrl = pageTarget.webSocketDebuggerUrl;
        
            const chrome = new WebSocket(cdpUrl);

            chrome.on("open", () => {
                console.log("Connected to Chrome CDP");
                client.send(JSON.stringify({ id: -1, status: "ready" }));
            });

            // Proxy UI -> Chrome
            client.on("message", (msg) => {
                if (chrome.readyState === WebSocket.OPEN) {
                    chrome.send(msg.toString());
                }
            });

            // Proxy Chrome -> UI
            chrome.on("message", (msg) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(msg.toString());
                }
            });

            const cleanup = async () => {
                console.log("Cleaning up session...");
                if (chrome.readyState === WebSocket.OPEN) chrome.close();
                if (browser) await browser.close();
            };

            client.on("close", cleanup);
            chrome.on("close", cleanup);

        } catch (err) {
            console.error("Failed to launch browser:", err);
            client.close();
        }
    });
}

start();
