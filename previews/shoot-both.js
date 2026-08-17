// Full page in both appearances, so the light regression can never come back
// unnoticed. Writes into docs-shots/ alongside the other captures.
const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const OUT = path.resolve(__dirname, 'docs-shots')
fs.mkdirSync(OUT, { recursive: true })

;(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })

  for (const scheme of ['dark', 'light']) {
    const page = await browser.newPage()
    await page.setViewport({ width: 1100, height: 900, deviceScaleFactor: 1.5 })
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }])
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' })
    await new Promise((r) => setTimeout(r, 900))
    await page.screenshot({ path: path.join(OUT, `full-${scheme}.png`), fullPage: true })
    await page.screenshot({ path: path.join(OUT, `top-${scheme}.png`) })
    const h = await page.evaluate(() => document.body.scrollHeight)
    console.log(scheme, 'height:', h, 'px | errors:', errors.length ? errors : 'none')
    await page.close()
  }

  await browser.close()
})()
