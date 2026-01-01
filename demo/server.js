import WebSocket, { WebSocketServer } from "ws";
import puppeteer from "puppeteer-core";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_PORT = 8081;

async function start() {
    console.log("Starting server on port", CLIENT_PORT);
    const wss = new WebSocketServer({ port: CLIENT_PORT });

    console.log("CHROME_PATH =", process.env.CHROME_PATH);

    wss.on("connection", async (client) => {
        const browser = await puppeteer.launch({
            executablePath: process.env.CHROME_PATH,
            headless: "new",
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
              "--remote-debugging-port=0"
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

        console.log("UI connected", chrome.readyState, WebSocket.OPEN)

        chrome.on("open", () => {
            console.log("CDP WebSocket connected!", chrome.readyState);
            client.send(JSON.stringify({ id: -1 }));
        });
        

        client.on("message", (msg) => {
            const messageString = msg.toString();

            console.log("Ui -> CDP", msg)
            
            if (chrome.readyState === WebSocket.OPEN) {
                chrome.send(messageString);
            }
        });

        chrome.on("message", (msg) => {
            const messageString = msg.toString();
            
            if (client.readyState === WebSocket.OPEN) {
                client.send(messageString);
            }
        });
        
        client.on("close", async () => {
            chrome.close();
            await browser.close();

            console.log("Client closed")
        });
        
        chrome.on("close", async () => {
            client.close();
            await browser.close();

            console.log("CDP closed")
        });
        
        chrome.on("error", async (err) => {
            console.log("ERROR in chrome", err)
            client.close();
            await browser.close();
        });
        
        client.on("error", async (err) => {
            console.log("ERROR in client", err)
            chrome.close();
            await browser.close();
        });
    });
}

start().catch(e => {
    console.error("An error occurred in start():", e);
    process.exit(1);
});
