// The social card: the image X, Slack and Discord show when the docs link is
// posted. None of them run JavaScript, so it cannot come from the React app.
//
// It is the clip's own scene, held at one moment mid hold, on a 1200x630
// canvas. Same source as the readme clip, so the two cannot drift apart.
const puppeteer = require('puppeteer')
const path = require('path')

const W = 1200
const H = 630
const AT = 0.45 * 6.2 // partway through the hold, so the bar is visibly moving

;(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 })
  await page.goto(`file://${path.resolve(__dirname, 'hold-to-approve.html')}`)
  await page.evaluateHandle('document.fonts.ready')
  await new Promise((r) => setTimeout(r, 400))

  await page.evaluate(({ w, h, at }) => {
    document.body.style.width = w + 'px'
    document.body.style.height = h + 'px'
    const cursor = document.querySelector('.cursor')
    if (cursor) cursor.style.display = 'none'
    // The card is built at 400px for a 560px clip. On a 1200px card it has to
    // grow or it reads as a stamp in the middle of an empty field.
    const gate = document.querySelector('.agent-gate')
    if (gate) {
      gate.style.transform = 'scale(1.75)'
      gate.style.transformOrigin = 'center'
    }
    document.getAnimations().forEach((a) => {
      a.pause()
      a.currentTime = at * 1000
    })
  }, { w: W, h: H, at: AT })

  await new Promise((r) => setTimeout(r, 250))
  const out = path.resolve(__dirname, '..', 'docs', 'public', 'og.png')
  await page.screenshot({ path: out })
  console.log('wrote', out)
  await browser.close()
})()
