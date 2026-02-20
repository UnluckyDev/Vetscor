import '../styles/style.css'
import { initLenis } from '../utils/utility'

// Stato del form
let currentStep = 1
let isUnder35 = false

// Struttura dati per i campi del form
const formFields = {
  nome: { value: '', input: null, messageEl: null, isValid: true },
  cognome: { value: '', input: null, messageEl: null, isValid: true },
  codiceFiscale: { value: '', input: null, messageEl: null, isValid: true },
  partitaIVA: { value: '', input: null, messageEl: null, isValid: true },
  indirizzo: { value: '', input: null, messageEl: null, isValid: true },
  cap: { value: '', input: null, messageEl: null, isValid: true },
  comune: { value: '', input: null, messageEl: null, isValid: true },
  provincia: { value: '', input: null, messageEl: null, isValid: true },
  email: { value: '', input: null, messageEl: null, isValid: true },
  cellulare: { value: '', input: null, messageEl: null, isValid: true },
  date: { value: '', input: null, messageEl: null, isValid: true },
}

// Campi per ogni step
const stepFields = {
  1: ['nome', 'cognome', 'codiceFiscale', 'partitaIVA'],
  2: ['indirizzo', 'cap', 'comune', 'provincia'],
  3: ['email', 'cellulare', 'date'],
}

// Mapping tra chiavi dell'oggetto e ID degli elementi nel DOM
const fieldMapping = {
  nome: 'Nome',
  cognome: 'Cognome',
  codiceFiscale: 'codice-fiscale',
  partitaIVA: 'PIVA',
  indirizzo: 'Indirizzo',
  cap: 'CAP',
  comune: 'Comune',
  provincia: 'Provincia',
  email: 'Email',
  cellulare: 'Cellulare',
  date: 'Date',
}

// Messaggi di errore per ogni campo
const errorMessages = {
  nome: 'Inserisci il tuo nome',
  cognome: 'Inserisci il tuo cognome',
  codiceFiscale: 'Inserisci un codice fiscale valido',
  partitaIVA: 'Inserisci una P.IVA valida (11 cifre)',
  indirizzo: 'Inserisci il tuo indirizzo',
  cap: 'Inserisci un CAP valido (5 cifre)',
  comune: 'Inserisci il comune',
  provincia: 'Inserisci la provincia',
  email: 'Inserisci un indirizzo email valido',
  cellulare: 'Inserisci un numero di cellulare valido',
  date: 'Inserisci la tua data di nascita',
}

// Riferimenti DOM
let panels = []
let stepIndicators = []
let avantiBtn = null
let indietroBtn = null
let submitBtn = null
let form = null
let alertEl = null
let alertCard = null
let alertIndietroBtn = null
let alertCheckoutBtn = null

export function corsoInit() {
  console.log('corso init')

  initLenis()
  // initNavbar()
  initIscrizioneForm()
}

/**
 * Inizializza i riferimenti DOM per ogni campo del form
 */
function initFormFields() {
  Object.keys(formFields).forEach((key) => {
    const input = document.getElementById(fieldMapping[key])
    formFields[key].input = input
    formFields[key].messageEl = input?.parentElement.querySelector(
      '.form_input_message'
    )
  })

  // Riferimenti ai panel
  panels = [
    document.querySelector('[form-panel="1"]'),
    document.querySelector('[form-panel="2"]'),
    document.querySelector('[form-panel="3"]'),
  ]

  // Riferimenti agli step indicator
  stepIndicators = document.querySelectorAll('.corso_step_number_wrapper')

  // Riferimenti ai pulsanti
  avantiBtn = document.querySelector('[form-avanti-btn]')
  indietroBtn = document.querySelector('[form-indietro-btn]')
  submitBtn = document.querySelector('[form-submit-btn]')
  form = document.getElementById('wf-form-Iscrizione-Form')

  // Riferimenti all'alert
  alertEl = document.querySelector('.alert_pre-stripe')
  alertCard = alertEl?.querySelector('.alert_card')
  const alertButtons = alertEl?.querySelectorAll('.btn-icon-link')
  alertIndietroBtn = alertButtons?.[0]
  alertCheckoutBtn = alertButtons?.[1]
}

/**
 * Valida un singolo campo in base alla sua chiave e valore
 */
function validateField(key, value) {
  const trimmed = value.trim()

  switch (key) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    case 'cap':
      return /^\d{5}$/.test(trimmed)
    case 'codiceFiscale':
      // Pattern italiano: 6 lettere + 2 cifre + 1 lettera + 2 cifre + 1 lettera + 3 cifre + 1 lettera
      return /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i.test(trimmed)
    case 'partitaIVA':
      // Facoltativa: valida se vuota o se ha 11 cifre esatte
      return trimmed.length === 0 || /^\d{11}$/.test(trimmed)
    case 'cellulare':
      // Solo cifre, + e - ammessi; almeno un carattere
      return trimmed.length > 0 && /^[0-9+\-]+$/.test(trimmed)
    case 'date':
      // Verifica che sia una data valida (formato gg-mm-aaaa)
      if (trimmed.length === 0) return false
      const dateParts = trimmed.split('-')
      if (dateParts.length !== 3) return false
      const [day, month, year] = dateParts.map(Number)
      const dateObj = new Date(year, month - 1, day)
      return (
        dateObj.getFullYear() === year &&
        dateObj.getMonth() === month - 1 &&
        dateObj.getDate() === day
      )
    default:
      return trimmed.length > 0
  }
}

/**
 * Restituisce il messaggio di errore per un campo
 */
function getErrorMessage(key) {
  return errorMessages[key]
}

/**
 * Calcola se l'utente è under 35 basandosi sulla data di nascita
 */
function calculateAge(birthDateString) {
  // Parse del formato gg-mm-aaaa
  const [day, month, year] = birthDateString.split('-').map(Number)
  const birthDate = new Date(year, month - 1, day)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--
  }

  return age
}

/**
 * Aggiorna la visibilità dei panel
 */
function updatePanels() {
  panels.forEach((panel, index) => {
    if (panel) {
      panel.style.display = index + 1 === currentStep ? 'flex' : 'none'
    }
  })
}

/**
 * Aggiorna le classi degli step indicator
 */
function updateStepIndicators() {
  stepIndicators.forEach((indicator, index) => {
    const stepNum = index + 1
    indicator.classList.remove('is-current', 'is-done')

    if (stepNum < currentStep) {
      indicator.classList.add('is-done')
    } else if (stepNum === currentStep) {
      indicator.classList.add('is-current')
    }
  })
}

/**
 * Aggiorna la visibilità dei pulsanti
 */
function updateButtons() {
  // Pulsante Indietro: visibile solo dallo step 2 in poi
  if (indietroBtn) {
    indietroBtn.style.display = currentStep > 1 ? 'flex' : 'none'
  }

  // Pulsante Avanti: sempre visibile
  if (avantiBtn) {
    avantiBtn.style.display = 'flex'
  }
}

/**
 * Valida i campi dello step corrente
 */
function validateCurrentStep() {
  const fieldsToValidate = stepFields[currentStep]
  let hasErrors = false

  fieldsToValidate.forEach((key) => {
    const field = formFields[key]
    field.value = field.input?.value || ''
    field.isValid = validateField(key, field.value)

    if (!field.isValid) {
      hasErrors = true
      if (field.messageEl) {
        field.messageEl.textContent = getErrorMessage(key)
        field.messageEl.style.display = 'block'
      }
      field.input?.classList.add('is-error')
      field.input?.classList.remove('is-success')
    } else {
      if (field.messageEl) {
        field.messageEl.style.display = 'none'
      }
      field.input?.classList.remove('is-error')
      field.input?.classList.add('is-success')
    }
  })

  return !hasErrors
}

/**
 * Mostra l'alert pre-Stripe
 */
function showAlert() {
  if (alertEl) {
    alertEl.style.display = 'flex'
    window.lenis?.stop()
  }
}

/**
 * Nasconde l'alert pre-Stripe
 */
function hideAlert() {
  if (alertEl) {
    alertEl.style.display = 'none'
    window.lenis?.start()
  }
}

/**
 * Gestisce il click sull'overlay dell'alert (fuori dalla card)
 */
function handleAlertOverlayClick(e) {
  if (e.target === alertEl) {
    hideAlert()
  }
}

/**
 * Gestisce il click sul pulsante "Avanti"
 */
function handleAvantiClick(e) {
  e.preventDefault()

  if (!validateCurrentStep()) {
    return
  }

  if (currentStep < 3) {
    // Vai allo step successivo
    currentStep++
    updatePanels()
    updateStepIndicators()
    updateButtons()
  } else {
    // Step 3 completato - calcola età e mostra alert
    const birthDateValue = formFields.date.value
    const age = calculateAge(birthDateValue)
    isUnder35 = age < 35

    console.log('Form completato. Età:', age, 'Under 35:', isUnder35)
    showAlert()
  }
}

/**
 * Gestisce il click sul pulsante "Indietro"
 */
function handleIndietroClick(e) {
  e.preventDefault()

  if (currentStep > 1) {
    currentStep--
    updatePanels()
    updateStepIndicators()
    updateButtons()
  }
}

/**
 * Gestisce il click su "Indietro" nell'alert
 */
function handleAlertIndietroClick(e) {
  e.preventDefault()
  hideAlert()
}

/**
 * Gestisce il click su "Vai al checkout" nell'alert
 */
function handleCheckoutClick(e) {
  e.preventDefault()

  // Ottieni il link corretto basandosi sull'età
  const linkType = isUnder35 ? 'UNDER35' : 'OVER35'
  const linkEl = document.querySelector(`[data-link-check="${linkType}"]`)
  const checkoutUrl = linkEl?.href

  if (!checkoutUrl) {
    console.error('Link checkout non trovato')
    return
  }

  // Riabilita temporaneamente il submit e invia il form
  if (submitBtn) {
    submitBtn.disabled = false
  }

  // Invia il form
  if (form) {
    // Rimuovi temporaneamente il listener che blocca il submit
    const originalOnSubmit = form.onsubmit
    form.onsubmit = null

    // Crea e dispatchta l'evento submit
    form.requestSubmit(submitBtn)

    // Ripristina
    form.onsubmit = originalOnSubmit
  }

  // Apri il link Stripe in una nuova tab
  window.open(checkoutUrl, '_blank')

  // Chiudi l'alert
  hideAlert()
}

/**
 * Inizializza il form di iscrizione
 */
function initIscrizioneForm() {
  initFormFields()

  // Stato iniziale
  updatePanels()
  updateStepIndicators()
  updateButtons()

  // Nascondi l'alert inizialmente
  hideAlert()

  // Disabilita il pulsante submit
  if (submitBtn) {
    submitBtn.disabled = true
  }

  // Blocca il tasto Invio su tutti gli input del form
  if (form) {
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        // Simula il click sul pulsante Avanti quando si preme Invio
        avantiBtn?.click()
      }
    })
  }

  // Event listeners
  avantiBtn?.addEventListener('click', handleAvantiClick)
  indietroBtn?.addEventListener('click', handleIndietroClick)
  alertIndietroBtn?.addEventListener('click', handleAlertIndietroClick)
  alertCheckoutBtn?.addEventListener('click', handleCheckoutClick)
  alertEl?.addEventListener('click', handleAlertOverlayClick)
}
