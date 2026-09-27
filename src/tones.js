import {
  getHanzi,
  loadHanzi
} from './hanzi.js'

import {
  speakChinese
} from './speech.js'

let currentTone = null
let toneItems = []
let currentIndex = 0

function renderToneCharacter(item) {
  const sentenceElement =
    document.querySelector('#sentence')

  const soundButton =
    document.querySelector('#soundButton')

  const pinyinElement =
    document.querySelector('#pinyin')

  const translationElement =
    document.querySelector('#translation')

  const wordDefinition =
    document.querySelector('#wordDefinition')

  const pictogramExplanation =
    document.querySelector(
      '#pictogramExplanation'
    )

  sentenceElement.textContent =
    item.character

  pinyinElement.textContent =
    item.pinyin || ''

  translationElement.textContent =
    item.meaning || ''

  pinyinElement.style.display =
    'none'

  translationElement.style.display =
    'none'

  wordDefinition.textContent = ''

  pictogramExplanation.textContent = ''

  soundButton.style.display =
    'block'

  /*
   * Tones gets its own direct sound handler.
   * This avoids relying on the shared handler
   * in main.js for mobile Tones practice.
   */
  soundButton.onclick = event => {
    event.preventDefault()
    event.stopPropagation()

    speakChinese(item.character)
  }

  window.dispatchEvent(
    new CustomEvent(
      'trainer:setSpeech',
      {
        detail: {
          text: item.character
        }
      }
    )
  )
}

export async function openTonePractice() {
  await loadHanzi()

  const allHanzi =
    getHanzi()

  toneItems = []

  currentTone = null
  currentIndex = 0

  const toneSelection =
    document.querySelector(
      '#toneSelection'
    )

  const normalButtons =
    document.querySelector(
      '#normalButtons'
    )

  toneSelection.style.display =
    'flex'

  normalButtons.style.display =
    'flex'

  const nextButton =
    document.querySelector(
      '#nextButton'
    )

  nextButton.textContent =
    'Next Hanzi'

  const sentenceElement =
    document.querySelector(
      '#sentence'
    )

  const soundButton =
    document.querySelector(
      '#soundButton'
    )

  const pinyinElement =
    document.querySelector(
      '#pinyin'
    )

  const translationElement =
    document.querySelector(
      '#translation'
    )

  sentenceElement.textContent =
    'Choose a tone'

  soundButton.style.display =
    'none'

  pinyinElement.textContent = ''
  translationElement.textContent = ''

  pinyinElement.style.display =
    'none'

  translationElement.style.display =
    'none'

  allHanzi.forEach(item => {
    if (
      Array.isArray(item.tones) &&
      item.tones.length > 0
    ) {
      toneItems.push(item)
    }
  })
}

export function selectTone(tone) {
  const allHanzi =
    getHanzi()

  toneItems =
    allHanzi.filter(item =>
      Array.isArray(item.tones) &&
      item.tones.includes(tone)
    )

  currentTone = tone
  currentIndex = 0

  if (!toneItems.length) {
    return
  }

  renderToneCharacter(
    toneItems[currentIndex]
  )
}

export function showNextTone() {
  if (!toneItems.length) {
    return
  }

  currentIndex =
    (currentIndex + 1) %
    toneItems.length

  renderToneCharacter(
    toneItems[currentIndex]
  )
}