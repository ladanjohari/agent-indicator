const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const OUT = path.resolve(__dirname, 'docs-shots')
fs.mkdirSync(OUT, { recursive: true })

;(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1100, height: 900, deviceScaleFactor: 1.5 })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 900))
  await page.screenshot({ path: path.join(OUT, '0-fullpage.png'), fullPage: true })
  await page.screenshot({ path: path.join(OUT, '1-top.png') })
  const h = await page.evaluate(() => document.body.scrollHeight)
  console.log('full page height:', h, 'px | page errors:', errors.length ? errors : 'none')
  await browser.close()
})()
