const PICTOGRAM_DATA_URL =
  'https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt'

const TONE_MARKS = {
  a: ['ā', 'á', 'ǎ', 'à'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],

  A: ['Ā', 'Á', 'Ǎ', 'À'],
  E: ['Ē', 'É', 'Ě', 'È'],
  I: ['Ī', 'Í', 'Ǐ', 'Ì'],
  O: ['Ō', 'Ó', 'Ǒ', 'Ò'],
  U: ['Ū', 'Ú', 'Ǔ', 'Ù'],
  Ü: ['Ǖ', 'Ǘ', 'Ǚ', 'Ǜ']
}

let pictograms = []
let currentPictogram = null

function addToneMarks(syllable) {
  const match = syllable.match(/^(.+?)([1-5])$/)

  if (!match) {
    return syllable
  }

  let base = match[1]
  const tone = Number(match[2])

  if (tone === 5) {
    return base
  }

  base = base
    .replace(/u:/g, 'ü')
    .replace(/v/g, 'ü')

  let vowelIndex = -1

  if (base.includes('a')) {
    vowelIndex = base.indexOf('a')
  } else if (base.includes('e')) {
    vowelIndex = base.indexOf('e')
  } else if (base.includes('ou')) {
    vowelIndex = base.indexOf('o')
  } else {
    const indexes = []

    for (let i = 0; i < base.length; i++) {
      if ('aeiouüAEIOUÜ'.includes(base[i])) {
        indexes.push(i)
      }
    }

    if (indexes.length > 0) {
      vowelIndex = indexes[indexes.length - 1]
    }
  }

  if (vowelIndex === -1) {
    return base
  }

  const vowel = base[vowelIndex]
  const marked = TONE_MARKS[vowel]?.[tone - 1]

  if (!marked) {
    return base
  }

  return (
    base.slice(0, vowelIndex) +
    marked +
    base.slice(vowelIndex + 1)
  )
}

function convertPinyin(pinyin) {
  if (!pinyin) {
    return ''
  }

  if (Array.isArray(pinyin)) {
    return pinyin
      .map(item => convertPinyin(item))
      .filter(Boolean)
      .join(', ')
  }

  return String(pinyin)
    .split(',')
    .map(item => addToneMarks(item.trim()))
    .filter(Boolean)
    .join(', ')
}

function getTonesFromPinyin(pinyin) {
  if (!pinyin) {
    return []
  }

  const values = Array.isArray(pinyin)
    ? pinyin
    : String(pinyin).split(',')

  const tones = []

  const toneMarkMap = {
    ā: 1, á: 2, ǎ: 3, à: 4,
    ē: 1, é: 2, ě: 3, è: 4,
    ī: 1, í: 2, ǐ: 3, ì: 4,
    ō: 1, ó: 2, ǒ: 3, ò: 4,
    ū: 1, ú: 2, ǔ: 3, ù: 4,
    ǖ: 1, ǘ: 2, ǚ: 3, ǜ: 4,

    Ā: 1, Á: 2, Ǎ: 3, À: 4,
    Ē: 1, É: 2, Ě: 3, È: 4,
    Ī: 1, Í: 2, Ǐ: 3, Ì: 4,
    Ō: 1, Ó: 2, Ǒ: 3, Ò: 4,
    Ū: 1, Ú: 2, Ǔ: 3, Ù: 4,
    Ǖ: 1, Ǘ: 2, Ǚ: 3, Ǜ: 4
  }

  values.forEach(value => {
    const text = String(value).trim()

    const numberMatch = text.match(/[1-5]/)

    if (numberMatch) {
      tones.push(Number(numberMatch[0]))
      return
    }

    for (const character of text) {
      if (toneMarkMap[character]) {
        tones.push(toneMarkMap[character])
        break
      }
    }
  })

  return [...new Set(tones)]
}

function parsePictogramData(text) {
  const results = []
  const lines = text.split('\n')

  for (const line of lines) {
    if (!line.trim()) {
      continue
    }

    try {
      const data = JSON.parse(line)

      if (!data.character) {
        continue
      }

      const pinyins = Array.isArray(data.pinyin)
        ? data.pinyin
        : data.pinyin
          ? [data.pinyin]
          : []

      const convertedPinyins = pinyins
        .map(pinyin => convertPinyin(pinyin))
        .filter(Boolean)

      const tones = getTonesFromPinyin(pinyins)

      results.push({
        character: data.character,
        pinyin: convertedPinyins.join(', '),
        pinyins: convertedPinyins,
        tones,
        tone: tones[0] || null,

        // Only use the actual dictionary definition.
        // Do NOT use etymology/origin data.
        meaning: data.definition || ''
      })
    } catch (error) {
      // Ignore malformed lines.
    }
  }

  const unique = new Map()

  results.forEach(item => {
    if (!unique.has(item.character)) {
      unique.set(item.character, item)
    }
  })

  return [...unique.values()]
}

export async function loadHanzi() {
  if (pictograms.length > 0) {
    return pictograms
  }

  try {
    const response = await fetch(PICTOGRAM_DATA_URL)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const text = await response.text()

    pictograms = parsePictogramData(text)

    return pictograms
  } catch (error) {
    console.error('Failed to load Hanzi data:', error)

    return []
  }
}

export function getHanzi() {
  return pictograms
}

function renderPictogram(item) {
  currentPictogram = item

  const characterElement =
    document.getElementById('sentence')

  const pinyinElement =
    document.getElementById('pinyin')

  const translationElement =
    document.getElementById('translation')

  const descriptionElement =
    document.getElementById('pictogramExplanation')

  const soundButton =
    document.getElementById('soundButton')

  if (characterElement) {
    characterElement.textContent = item.character
  }

  /*
   * Flashcard starts with ONLY the Hanzi visible.
   */

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

  /*
   * There is no description/etymology on a Hanzi
   * flashcard.
   */

  if (descriptionElement) {
    descriptionElement.textContent = ''
    descriptionElement.style.display = 'none'
  }

  /*
   * The sound button is available immediately.
   */

  if (soundButton) {
    soundButton.style.display = 'inline-flex'
  }

  /*
   * Tell speech.js exactly what should be spoken
   * when the existing Sound button is pressed.
   */

  document.dispatchEvent(
    new CustomEvent('trainer:setSpeech', {
      detail: {
        text: item.character
      }
    })
  )
}

export async function showRandomHanzi() {
  const data = await loadHanzi()

  if (!data.length) {
    return
  }

  const index =
    Math.floor(Math.random() * data.length)

  renderPictogram(data[index])
}

export function showNextHanzi() {
  if (!pictograms.length) {
    return
  }

  let index =
    Math.floor(Math.random() * pictograms.length)

  if (
    currentPictogram &&
    pictograms.length > 1 &&
    pictograms[index].character ===
      currentPictogram.character
  ) {
    index =
      (index + 1) %
      pictograms.length
  }

  renderPictogram(
    pictograms[index]
  )
}

export function revealPinyin() {
  const element =
    document.getElementById('pinyin')

  if (element) {
    element.style.display = 'block'
  }
}

export function revealTranslation() {
  const element =
    document.getElementById('translation')

  if (element) {
    element.style.display = 'block'
  }
}

export function playCurrentHanziSound() {
  if (!currentPictogram) {
    return
  }

  if (!('speechSynthesis' in window)) {
    return
  }

  const utterance =
    new SpeechSynthesisUtterance(
      currentPictogram.character
    )

  utterance.lang = 'zh-TW'
  utterance.rate = 0.8

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}