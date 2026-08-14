const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const OUT = path.resolve(__dirname, 'design-si')
if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true })
fs.mkdirSync(OUT, { recursive: true })

const IDS = ['s1', 's2', 's3', 's4', 's5', 's6']
const NAMES = ['dark-anchored', 'light-anchored', 'dark-inline', 'light-inline', 'dark-hero', 'light-hero']

;(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 880, height: 520, deviceScaleFactor: 2 })
  await page.goto(`file://${path.resolve(__dirname, 'design-si.html')}`)
  await page.evaluateHandle('document.fonts.ready')
  await new Promise((r) => setTimeout(r, 1200))

  for (let i = 0; i < IDS.length; i++) {
    const el = await page.$('#' + IDS[i])
    await el.screenshot({ path: path.join(OUT, `S${i + 1}-${NAMES[i]}.png`) })
    console.log('shot', NAMES[i])
  }
  await browser.close()
})()
