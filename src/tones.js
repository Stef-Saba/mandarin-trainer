import { getHanzi, loadHanzi } from './hanzi.js'

let selectedTone = null
let toneCharacters = []
let currentToneIndex = 0

function getCharacterElement() {
  return document.getElementById('sentence')
}

function getPinyinElement() {
  return document.getElementById('pinyin')
}

function getTranslationElement() {
  return document.getElementById('translation')
}

function getDescriptionElement() {
  return document.getElementById('pictogramExplanation')
}

function getSoundButton() {
  return document.getElementById('soundButton')
}

function renderToneCharacter(item) {
  const characterElement = getCharacterElement()
  const pinyinElement = getPinyinElement()
  const translationElement = getTranslationElement()
  const descriptionElement = getDescriptionElement()
  const soundButton = getSoundButton()

  if (characterElement) {
    characterElement.textContent = item.character
  }

  if (pinyinElement) {
    pinyinElement.textContent =
      item.pinyin || 'No pinyin available'

    pinyinElement.style.display = 'none'
  }

  if (translationElement) {
    translationElement.textContent =
      item.meaning || 'No translation available'

    translationElement.style.display = 'none'
  }

  if (descriptionElement) {
    descriptionElement.textContent = ''
    descriptionElement.style.display = 'none'
  }

  if (soundButton) {
    soundButton.style.display = 'inline-flex'
  }

  /*
   * Register the character with the existing
   * speech system.
   */
  document.dispatchEvent(
    new CustomEvent('trainer:setSpeech', {
      detail: {
        text: item.character
      }
    })
  )
}

function renderSelectedTone() {
  if (!toneCharacters.length) {
    const characterElement = getCharacterElement()
    const pinyinElement = getPinyinElement()
    const translationElement = getTranslationElement()
    const descriptionElement = getDescriptionElement()
    const soundButton = getSoundButton()

    if (characterElement) {
      characterElement.textContent =
        'No Hanzi available'
    }

    if (pinyinElement) {
      pinyinElement.textContent = ''
      pinyinElement.style.display = 'none'
    }

    if (translationElement) {
      translationElement.textContent = ''
      translationElement.style.display = 'none'
    }

    if (descriptionElement) {
      descriptionElement.textContent = ''
      descriptionElement.style.display = 'none'
    }

    if (soundButton) {
      soundButton.style.display = 'none'
    }

    return
  }

  renderToneCharacter(
    toneCharacters[currentToneIndex]
  )
}

export async function openTonePractice() {
  await loadHanzi()

  const toneSelection =
    document.getElementById('toneSelection')

  const normalButtons =
    document.getElementById('normalButtons')

  const nextButton =
    document.getElementById('nextButton')

  if (toneSelection) {
    toneSelection.style.display = 'flex'
  }

  if (normalButtons) {
    normalButtons.style.display = 'flex'
  }

  if (nextButton) {
    nextButton.textContent = 'Next Hanzi'
    nextButton.style.display = 'block'
  }

  selectedTone = null
  toneCharacters = []
  currentToneIndex = 0

  const characterElement =
    getCharacterElement()

  if (characterElement) {
    characterElement.textContent =
      'Choose a tone'
  }
}

export async function selectTone(tone) {
  await loadHanzi()

  selectedTone = tone

  const hanzi = getHanzi()

  toneCharacters = hanzi.filter(
    item =>
      Array.isArray(item.tones) &&
      item.tones.includes(tone)
  )

  currentToneIndex = 0

  renderSelectedTone()
}

export function showNextTone() {
  if (!toneCharacters.length) {
    return
  }

  currentToneIndex =
    (currentToneIndex + 1) %
    toneCharacters.length

  renderSelectedTone()
}