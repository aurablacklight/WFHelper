import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const directory = path.resolve(process.argv[2] || "release/beta-local/0.1.0-beta.2");
if (!fs.existsSync(path.join(directory, "beta.yml")))
  throw new Error("No beta.yml in feed directory.");
http
  .createServer((req, res) => {
    let name;
    try {
      name = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname.slice(1));
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (!name || path.basename(name) !== name || !/\.(yml|exe|blockmap)$/.test(name)) {
      res.writeHead(404).end();
      return;
    }
    const file = path.join(directory, name);
    if (!fs.existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "Content-Length": fs.statSync(file).size, "Cache-Control": "no-store" });
    if (req.method === "HEAD") res.end();
    else fs.createReadStream(file).pipe(res);
  })
  .listen(18765, "127.0.0.1", () =>
    console.log(`Local beta feed: http://127.0.0.1:18765/ (${directory})`),
  );
