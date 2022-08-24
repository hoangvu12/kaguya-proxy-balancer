import express from "express";
import fs from "fs";
import { P2cBalancer } from "load-balancers";
import axios from "axios";

const app = express();

const PORT = process.env.PORT || 3000;

const servers = JSON.parse(fs.readFileSync("./servers.json", "utf-8") || "[]");

const balancer = new P2cBalancer(servers.length);

app.get("/proxy", async (req, res) => {
  const server = servers[balancer.pick()];

  console.log("Piping request to", server);

  const { data } = await axios.get(server, {
    responseType: "stream",
    params: req.query,
    headers: req.headers,
  });

  data.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
