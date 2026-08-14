const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const OUT = path.resolve(__dirname, 'design-terminal')
if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true })
fs.mkdirSync(OUT, { recursive: true })

const IDS = ['crt', 'navy', 'sidark', 'npmlight', 'silight', 'paper']

;(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 880, height: 520, deviceScaleFactor: 2 })
  await page.goto(`file://${path.resolve(__dirname, 'design-terminal.html')}`)
  await page.evaluateHandle('document.fonts.ready')
  await new Promise((r) => setTimeout(r, 500))

  for (let i = 0; i < IDS.length; i++) {
    const el = await page.$('#' + IDS[i])
    await el.screenshot({ path: path.join(OUT, `T${i + 1}-${IDS[i]}.png`) })
    console.log('shot', IDS[i])
  }
  await browser.close()
})()
