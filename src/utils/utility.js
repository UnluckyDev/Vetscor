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
import { contattiInit } from '../pages/contatti'
import { corsoInit } from '../pages/corso'

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

  // Inizializza il menu fullscreen su tutte le pagine
  initFullscreenMenu()

  let page = path
  if (page.includes('/blog-post/')) {
    page = '/blog-post'
  }
  if (page.includes('/corsi/')) {
    page = '/corso'
  }

  switch (page) {
    case '/':
      homepageInit()
      break
    case '/chi-siamo':
      aboutInit()
      break
    case '/corsi':
      //corsiInit()
      break
    case '/corso':
      corsoInit()
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

/**
 * Inizializza il menu fullscreen con animazioni GSAP
 * Visibile solo sotto i 767px (mobile landscape e inferiori)
 */
export function initFullscreenMenu() {
  const trigger = document.querySelector('.nav_main_hamburger_wrapper')
  const menu = document.querySelector('.fullscreen-menu')
  const lottieEl = document.querySelector('.nav_main_hamburger_lottie')

  if (!trigger || !menu) return

  // Elementi del menu
  const links = menu.querySelectorAll('.btn-icon-link.is-fullscreen')
  const socialsText = menu.querySelector('.fullscreen-menu_socials_text')
  const socialIcons = menu.querySelectorAll('.contatti_social.is-fullscreen')

  let isOpen = false
  let openTl = null
  let closeTl = null

  // Stato iniziale del menu
  gsap.set(menu, { display: 'none', width: '0%' })

  // Raccogli i testi dei link (animiamo l'intera parola, non i singoli caratteri)
  const linkTexts = []
  links.forEach((link) => {
    const textEl = link.querySelector('.btn-icon-content__text')
    if (textEl) {
      linkTexts.push(textEl)
      gsap.set(textEl, { yPercent: 100, opacity: 0 })
    }
  })

  // Stato iniziale testo "Socials"
  if (socialsText) {
    gsap.set(socialsText, { yPercent: 100, opacity: 0 })
  }

  // Stato iniziale icone social
  gsap.set(socialIcons, { opacity: 0, yPercent: 100 })

  /**
   * Ottiene l'istanza Lottie di Webflow
   */
  function getLottieInstance() {
    // Webflow salva l'animazione Lottie sull'elemento
    if (lottieEl && window.Webflow) {
      const lottieModule = window.Webflow.require('lottie')
      if (lottieModule && lottieModule.lottie) {
        const animations = lottieModule.lottie.getRegisteredAnimations()
        // Trova l'animazione associata al nostro elemento
        return animations.find((anim) => anim.wrapper === lottieEl)
      }
    }
    return null
  }

  // Ferma la Lottie e portala allo 0% all'init
  function initLottie() {
    const lottieAnim = getLottieInstance()
    if (lottieAnim) {
      lottieAnim.stop()
      lottieAnim.goToAndStop(0, true)
    }
  }

  /**
   * Anima la Lottie da un frame a un altro usando GSAP
   */
  function animateLottie(fromPercent, toPercent, duration = 0.4) {
    const lottieAnim = getLottieInstance()
    if (!lottieAnim) return

    const fromFrame = Math.floor(lottieAnim.totalFrames * fromPercent)
    const toFrame = Math.floor(lottieAnim.totalFrames * toPercent)

    gsap.fromTo(
      { frame: fromFrame },
      { frame: fromFrame },
      {
        frame: toFrame,
        duration: duration,
        ease: 'power2.inOut',
        onUpdate: function () {
          lottieAnim.goToAndStop(this.targets()[0].frame, true)
        },
      }
    )
  }

  // Inizializza Lottie (con piccolo delay per assicurarsi che Webflow l'abbia caricata)
  setTimeout(initLottie, 100)

  /**
   * Apre il menu con animazione
   */
  function openMenu() {
    if (isOpen) return
    isOpen = true

    // Ferma Lenis scroll
    window.lenis?.stop()

    // Anima Lottie dallo 0% al 40% (finisce 200ms prima della width)
    animateLottie(0, 0.4, 0.6)

    // Crea timeline di apertura
    openTl = gsap.timeline()

    // Mostra menu e anima width (0.8s)
    openTl.set(menu, { display: 'flex' })
    openTl.to(menu, {
      width: '100%',
      duration: 0.8,
      ease: 'customEaseInOut',
    })

    // Anima i link (parole intere, non singoli caratteri)
    openTl.to(
      linkTexts,
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'customEaseInOut',
      },
      0.3
    )

    // Anima testo "Socials"
    if (socialsText) {
      openTl.to(
        socialsText,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'customEaseInOut',
        },
        '-=0.3'
      )
    }

    // Anima icone social
    openTl.to(
      socialIcons,
      {
        opacity: 1,
        yPercent: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'customEaseInOut',
      },
      '-=0.2'
    )
  }

  /**
   * Chiude il menu con animazione
   */
  function closeMenu() {
    if (!isOpen) return
    isOpen = false

    // Anima Lottie dal 40% allo 0% (0.6s)
    animateLottie(0.4, 0, 0.6)

    // Crea timeline di chiusura
    closeTl = gsap.timeline({
      onComplete: () => {
        gsap.set(menu, { display: 'none' })
        window.lenis?.start()
      },
    })

    // Anima tutti gli elementi in uscita quasi in contemporanea
    closeTl.to(
      socialIcons,
      {
        opacity: 0,
        yPercent: 100,
        duration: 0.25,
        stagger: 0.02,
        ease: 'power2.in',
      },
      0
    )

    if (socialsText) {
      closeTl.to(
        socialsText,
        {
          yPercent: 100,
          opacity: 0,
          duration: 0.25,
          ease: 'power2.in',
        },
        0
      )
    }

    closeTl.to(
      linkTexts,
      {
        yPercent: 100,
        opacity: 0,
        duration: 0.25,
        stagger: 0.02,
        ease: 'power2.in',
      },
      0
    )

    // Chiudi menu (0.8s come l'apertura)
    closeTl.to(
      menu,
      {
        width: '0%',
        duration: 0.8,
        ease: 'customEaseInOut',
      },
      0.15
    )
  }

  // Toggle al click
  trigger.addEventListener('click', () => {
    if (isOpen) {
      closeMenu()
    } else {
      openMenu()
    }
  })

  // Chiudi menu se si clicca su un link
  links.forEach((link) => {
    link.addEventListener('click', () => {
      if (isOpen) {
        closeMenu()
      }
    })
  })
}
