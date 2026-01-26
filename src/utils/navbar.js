/**
 * Navbar Interaction System
 * - Scroll-based hide/show for desktop and mobile navs
 * - Fullscreen mobile menu with hamburger animation
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

// State management
const state = {
  isMenuOpen: false,
  lastScrollY: 0,
  scrollThreshold: 50,
  isDesktop: window.innerWidth > 991,
  navVisible: true,
  splitTextInstances: [],
  timelines: {
    navHide: {
      desktop: null,
      mobile: null,
    },
    hamburger: null,
    fullscreenMenu: null,
  },
}

// DOM Elements (cached)
let elements = {
  desktopNav: null,
  mobileNav: null,
  fullscreenMenu: null,
  hamburgerWrapper: null,
  hamburgerLines: null,
  navLinks: null,
}

/**
 * Initialize all navbar functionality
 */
export function initNavbar() {
  cacheElements()

  if (!elements.desktopNav && !elements.mobileNav) {
    console.warn('Navbar elements not found')
    return
  }

  initScrollBehavior()
  initMobileMenu()
  initResizeHandler()

  return cleanup
}

/**
 * Cache DOM elements
 */
function cacheElements() {
  elements = {
    desktopNav: document.querySelector('.navigation'),
    mobileNav: document.querySelector('.navigation_m'),
    fullscreenMenu: document.querySelector('.navigation_m_fullscreen'),
    hamburgerWrapper: document.querySelector('.nav_m_hamburger_wrapper'),
    hamburgerLines: document.querySelectorAll('.nav_m_hamburger_line'),
    navLinks: document.querySelectorAll('.nav_fullscreen_link'),
  }
}

/**
 * Initialize scroll-based nav hide/show behavior
 */
function initScrollBehavior() {
  console.log('initScrollBehavior')
  const { desktopNav, mobileNav } = elements

  // Get nav heights for transform calculations
  const desktopNavHeight = desktopNav?.offsetHeight || 0
  const mobileNavHeight = mobileNav?.offsetHeight || 0

  // Create hide timelines for each nav
  if (desktopNav) {
    state.timelines.navHide.desktop = gsap
      .timeline({ paused: true })
      .to(desktopNav, {
        y: -(desktopNavHeight + 10),
        duration: 0.3,
        ease: 'customEaseInOut',
      })
  }

  if (mobileNav) {
    state.timelines.navHide.mobile = gsap
      .timeline({ paused: true })
      .to(mobileNav, {
        y: -(mobileNavHeight + 10),
        duration: 0.3,
        ease: 'customEaseInOut',
      })
  }

  // Subscribe to Lenis scroll events
  if (window.lenis) {
    window.lenis.on('scroll', handleScroll)
  }
}

/**
 * Handle scroll events from Lenis
 */
function handleScroll({ scroll, direction }) {
  // Skip if mobile menu is open
  if (state.isMenuOpen) return

  const currentNav = state.isDesktop ? 'desktop' : 'mobile'
  const timeline = state.timelines.navHide[currentNav]

  if (!timeline) return

  const scrollDelta = Math.abs(scroll - state.lastScrollY)

  if (scrollDelta >= state.scrollThreshold) {
    if (direction === 1 && state.navVisible) {
      // Scrolling down - hide nav
      timeline.play()
      state.navVisible = false
    } else if (direction === -1 && !state.navVisible) {
      // Scrolling up - show nav
      timeline.reverse()
      state.navVisible = true
    }
    state.lastScrollY = scroll
  }
}

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
  const { hamburgerWrapper } = elements

  if (!hamburgerWrapper) return

  // Create timelines
  state.timelines.hamburger = createHamburgerTimeline()
  state.timelines.fullscreenMenu = createFullscreenMenuTimeline()

  // Add click listener
  hamburgerWrapper.addEventListener('click', toggleMobileMenu)
}

/**
 * Create hamburger to X animation timeline
 * Phase 1: Lines collapse to center
 * Phase 2: Lines rotate to form X
 */
function createHamburgerTimeline() {
  const { hamburgerLines } = elements

  if (!hamburgerLines || hamburgerLines.length !== 2) return null

  const [topLine, bottomLine] = hamburgerLines

  // Calculate gap distance (0.5rem = ~8px, so 4px each direction)
  // Dynamically calculate based on actual positions
  const topRect = topLine.getBoundingClientRect()
  const bottomRect = bottomLine.getBoundingClientRect()
  const gap = bottomRect.top - topRect.bottom
  const gapDistance = gap / 2 + topRect.height / 2

  const tl = gsap
    .timeline({ paused: true })
    // Phase 1: Collapse to center (first 0.15s)
    .to(
      topLine,
      {
        y: gapDistance,
        duration: 0.15,
        ease: 'customEaseInOut',
      },
      0
    )
    .to(
      bottomLine,
      {
        y: -gapDistance,
        duration: 0.15,
        ease: 'customEaseInOut',
      },
      0
    )
    // Phase 2: Rotate to X (next 0.15s)
    .to(
      topLine,
      {
        rotation: 45,
        duration: 0.15,
        ease: 'customEaseInOut',
      },
      0.15
    )
    .to(
      bottomLine,
      {
        rotation: -45,
        duration: 0.15,
        ease: 'customEaseInOut',
      },
      0.15
    )

  return tl
}

/**
 * Create fullscreen menu animation timeline
 * - Menu slides in from right
 * - Links animate with SplitText (words, staggered from below)
 */
function createFullscreenMenuTimeline() {
  const { fullscreenMenu, navLinks } = elements

  if (!fullscreenMenu) return null

  // Create SplitText instances for each link
  state.splitTextInstances = []
  navLinks.forEach((link) => {
    const split = new SplitText(link, {
      type: 'words',
      wordsClass: 'nav-word',
    })
    state.splitTextInstances.push(split)
  })

  // Collect all words from all links
  const allWords = state.splitTextInstances.flatMap((split) => split.words)

  // Set initial states
  gsap.set(fullscreenMenu, { xPercent: 100 })
  gsap.set(allWords, { y: 30, opacity: 0 })

  const tl = gsap
    .timeline({ paused: true })
    // Slide in menu from right
    .to(fullscreenMenu, {
      xPercent: 0,
      duration: 0.4,
      ease: 'customEaseInOut',
    })
    // Stagger animate words
    .to(
      allWords,
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.03,
        ease: 'customEaseInOut',
      },
      '-=0.2'
    )

  return tl
}

/**
 * Toggle mobile menu open/close
 */
function toggleMobileMenu() {
  if (state.isMenuOpen) {
    closeMobileMenu()
  } else {
    openMobileMenu()
  }
}

/**
 * Open mobile menu
 */
function openMobileMenu() {
  state.isMenuOpen = true

  // Lock scroll using Lenis
  if (window.lenis) {
    window.lenis.stop()
  }

  // Show fullscreen menu (it starts with display: none in CSS)
  const { fullscreenMenu, mobileNav } = elements
  if (fullscreenMenu) {
    gsap.set(fullscreenMenu, { display: 'block' })
  }

  // Play hamburger animation
  state.timelines.hamburger?.play()

  // Play fullscreen menu animation
  state.timelines.fullscreenMenu?.play()

  // Ensure mobile nav is visible when menu is open
  if (mobileNav && !state.navVisible) {
    gsap.to(mobileNav, { y: 0, duration: 0.3, ease: 'customEaseInOut' })
    state.navVisible = true
  }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
  state.isMenuOpen = false

  // Unlock scroll using Lenis
  if (window.lenis) {
    window.lenis.start()
  }

  // Reverse hamburger animation
  state.timelines.hamburger?.reverse()

  // Reverse fullscreen menu animation, then hide element
  const { fullscreenMenu } = elements
  if (state.timelines.fullscreenMenu) {
    state.timelines.fullscreenMenu.reverse()
    // Hide after animation completes
    gsap.delayedCall(state.timelines.fullscreenMenu.duration(), () => {
      if (!state.isMenuOpen && fullscreenMenu) {
        gsap.set(fullscreenMenu, { display: 'none' })
      }
    })
  }
}

/**
 * Handle viewport resize and breakpoint changes
 */
function initResizeHandler() {
  let resizeTimeout

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      const wasDesktop = state.isDesktop
      state.isDesktop = window.innerWidth > 991

      // If breakpoint changed
      if (wasDesktop !== state.isDesktop) {
        resetNavPositions()

        // Close mobile menu if open and switching to desktop
        if (state.isDesktop && state.isMenuOpen) {
          closeMobileMenu()
        }
      }
    }, 100)
  })
}

/**
 * Reset nav positions after breakpoint change
 */
function resetNavPositions() {
  const { desktopNav, mobileNav } = elements

  if (desktopNav) gsap.set(desktopNav, { y: 0 })
  if (mobileNav) gsap.set(mobileNav, { y: 0 })

  state.navVisible = true
  state.lastScrollY = window.scrollY
}

/**
 * Cleanup function for page transitions
 */
function cleanup() {
  const { hamburgerWrapper } = elements

  // Remove event listeners
  hamburgerWrapper?.removeEventListener('click', toggleMobileMenu)

  // Remove Lenis scroll listener
  if (window.lenis) {
    window.lenis.off('scroll', handleScroll)
    window.lenis.start()
  }

  // Kill all timelines
  state.timelines.navHide.desktop?.kill()
  state.timelines.navHide.mobile?.kill()
  state.timelines.hamburger?.kill()
  state.timelines.fullscreenMenu?.kill()

  // Revert SplitText instances
  state.splitTextInstances.forEach((split) => split.revert())
  state.splitTextInstances = []

  // Reset state
  state.isMenuOpen = false
  state.navVisible = true
  state.lastScrollY = 0
}
