{`const express = require('express');
const playwright = require('playwright');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/generate-pdf', async (req, res) => {
  let browser = null;
  try {
    const { url, filename = 'document.pdf', waitForFunction = 'window.pdfReady === true' } = req.body;
    
    if (!url) return res.status(400).json({ error: 'URL required' });

    browser = await playwright.chromium.launch({ args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForFunction(waitForFunction, { timeout: 30000 });
    await page.waitForTimeout(1000);

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': \`attachment; filename="\${filename}"\`
    });
    res.send(pdf);

  } catch (error) {
    if (browser) await browser.close();
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(\`PDF Service on port \${PORT}\`));`}
