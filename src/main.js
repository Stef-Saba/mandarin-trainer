import './style.css'

document.querySelector('#app').innerHTML = `
  <main class="app">

    <section id="homeScreen">

      <h1>说说</h1>

      <p class="subtitle">Choose what you want to practise.</p>

      <div class="categories">

        <button class="category" data-category="beginner">
          <span class="category-title">🌱 Beginner Mandarin</span>
          <span class="category-description">Simple everyday sentences</span>
        </button>

        <button class="category" data-category="food">
          <span class="category-title">🍜 Food & Restaurants</span>
          <span class="category-description">Ordering, eating and food</span>
        </button>

        <button class="category" data-category="travel">
          <span class="category-title">✈️ Travel</span>
          <span class="category-description">Getting around and travelling</span>
        </button>

        <button class="category" data-category="business">
          <span class="category-title">💼 Business Chinese</span>
          <span class="category-description">Work and professional Mandarin</span>
        </button>

        <button class="category" data-category="conversation">
          <span class="category-title">💬 Everyday Conversation</span>
          <span class="category-description">Natural conversational Mandarin</span>
        </button>

        <button class="category" data-category="pictograms">
          <span class="category-title">🀄 Hanzi</span>
          <span class="category-description">Learn Chinese characters through their origins</span>
        </button>

        <button class="category" data-category="tones">
          <span class="category-title">🎵 Tones & Pronunciation</span>
          <span class="category-description">Learn Mandarin tones</span>
        </button>

      </div>
    </section>

    <section id="trainerScreen" style="display:none;">

      <button class="back" id="backButton">← Home</button>

      <h1 id="categoryTitle">说说</h1>

      <section class="card">

        <div class="sentence" id="sentence">
          Loading...
        </div>

        <button
          id="soundButton"
          class="sound-button"
          type="button"
          aria-label="Listen"
          style="display:none;"
        >
          🔊
        </button>

        <div id="wordDefinition" class="word-definition"></div>

        <div class="answer" id="pinyin"></div>

        <div class="answer" id="translation"></div>

        <div id="pictogramExplanation"></div>

      </section>

      <div class="buttons">

        <button id="pinyinButton">Pinyin</button>

        <button id="translationButton">Translation</button>

      </div>

      <button class="next" id="nextButton">
        Next sentence
      </button>

    </section>

  </main>
`

const homeScreen =
  document.querySelector('#homeScreen')

const trainerScreen =
  document.querySelector('#trainerScreen')

const categoryTitle =
  document.querySelector('#categoryTitle')

const sentenceElement =
  document.querySelector('#sentence')

const soundButton =
  document.querySelector('#soundButton')

const wordDefinition =
  document.querySelector('#wordDefinition')

const pinyinElement =
  document.querySelector('#pinyin')

const translationElement =
  document.querySelector('#translation')

const pictogramExplanation =
  document.querySelector('#pictogramExplanation')

const pinyinButton =
  document.querySelector('#pinyinButton')

const translationButton =
  document.querySelector('#translationButton')

const nextButton =
  document.querySelector('#nextButton')

let currentCategory = ''

let lastSentenceId = null

let currentPictogramIndex = 0

let currentSpeechText = ''

let speechGeneration = 0

let loadGeneration = 0

let chineseVoices = []

let pictograms = []

let pictogramsLoaded = false

let pictogramsLoadingPromise = null

const categoryNames = {

  beginner: '🌱 Beginner Mandarin',

  food: '🍜 Food & Restaurants',

  travel: '✈️ Travel',

  business: '💼 Business Chinese',

  conversation: '💬 Everyday Conversation',

  pictograms: '🀄 Hanzi',

  tones: '🎵 Tones & Pronunciation'

}

const categoryKeywords = {

  food: [
    '吃', '喝', '饭', '菜', '餐厅', '食物',
    '咖啡', '茶', '水', '面条', '米饭',
    '水果', '菜单', '点菜', '早餐',
    '午饭', '晚饭', '好吃'
  ],

  travel: [
    '旅行', '旅游', '机场', '飞机', '火车',
    '地铁', '公交', '车站', '酒店', '宾馆',
    '地图', '行李', '护照', '机票',
    '出发', '到达'
  ],

  business: [
    '工作', '公司', '老板', '经理', '会议',
    '办公室', '客户', '同事', '项目',
    '商务', '合同', '工资', '邮件',
    '报告', '市场'
  ],

  conversation: [
    '你好', '谢谢', '再见', '对不起',
    '喜欢', '觉得', '知道', '想',
    '可以', '需要', '为什么', '怎么样',
    '今天', '现在', '希望', '真的'
  ]

}

/* ------------------------------------------------------------------
   HANZI / CHARACTER ARCHIVE
------------------------------------------------------------------- */

const PICTOGRAM_DATA_URL =
  'https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt'

/* ------------------------------------------------------------------
   PINYIN
------------------------------------------------------------------- */

const toneMarks = {

  a: ['ā', 'á', 'ǎ', 'à'],

  e: ['ē', 'é', 'ě', 'è'],

  i: ['ī', 'í', 'ǐ', 'ì'],

  o: ['ō', 'ó', 'ǒ', 'ò'],

  u: ['ū', 'ú', 'ǔ', 'ù'],

  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ']

}

function addToneMarks(syllable, tone) {

  if (tone === 5 || tone === 0) {
    return syllable
  }

  const lower = syllable.toLowerCase()

  let vowelIndex = -1

  if (lower.includes('a')) {

    vowelIndex = lower.indexOf('a')

  } else if (lower.includes('e')) {

    vowelIndex = lower.indexOf('e')

  } else if (lower.includes('ou')) {

    vowelIndex = lower.indexOf('o')

  } else {

    const vowels = [
      'a',
      'e',
      'i',
      'o',
      'u',
      'ü'
    ]

    for (
      let i = lower.length - 1;
      i >= 0;
      i--
    ) {

      if (vowels.includes(lower[i])) {

        vowelIndex = i

        break

      }

    }

  }

  if (vowelIndex === -1) {
    return syllable
  }

  const vowel = lower[vowelIndex]

  const markedVowel =
    toneMarks[vowel]?.[tone - 1]

  if (!markedVowel) {
    return syllable
  }

  return (
    syllable.slice(0, vowelIndex) +
    markedVowel +
    syllable.slice(vowelIndex + 1)
  )

}

function convertPinyin(pinyin) {

  if (!pinyin) {
    return ''
  }

  return pinyin.replace(
    /([A-Za-züÜ]+)([1-5])/g,
    (_, syllable, tone) =>
      addToneMarks(
        syllable,
        Number(tone)
      )
  )

}

function extractEnglish(sentence) {

  const translations =
    sentence.translations || []

  for (const group of translations) {

    const items =
      Array.isArray(group)
        ? group
        : [group]

    for (const item of items) {

      if (
        item.lang === 'eng' &&
        item.text
      ) {

        return item.text

      }

    }

  }

  return ''

}

function extractPinyin(sentence) {

  const transcriptions =
    sentence.transcriptions || []

  for (const transcription of transcriptions) {

    if (!transcription.text) {
      continue
    }

    if (
      !/[\u3400-\u9FFF]/.test(
        transcription.text
      )
    ) {

      return convertPinyin(
        transcription.text
      )

    }

  }

  return ''

}

/* ------------------------------------------------------------------
   SPEECH
------------------------------------------------------------------- */

function refreshChineseVoices() {

  if (!('speechSynthesis' in window)) {

    chineseVoices = []

    return

  }

  const voices =
    window.speechSynthesis.getVoices()

  chineseVoices =
    voices.filter(
      voice =>
        voice.lang &&
        voice.lang
          .toLowerCase()
          .startsWith('zh')
    )

}

if ('speechSynthesis' in window) {

  refreshChineseVoices()

  window.speechSynthesis.addEventListener(
    'voiceschanged',
    refreshChineseVoices
  )

}

function getBestChineseVoice() {

  refreshChineseVoices()

  if (!chineseVoices.length) {
    return null
  }

  return (

    chineseVoices.find(
      voice =>
        voice.lang
          .toLowerCase() ===
        'zh-tw'
    ) ||

    chineseVoices.find(
      voice =>
        voice.lang
          .toLowerCase()
          .startsWith('zh-tw')
    ) ||

    chineseVoices.find(
      voice =>
        voice.lang
          .toLowerCase() ===
        'zh-cn'
    ) ||

    chineseVoices.find(
      voice =>
        voice.lang
          .toLowerCase()
          .startsWith('zh-cn')
    ) ||

    chineseVoices[0]

  )

}

function speakChinese(text) {

  if (
    !text ||
    !('speechSynthesis' in window)
  ) {

    return

  }

  const synth =
    window.speechSynthesis

  const requestGeneration =
    speechGeneration

  synth.cancel()

  const attemptSpeech = () => {

    if (
      requestGeneration !==
      speechGeneration
    ) {

      return

    }

    const voice =
      getBestChineseVoice()

    const utterance =
      new SpeechSynthesisUtterance(text)

    if (voice) {

      utterance.voice = voice

      utterance.lang =
        voice.lang

    } else {

      utterance.lang = 'zh-TW'

    }

    utterance.rate = 0.85

    utterance.pitch = 1

    utterance.onstart = () => {

      if (
        requestGeneration !==
        speechGeneration
      ) {

        synth.cancel()

      }

    }

    utterance.onerror = event => {

      console.warn(
        'Chinese speech failed:',
        event.error,
        text
      )

    }

    synth.speak(utterance)

  }

  if (synth.getVoices().length) {

    attemptSpeech()

  } else {

    setTimeout(
      attemptSpeech,
      150
    )

  }

}

/* ------------------------------------------------------------------
   HANZI / CHARACTER ARCHIVE
------------------------------------------------------------------- */

function parsePictogramData(text) {

  const results = []

  const lines =
    text.split(/\r?\n/)

  for (const line of lines) {

    if (!line.trim()) {
      continue
    }

    try {

      const data =
        JSON.parse(line)

      if (
        !data.character ||
        !data.etymology ||
        data.etymology.type !==
          'pictographic'
      ) {

        continue

      }

      if (
        [...data.character].length !== 1 ||
        !/[\u3400-\u9FFF]/.test(
          data.character
        )
      ) {

        continue

      }

      const pinyin =
        Array.isArray(data.pinyin)
          ? data.pinyin[0] || ''
          : data.pinyin || ''

      const definition =
        data.definition ||
        'Chinese character'

      let origin =
        data.etymology.hint ||
        data.etymology.semantic ||
        ''

      if (!origin) {

        origin =
          'An ancient pictographic form representing its original meaning.'

      }

      results.push({

        character:
          data.character,

        pinyin:
          convertPinyin(pinyin),

        meaning:
          definition,

        origin

      })

    } catch (error) {

      // Ignore malformed records.

    }

  }

  const unique =
    new Map()

  for (const item of results) {

    if (!unique.has(item.character)) {

      unique.set(
        item.character,
        item
      )

    }

  }

  return [
    ...unique.values()
  ]

}

async function loadPictograms() {

  if (pictogramsLoaded) {
    return pictograms
  }

  if (pictogramsLoadingPromise) {
    return pictogramsLoadingPromise
  }

  pictogramsLoadingPromise =
    fetch(PICTOGRAM_DATA_URL)

      .then(response => {

        if (!response.ok) {

          throw new Error(
            `Character archive request failed: ${response.status}`
          )

        }

        return response.text()

      })

      .then(text => {

        const candidates =
          parsePictogramData(text)

        if (!candidates.length) {

          throw new Error(
            'No pictographic characters were found.'
          )

        }

        /*
         * Hanzi comes directly from the
         * character-origin archive.
         *
         * We deliberately do NOT verify every
         * character against the Taiwan Mandarin API.
         */

        pictograms =
          candidates

        pictogramsLoaded =
          true

        console.log(
          `Hanzi library: ${pictograms.length} characters`
        )

        return pictograms

      })

      .catch(error => {

        console.error(
          'Could not load Hanzi library:',
          error
        )

        pictogramsLoadingPromise =
          null

        throw error

      })

  return pictogramsLoadingPromise

}

/* ------------------------------------------------------------------
   SENTENCE DISPLAY
------------------------------------------------------------------- */

function renderClickableSentence(sentence) {

  sentenceElement.innerHTML = ''

  const segmenter =
    typeof Intl !== 'undefined' &&
    Intl.Segmenter
      ? new Intl.Segmenter(
          'zh',
          { granularity: 'word' }
        )
      : null

  const words = segmenter
    ? [...segmenter.segment(sentence)]
        .map(item => item.segment)
        .filter(Boolean)
    : [...sentence]

  for (const word of words) {

    const isChinese =
      /[\u3400-\u9FFF]/.test(word)

    const isPunctuation =
      /^[，。！？、,.!?；：:（）()「」“”‘’]+$/.test(
        word
      )

    if (
      !isChinese ||
      isPunctuation
    ) {

      const span =
        document.createElement('span')

      span.textContent = word

      sentenceElement.appendChild(
        span
      )

      continue

    }

    const wordSpan =
      document.createElement('span')

    wordSpan.className =
      'word'

    wordSpan.textContent =
      word

    wordSpan.addEventListener(
      'click',
      async () => {

        /*
         * A single character may have a
         * pictographic origin.
         *
         * Load the Hanzi archive only when
         * needed, then look for the character.
         */

        if ([...word].length === 1) {

          try {

            await loadPictograms()

            const pictogram =
              pictograms.find(
                item =>
                  item.character === word
              )

            if (pictogram) {

              showPictogramDefinition(
                pictogram
              )

              return

            }

          } catch (error) {

            console.warn(
              'Could not load Hanzi library for character:',
              error
            )

          }

        }

        /*
         * If it isn't a pictographic Hanzi,
         * or it is a multi-character word,
         * use the normal dictionary.
         */

        lookupWord(word)

      }
    )

    sentenceElement.appendChild(
      wordSpan
    )

  }

}

function showPictogramDefinition(
  pictogram
) {

  stopAudio()

  currentSpeechText =
    pictogram.character

  wordDefinition.innerHTML =
    ''

  pinyinElement.textContent =
    pictogram.pinyin ||
    'Pinyin not available'

  translationElement.textContent =
    pictogram.meaning ||
    'Meaning not available'

  pictogramExplanation.innerHTML = `
    <div class="pictogram-origin">
      ${pictogram.origin}
    </div>
  `

  pinyinElement.style.display =
    'block'

  translationElement.style.display =
    'block'

  soundButton.style.display =
    'inline-block'

}

/* ------------------------------------------------------------------
   DICTIONARY
------------------------------------------------------------------- */

async function convertToTaiwanTraditional(
  word
) {

  const url =
    'https://api.zhconvert.org/convert' +
    `?text=${encodeURIComponent(word)}` +
    '&converter=Taiwan' +
    '&outputFormat=json'

  const response =
    await fetch(url)

  if (!response.ok) {

    throw new Error(
      `Chinese conversion failed: ${response.status}`
    )

  }

  const data =
    await response.json()

  const converted =
    data?.data?.text

  if (!converted) {

    throw new Error(
      'Chinese conversion returned no text'
    )

  }

  return converted

}

async function fetchDictionaryEntry(
  endpoint,
  value
) {

  const url =
    `https://api.taiwanmandarin.com/${endpoint}/${encodeURIComponent(value)}`

  const response =
    await fetch(url)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {

    console.warn(
      `Dictionary request failed: ${response.status} for ${value}`
    )

    return null

  }

  const data =
    await response.json()

  if (!data) {
    return null
  }

  return data

}

async function lookupWord(word) {

  wordDefinition.innerHTML =
    '<div class="definition-loading">Looking up...</div>'

  soundButton.style.display =
    'none'

  currentSpeechText =
    ''

  try {

    const endpoint =
      [...word].length === 1
        ? 'characters'
        : 'words'

    let data =
      await fetchDictionaryEntry(
        endpoint,
        word
      )

    if (data) {

      showWordDefinition(
        data,
        word,
        word
      )

      return

    }

    /*
     * Tatoeba uses Mandarin Chinese
     * sentences, while the Taiwan Mandarin
     * dictionary uses Traditional Chinese.
     *
     * Try the original form first.
     * Only convert when necessary.
     */

    let traditional = word

    try {

      traditional =
        await convertToTaiwanTraditional(
          word
        )

    } catch (conversionError) {

      console.warn(
        'Traditional conversion failed:',
        conversionError
      )

    }

    if (traditional !== word) {

      const traditionalEndpoint =
        [...traditional].length === 1
          ? 'characters'
          : 'words'

      data =
        await fetchDictionaryEntry(
          traditionalEndpoint,
          traditional
        )

      if (data) {

        if (
          [...traditional].length === 1
        ) {

          const pictogram =
            pictograms.find(
              item =>
                item.character ===
                traditional
            )

          if (pictogram) {

            showPictogramDefinition(
              pictogram
            )

            return

          }

        }

        showWordDefinition(
          data,
          word,
          traditional
        )

        return

      }

    }

    if (
      [...traditional].length > 1
    ) {

      await lookupCharacters(
        traditional,
        word
      )

      return

    }

    throw new Error(
      `No dictionary entry found for ${word}`
    )

  } catch (error) {

    console.error(
      'Dictionary lookup failed:',
      error
    )

    wordDefinition.innerHTML = `
      <div class="definition-empty">
        No definition found for
        <strong>${word}</strong>.
      </div>
    `

  }

}

async function lookupCharacters(
  traditionalWord,
  originalWord
) {

  const results = []

  for (
    const character of traditionalWord
  ) {

    if (
      !/[\u3400-\u9FFF]/.test(
        character
      )
    ) {

      continue

    }

    try {

      const data =
        await fetchDictionaryEntry(
          'characters',
          character
        )

      if (data) {
        results.push(data)
      }

    } catch (error) {

      console.warn(
        `Could not look up ${character}:`,
        error
      )

    }

  }

  if (!results.length) {

    wordDefinition.innerHTML = `
      <div class="definition-empty">
        No definition found for
        <strong>${originalWord}</strong>.
      </div>
    `

    return

  }

  wordDefinition.innerHTML = `
    <div class="definition-word">
      ${originalWord}
    </div>

    ${
      traditionalWord !== originalWord
        ? `
          <div class="definition-traditional">
            ${traditionalWord}
          </div>
        `
        : ''
    }

    <div class="character-hint">
      Individual characters
    </div>

    ${
      results
        .map(
          data => `
            <div class="character-result">

              <span class="character-result-symbol">
                ${data.char || ''}
              </span>

              <span class="character-result-pinyin">
                ${data.pinyin || ''}
              </span>

              <span class="character-result-english">
                ${data.english || ''}
              </span>

            </div>
          `
        )
        .join('')
    }
  `

}

function showWordDefinition(
  data,
  originalWord,
  traditionalWord
) {

  const pinyin =
    data.pinyin || ''

  const english =
    data.english || ''

  const level =
    data.tocfl_level_name || ''

  wordDefinition.innerHTML = `
    <div class="definition-word">
      ${originalWord}
    </div>

    ${
      traditionalWord !== originalWord
        ? `
          <div class="definition-traditional">
            ${traditionalWord}
          </div>
        `
        : ''
    }

    ${
      pinyin
        ? `
          <div class="definition-pinyin">
            ${pinyin}
          </div>
        `
        : ''
    }

    ${
      english
        ? `
          <div class="definition-english">
            ${english}
          </div>
        `
        : ''
    }

    ${
      level
        ? `
          <div class="definition-level">
            ${level}
          </div>
        `
        : ''
    }
  `

}

function clearWordDefinition() {

  wordDefinition.innerHTML =
    ''

}

/* ------------------------------------------------------------------
   SENTENCE / HANZI DISPLAY
------------------------------------------------------------------- */

function showSentence(
  sentence,
  pinyin,
  translation
) {

  stopAudio()

  renderClickableSentence(
    sentence
  )

  currentSpeechText =
    ''

  pinyinElement.textContent =
    pinyin ||
    'Pinyin not available'

  translationElement.textContent =
    translation ||
    'Translation not available'

  pinyinElement.style.display =
    'none'

  translationElement.style.display =
    'none'

  pictogramExplanation.innerHTML =
    ''

  clearWordDefinition()

  soundButton.style.display =
    'none'

}

async function showPictogram() {

  stopAudio()

  if (!pictogramsLoaded) {

    sentenceElement.textContent =
      'Loading Hanzi...'

    await loadPictograms()

  }

  if (!pictograms.length) {

    throw new Error(
      'No Hanzi characters available'
    )

  }

  const pictogram =
    pictograms[
      currentPictogramIndex
    ]

  sentenceElement.innerHTML = `
    <div class="pictogram-character">
      ${pictogram.character}
    </div>
  `

  currentSpeechText =
    pictogram.character

  wordDefinition.innerHTML =
    ''

  pinyinElement.textContent =
    pictogram.pinyin ||
    'Pinyin not available'

  translationElement.textContent =
    pictogram.meaning ||
    'Meaning not available'

  pictogramExplanation.innerHTML = `
    <div class="pictogram-origin">
      ${pictogram.origin}
    </div>
  `

  pinyinElement.style.display =
    'none'

  translationElement.style.display =
    'none'

  soundButton.style.display =
    'inline-block'

}

/* ------------------------------------------------------------------
   TATOEBA
------------------------------------------------------------------- */

async function fetchSentences(url) {

  const response =
    await fetch(url)

  if (!response.ok) {

    throw new Error(
      `Tatoeba request failed: ${response.status}`
    )

  }

  const data =
    await response.json()

  return data.data || []

}

function prepareCandidates(
  sentences
) {

  return sentences

    .map(sentence => ({

      sentence,

      pinyin:
        extractPinyin(sentence),

      translation:
        extractEnglish(sentence)

    }))

    .filter(item => {

      return (
        item.pinyin &&
        item.translation &&
        item.sentence.id !==
          lastSentenceId
      )

    })

}

function scoreTopicSentence(
  sentence,
  keywords
) {

  let score = 0

  for (const keyword of keywords) {

    if (sentence.includes(keyword)) {

      score += keyword.length

    }

  }

  return score

}

async function findTopicSentence(
  category
) {

  const keywords =
    categoryKeywords[category]

  const shuffled =
    [...keywords].sort(
      () => Math.random() - 0.5
    )

  for (
    const keyword of
    shuffled.slice(0, 6)
  ) {

    const url =
      'https://api.tatoeba.org/v1/sentences' +
      '?lang=cmn' +
      '&sort=random' +
      `&q=${encodeURIComponent(keyword)}` +
      '&showtrans:lang=eng' +
      '&include=transcriptions'

    const sentences =
      await fetchSentences(url)

    const candidates =
      prepareCandidates(
        sentences
      )

    const scored =
      candidates

        .map(item => ({

          ...item,

          score:
            scoreTopicSentence(
              item.sentence.text,
              keywords
            )

        }))

        .filter(
          item =>
            item.score > 0
        )

        .sort(
          (a, b) =>
            b.score - a.score
        )

    if (scored.length) {

      const top =
        scored.slice(
          0,
          Math.min(
            5,
            scored.length
          )
        )

      return top[
        Math.floor(
          Math.random() *
          top.length
        )
      ]

    }

  }

  return null

}

async function findBeginnerSentence() {

  for (
    let attempt = 0;
    attempt < 6;
    attempt++
  ) {

    const url =
      'https://api.tatoeba.org/v1/sentences' +
      '?lang=cmn' +
      '&sort=random' +
      '&showtrans:lang=eng' +
      '&include=transcriptions'

    const sentences =
      await fetchSentences(
        url
      )

    const candidates =
      prepareCandidates(
        sentences
      )
        .filter(item => {

          const length =
            item.sentence.text
              .replace(
                /[，。！？、,.!?；：:]/g,
                ''
              )
              .length

          return (
            length >= 3 &&
            length <= 16
          )

        })

    if (candidates.length) {

      return candidates[
        Math.floor(
          Math.random() *
          candidates.length
        )
      ]

    }

  }

  return null

}

/* ------------------------------------------------------------------
   TRAINER
------------------------------------------------------------------- */

async function getSentence() {

  const requestId =
    ++loadGeneration

  stopAudio()

  sentenceElement.textContent =
    'Loading...'

  pinyinElement.style.display =
    'none'

  translationElement.style.display =
    'none'

  clearWordDefinition()

  pictogramExplanation.innerHTML =
    ''

  soundButton.style.display =
    'none'

  try {

    let result = null

    if (
      currentCategory ===
      'beginner'
    ) {

      result =
        await findBeginnerSentence()

    } else if (
      currentCategory ===
      'pictograms'
    ) {

      if (
        requestId !==
        loadGeneration
      ) {

        return

      }

      await showPictogram()

      return

    } else if (
      currentCategory ===
      'tones'
    ) {

      if (
        requestId !==
        loadGeneration
      ) {

        return

      }

      showSentence(
        '四声',
        'sì shēng',
        'The four Mandarin tones'
      )

      return

    } else {

      result =
        await findTopicSentence(
          currentCategory
        )

    }

    if (
      requestId !==
      loadGeneration
    ) {

      return

    }

    if (!result) {

      throw new Error(
        'No suitable sentence found'
      )

    }

    lastSentenceId =
      result.sentence.id

    showSentence(
      result.sentence.text,
      result.pinyin,
      result.translation
    )

  } catch (error) {

    if (
      requestId !==
      loadGeneration
    ) {

      return

    }

    console.error(error)

    sentenceElement.textContent =
      'Could not find a sentence.'

  }

}

function stopAudio() {

  speechGeneration++

  currentSpeechText =
    ''

  if (
    'speechSynthesis' in window
  ) {

    window.speechSynthesis.cancel()

  }

}

async function openCategory(
  category
) {

  stopAudio()

  loadGeneration++

  currentCategory =
    category

  lastSentenceId =
    null

  if (
    category ===
    'pictograms'
  ) {

    try {

      await loadPictograms()

      currentPictogramIndex =
        Math.floor(
          Math.random() *
          pictograms.length
        )

    } catch (error) {

      console.error(
        'Hanzi library failed to load:',
        error
      )

      categoryTitle.textContent =
        categoryNames[category]

      homeScreen.style.display =
        'none'

      trainerScreen.style.display =
        'block'

      sentenceElement.textContent =
        'Could not load Hanzi.'

      return

    }

  } else {

    currentPictogramIndex =
      0

  }

  categoryTitle.textContent =
    categoryNames[category]

  homeScreen.style.display =
    'none'

  trainerScreen.style.display =
    'block'

  if (
    category ===
    'pictograms'
  ) {

    nextButton.textContent =
      'Next Hanzi'

  } else {

    nextButton.textContent =
      'Next sentence'

  }

  getSentence()

}

/* ------------------------------------------------------------------
   EVENTS
------------------------------------------------------------------- */

document
  .querySelectorAll('.category')
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        openCategory(
          button.dataset.category
        )

      }
    )

  })

document
  .querySelector('#backButton')
  .addEventListener(
    'click',
    () => {

      stopAudio()

      loadGeneration++

      trainerScreen.style.display =
        'none'

      homeScreen.style.display =
        'block'

    }
  )

soundButton.addEventListener(
  'click',
  () => {

    if (currentSpeechText) {

      speakChinese(
        currentSpeechText
      )

    }

  }
)

pinyinButton.addEventListener(
  'click',
  () => {

    pinyinElement.style.display =
      'block'

  }
)

translationButton.addEventListener(
  'click',
  () => {

    translationElement.style.display =
      'block'

  }
)

nextButton.addEventListener(
  'click',
  async () => {

    stopAudio()

    if (
      currentCategory ===
      'pictograms'
    ) {

      if (!pictograms.length) {
        return
      }

      currentPictogramIndex =
        (
          currentPictogramIndex + 1
        ) %
        pictograms.length

    }

    await getSentence()

  }
)