// Puts the clip's mock and the real component side by side.
//
// The mock in hold-to-approve.html is hand-copied markup. It drifted once
// already, inventing an "Approved, deliberately." confirmation the package has
// never rendered. This script is how that gets caught rather than shipped.
//
// Needs the workbench dev server running: npm run dev (port 5173).
const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const OUT = path.resolve(__dirname, 'docs-shots')
fs.mkdirSync(OUT, { recursive: true })

const W = 560
const H = 320

;(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })

  // The real component, with the destructive request opened.
  const real = await browser.newPage()
  await real.setViewport({ width: W, height: H, deviceScaleFactor: 2 })
  await real.goto('http://localhost:5173/clip-audit.html', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 500))
  const reveal = await real.$('.agent-gate__reveal')
  if (!reveal) throw new Error('No reveal control found. Is the dev server running?')
  await reveal.click()
  await new Promise((r) => setTimeout(r, 400))
  await real.screenshot({ path: path.join(OUT, 'audit-real.png') })

  // The mock, held at frame 0 where nothing has been pressed yet.
  const mock = await browser.newPage()
  await mock.setViewport({ width: W, height: H, deviceScaleFactor: 2 })
  await mock.goto(`file://${path.resolve(__dirname, 'hold-to-approve.html')}`)
  await new Promise((r) => setTimeout(r, 400))
  await mock.evaluate(() => {
    document.getAnimations().forEach((a) => {
      a.pause()
      a.currentTime = 0
    })
    // The cursor is a prop of the clip, not of the component.
    const cursor = document.querySelector('.cursor')
    if (cursor) cursor.style.display = 'none'
  })
  await mock.screenshot({ path: path.join(OUT, 'audit-mock.png') })

  console.log('wrote audit-real.png and audit-mock.png')
  await browser.close()
})()
