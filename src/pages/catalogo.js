import '../styles/style.css'
import gsap from 'gsap'
import { initLenis } from '../utils/utility'
import { initNavbar } from '../utils/navbar'

export function catalogoInit() {
  console.log('catalogo init')

  initLenis()
  initNavbar()
}
