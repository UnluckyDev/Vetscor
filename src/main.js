import { getPageInit, initLenis, initBarba } from './utils/utility.js'
import { initNavbar } from './utils/navbar.js'

const body = document.querySelector('body')

document.addEventListener('DOMContentLoaded', () => {
  // initBarba(body)
  // initLenis()
  initNavbar()
  getPageInit()
})
