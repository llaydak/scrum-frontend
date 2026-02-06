const express = require("express");
const { chromium } = require("playwright");

const app = express();
app.use(express.json({ limit: "2mb" }));

app.post("/render/png", async (req, res) => {
  const { url } = req.body;
  console.log("render request:", url);

  if (!url) return res.status(400).send("url is required");

  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForSelector('html[data-report-ready="true"]', { timeout: 60_000 });
    await page.waitForSelector("#pie-chart-box svg", { timeout: 60_000 });
    await page.waitForTimeout(300);
    const png = await page.screenshot({ fullPage: true, type: "png" });

    res.setHeader("Content-Type", "image/png");
    res.send(png);
  } catch (e) {
    res.status(500).send(String(e?.stack || e));
  } finally {
    await browser.close().catch(() => {});
  }
});

app.listen(3001, () => console.log("Renderer listening on http://localhost:3001"));
