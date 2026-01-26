/**
 * Utility functions
 */

import { homepageInit } from '../pages/homepage'
import { aboutInit } from '../pages/about'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { SplitText } from 'gsap/SplitText'
import { fotovoltaicoInit } from '../pages/fotovoltaico'
import { industrialiInit } from '../pages/industriali'
import { catalogoInit } from '../pages/catalogo'
import { contattiInit } from '../pages/contatti'

gsap.registerPlugin(CustomEase, SplitText)

//add a customEase
CustomEase.create(
  'customEaseInOut',
  'M0,0 C0.25,0 0.365,0.058 0.406,0.085 0.499,0.145 0.482,0.29 0.498,0.502 0.514,0.73 0.496,0.88 0.551,0.928 0.59,0.962 0.698,1 1,1'
)

export function resetWebflow(data) {
  let parser = new DOMParser()
  let dom = parser.parseFromString(data.next.html, 'text/html')
  let webflowPageId = $(dom).find('html').attr('data-wf-page')
  $('html').attr('data-wf-page', webflowPageId)
  window.Webflow && window.Webflow.destroy()
  window.Webflow && window.Webflow.ready()
}

export function getPageInit() {
  const path = window.location.pathname

  let page = path
  if (page.includes('/blog-post/')) {
    page = '/blog-post'
  }

  switch (page) {
    case '/':
      homepageInit()
      break
    case '/chi-siamo':
      aboutInit()
      break
    case '/fotovoltaico-detrazione':
      fotovoltaicoInit()
      break
    case '/fotovoltaico':
      fotovoltaicoInit()
      break
    case '/impianti-residenziali':
      residenzialiInit()
      break
    case '/impianti-industriali':
      industrialiInit()
      break
    case '/catalogo-prodotti':
      catalogoInit()
      break
    case '/contatti':
      contattiInit()
      break
    default:
      break
  }
}

export function initLenis() {
  const lenis = new Lenis({
    prevent: (node) => node.id === 'mobile-menu',
    autoRaf: true,
    anchors: true,
    lerp: 0.08,
    wheelMultiplier: 2,
    infinite: false,
  })

  // lenis.on('scroll', (e) => {
  //   console.log(e)
  // })

  window.lenis = lenis

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })

  gsap.ticker.lagSmoothing(0)
}

function killTimelines() {
  let triggers = ScrollTrigger.getAll()
  console.log('triggers to be killed', triggers)
  triggers.forEach((trigger) => {
    trigger.kill()
  })
}
