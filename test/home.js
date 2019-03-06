/**
 * @name Google search
 * @desc Searches Google.com for a term and checks if the first link matches. This check should fail.
 */

const assert = require('assert')
const puppeteer = require('puppeteer')
const server = require('../index.js')
let browser
let page

before(async () => {
  browser = await puppeteer.launch()
  page = await browser.newPage()
})

describe('Check  Homepage', () => {
  it('has title "universeOS"', async () => {
    await page.goto('http://127.0.0.1:8000', { waitUntil: 'networkidle0' })
    const title = await page.title()
    assert.equal(title, 'universeOS')
  }).timeout(10000)
})

after(async () => {
  await browser.close()

    server.close();
})