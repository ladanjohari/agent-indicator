const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const OUT = path.resolve(__dirname, 'docs-shots')
if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true })
fs.mkdirSync(OUT, { recursive: true })

;(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1180, height: 820, deviceScaleFactor: 2 })
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 800))

  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))

  await page.screenshot({ path: path.join(OUT, '1-top.png') })

  const shots = [
    ['2-rule', '.rule'],
    ['3-statusindicator', '#statusindicator'],
    ['4-approvalgate', '#approvalgate'],
    ['5-aisdk', '#ai-sdk'],
    ['6-sessionstrip', '#sessionstrip'],
  ]
  for (const [name, sel] of shots) {
    const el = await page.$(sel)
    if (!el) { console.log('missing', sel); continue }
    await el.screenshot({ path: path.join(OUT, `${name}.png`) })
    console.log('shot', name)
  }

  console.log('page errors during render:', errors.length ? errors : 'none')
  await browser.close()
})()
