const TATOEBA_BASE_URL =
  'https://api.tatoeba.org/v1/sentences'

const categoryKeywords = {
  beginner: [
    '你好',
    '谢谢',
    '請',
    '谢谢',
    '喜欢',
    '知道',
    '觉得',
    '可以',
    '想',
    '要',
    '会'
  ],

  food: [
    '吃',
    '喝',
    '饭',
    '飯',
    '餐厅',
    '餐廳',
    '菜',
    '食物',
    '菜单',
    '菜單',
    '咖啡',
    '茶',
    '水',
    '点',
    '點',
    '买',
    '買'
  ],

  travel: [
    '机场',
    '機場',
    '飞机',
    '飛機',
    '火车',
    '火車',
    '车站',
    '車站',
    '酒店',
    '飯店',
    '旅行',
    '旅游',
    '旅遊',
    '地图',
    '地圖',
    '票',
    '护照',
    '護照'
  ],

  business: [
    '公司',
    '工作',
    '经理',
    '經理',
    '老板',
    '老闆',
    '会议',
    '會議',
    '客户',
    '客戶',
    '项目',
    '項目',
    '合同',
    '合約',
    '办公室',
    '辦公室',
    '市场',
    '市場'
  ],

  everyday: [
    '今天',
    '明天',
    '昨天',
    '现在',
    '現在',
    '觉得',
    '覺得',
    '知道',
    '喜欢',
    '喜歡',
    '朋友',
    '家',
    '回',
    '来',
    '來',
    '去',
    '看',
    '听',
    '聽',
    '说',
    '說'
  ]
}

let currentSentence = null
let currentSentenceCategory = ''
let sentenceLoading = false

function getTrainerElements() {
  return {
    sentence:
      document.querySelector('#sentence'),

    definition:
      document.querySelector('#wordDefinition'),

    pinyin:
      document.querySelector('#pinyin'),

    translation:
      document.querySelector('#translation'),

    explanation:
      document.querySelector(
        '#pictogramExplanation'
      ),

    sound:
      document.querySelector('#soundButton'),

    next:
      document.querySelector('#nextButton')
  }
}

function buildTatoebaUrl(category) {
  const keywords =
    categoryKeywords[category] || []

  const keyword =
    keywords.length
      ? keywords[
          Math.floor(
            Math.random() *
            keywords.length
          )
        ]
      : ''

  const params =
    new URLSearchParams()

  params.set('lang', 'cmn')
  params.set('sort', 'random')

  // Explicitly request English translations.
  params.set(
    'showtrans:lang',
    'eng'
  )

  // Explicitly request transcriptions.
  params.set(
    'include',
    'transcriptions'
  )

  if (keyword) {
    params.set('q', keyword)
  }

  return (
    `${TATOEBA_BASE_URL}?${params.toString()}`
  )
}

function extractEnglishTranslation(sentence) {
  const translations =
    sentence?.translations

  if (!Array.isArray(translations)) {
    return ''
  }

  const results = []

  function collectEnglish(value) {
    if (!value) {
      return
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        collectEnglish(item)
      }

      return
    }

    if (
      typeof value !== 'object'
    ) {
      return
    }

    if (
      value.lang === 'eng' &&
      typeof value.text === 'string' &&
      value.text.trim()
    ) {
      results.push(
        value.text.trim()
      )
      return
    }

    for (const nested of Object.values(value)) {
      if (
        nested &&
        typeof nested === 'object'
      ) {
        collectEnglish(nested)
      }
    }
  }

  collectEnglish(translations)

  return [
    ...new Set(results)
  ].join('; ')
}

const toneMarks = {
  a: ['ā', 'á', 'ǎ', 'à'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ']
}

function addToneMarks(
  syllable,
  tone
) {
  if (
    tone < 1 ||
    tone > 4
  ) {
    return syllable
  }

  const lower =
    syllable.toLowerCase()

  let vowelIndex = -1

  if (lower.includes('a')) {
    vowelIndex =
      lower.indexOf('a')
  } else if (
    lower.includes('e')
  ) {
    vowelIndex =
      lower.indexOf('e')
  } else if (
    lower.includes('ou')
  ) {
    vowelIndex =
      lower.indexOf('o')
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
      if (
        vowels.includes(
          lower[i]
        )
      ) {
        vowelIndex = i
        break
      }
    }
  }

  if (vowelIndex === -1) {
    return syllable
  }

  const vowel =
    lower[vowelIndex]

  const markedVowel =
    toneMarks[vowel]?.[tone - 1]

  if (!markedVowel) {
    return syllable
  }

  return (
    syllable.slice(
      0,
      vowelIndex
    ) +
    markedVowel +
    syllable.slice(
      vowelIndex + 1
    )
  )
}

function convertNumberedPinyin(
  pinyin
) {
  if (!pinyin) {
    return ''
  }

  // Already tone-marked.
  if (
    /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(
      pinyin
    )
  ) {
    return pinyin
  }

  return pinyin.replace(
    /([A-Za-züÜ:]+)([1-5])/g,
    (
      _match,
      syllable,
      tone
    ) =>
      addToneMarks(
        syllable,
        Number(tone)
      )
  )
}

function extractPinyin(sentence) {
  const transcriptions =
    sentence?.transcriptions

  if (
    !Array.isArray(
      transcriptions
    )
  ) {
    return ''
  }

  const candidates = []

  function collect(value) {
    if (!value) {
      return
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        collect(item)
      }

      return
    }

    if (
      typeof value !== 'object'
    ) {
      return
    }

    const text =
      value.text ||
      value.transcription ||
      value.value ||
      ''

    if (
      typeof text === 'string' &&
      text.trim()
    ) {
      candidates.push(
        text.trim()
      )
    }

    for (
      const nested of
        Object.values(value)
    ) {
      if (
        nested &&
        typeof nested === 'object'
      ) {
        collect(nested)
      }
    }
  }

  collect(transcriptions)

  const pinyin =
    candidates.find(
      text =>
        /[A-Za-züÜ]+[1-5]/.test(
          text
        ) ||
        /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(
          text
        )
    )

  if (!pinyin) {
    return ''
  }

  return convertNumberedPinyin(
    pinyin
  )
}

function splitSentence(text) {
  if (
    typeof Intl !==
      'undefined' &&
    Intl.Segmenter
  ) {
    try {
      const segmenter =
        new Intl.Segmenter(
          'zh',
          {
            granularity: 'word'
          }
        )

      return [
        ...segmenter.segment(text)
      ].map(
        item => item.segment
      )
    } catch {
      // Fall through.
    }
  }

  return [...text]
}

function renderSentence(sentence) {
  const {
    sentence: sentenceElement
  } = getTrainerElements()

  sentenceElement.innerHTML = ''

  const parts =
    splitSentence(
      sentence.text
    )

  parts.forEach(part => {
    const span =
      document.createElement(
        'span'
      )

    span.className =
      'sentence-word'

    span.textContent =
      part

    if (
      /[\u3400-\u9FFF]/.test(
        part
      )
    ) {
      span.addEventListener(
        'click',
        () => {
          lookupWord(part)
        }
      )
    }

    sentenceElement.appendChild(
      span
    )
  })
}

async function fetchSentence(category) {
  const response =
    await fetch(
      buildTatoebaUrl(
        category
      )
    )

  if (!response.ok) {
    throw new Error(
      `Tatoeba request failed: ${response.status}`
    )
  }

  const data =
    await response.json()

  const sentences =
    Array.isArray(data.data)
      ? data.data
      : []

  const usable =
    sentences.filter(
      item =>
        item.text &&
        item.lang === 'cmn'
    )

  if (!usable.length) {
    throw new Error(
      'No usable Mandarin sentences returned.'
    )
  }

  return usable[
    Math.floor(
      Math.random() *
      usable.length
    )
  ]
}

async function convertToTaiwanTraditional(
  word
) {
  try {
    const response =
      await fetch(
        'https://api.zhconvert.org/convert' +
        `?text=${encodeURIComponent(word)}` +
        '&converter=Taiwan' +
        '&outputFormat=json'
      )

    if (!response.ok) {
      return word
    }

    const data =
      await response.json()

    return (
      data?.data?.text ||
      data?.text ||
      word
    )
  } catch {
    return word
  }
}

async function fetchDictionaryEntry(
  endpoint,
  value
) {
  try {
    const response =
      await fetch(
        `https://api.taiwanmandarin.com/${endpoint}/${encodeURIComponent(value)}`
      )

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch {
    return null
  }
}

function extractDictionaryMeaning(data) {
  if (!data) {
    return ''
  }

  if (
    typeof data === 'string'
  ) {
    return data
  }

  if (Array.isArray(data)) {
    return data
      .map(
        item =>
          extractDictionaryMeaning(
            item
          )
      )
      .filter(Boolean)
      .join('; ')
  }

  const fields = [
    'definition',
    'definitions',
    'meaning',
    'meanings',
    'gloss',
    'glosses',
    'translation',
    'translations',
    'english',
    'text'
  ]

  for (const field of fields) {
    if (data[field]) {
      const result =
        extractDictionaryMeaning(
          data[field]
        )

      if (result) {
        return result
      }
    }
  }

  return ''
}

function extractDictionaryPinyin(data) {
  if (!data) {
    return ''
  }

  if (Array.isArray(data)) {
    const values = data
      .map(
        item =>
          extractDictionaryPinyin(
            item
          )
      )
      .filter(Boolean)

    return [
      ...new Set(values)
    ].join(' · ')
  }

  if (
    typeof data !== 'object'
  ) {
    return ''
  }

  const fields = [
    'pinyin',
    'pronunciation',
    'romanization',
    'reading'
  ]

  const values = []

  for (const field of fields) {
    if (
      typeof data[field] ===
      'string'
    ) {
      values.push(
        data[field]
      )
    }

    if (
      Array.isArray(
        data[field]
      )
    ) {
      values.push(
        ...data[field].filter(
          value =>
            typeof value ===
            'string'
        )
      )
    }
  }

  if (values.length) {
    return [
      ...new Set(
        values
      )
    ].join(' · ')
  }

  for (
    const value of
      Object.values(data)
  ) {
    if (
      value &&
      typeof value === 'object'
    ) {
      const nested =
        extractDictionaryPinyin(
          value
        )

      if (nested) {
        values.push(nested)
      }
    }
  }

  return [
    ...new Set(values)
  ].join(' · ')
}

async function lookupWord(word) {
  const cleaned =
    word.trim()

  if (
    !cleaned ||
    !/[\u3400-\u9FFF]/.test(
      cleaned
    )
  ) {
    return
  }

  const {
    definition,
    pinyin,
    translation
  } = getTrainerElements()

  definition.textContent =
    'Looking up...'

  const traditional =
    await convertToTaiwanTraditional(
      cleaned
    )

  let result =
    await fetchDictionaryEntry(
      'search',
      traditional
    )

  let meaning =
    extractDictionaryMeaning(
      result
    )

  let dictionaryPinyin =
    extractDictionaryPinyin(
      result
    )

  if (
    !meaning &&
    traditional !== cleaned
  ) {
    result =
      await fetchDictionaryEntry(
        'search',
        cleaned
      )

    meaning =
      extractDictionaryMeaning(
        result
      )

    dictionaryPinyin =
      extractDictionaryPinyin(
        result
      )
  }

  if (
    !meaning &&
    [...traditional].length > 1
  ) {
    const meanings = []
    const pinyins = []

    for (
      const character of
        [...traditional]
    ) {
      const characterResult =
        await fetchDictionaryEntry(
          'search',
          character
        )

      const characterMeaning =
        extractDictionaryMeaning(
          characterResult
        )

      const characterPinyin =
        extractDictionaryPinyin(
          characterResult
        )

      if (characterMeaning) {
        meanings.push(
          `${character}: ${characterMeaning}`
        )
      }

      if (characterPinyin) {
        pinyins.push(
          `${character}: ${characterPinyin}`
        )
      }
    }

    meaning =
      meanings.join(' · ')

    dictionaryPinyin =
      pinyins.join(' · ')
  }

  definition.textContent =
    meaning ||
    'No dictionary entry found.'

  translation.textContent =
    meaning ||
    'No translation available'

  translation.style.display =
    'block'

  if (dictionaryPinyin) {
    pinyin.textContent =
      dictionaryPinyin

    pinyin.style.display =
      'block'
  }

  document.dispatchEvent(
    new CustomEvent(
      'trainer:setSpeech',
      {
        detail: {
          text: cleaned
        }
      }
    )
  )
}

export async function openSentence(
  category
) {
  currentSentenceCategory =
    category

  await loadSentence(
    category
  )
}

async function loadSentence(
  category
) {
  if (sentenceLoading) {
    return
  }

  sentenceLoading = true

  const {
    sentence,
    definition,
    pinyin,
    translation,
    explanation,
    sound,
    next
  } = getTrainerElements()

  sentence.textContent =
    'Loading sentence...'

  definition.textContent = ''
  pinyin.textContent = ''
  translation.textContent = ''
  explanation.textContent = ''

  pinyin.style.display =
    'none'

  translation.style.display =
    'none'

  sound.style.display =
    'inline-block'

  next.style.display =
    'block'

  next.textContent =
    'Next Sentence'

  try {
    const result =
      await fetchSentence(
        category
      )

    currentSentence =
      result

    renderSentence(
      result
    )

    const sentencePinyin =
      extractPinyin(
        result
      )

    pinyin.textContent =
      sentencePinyin ||
      'Pinyin not available'

    pinyin.style.display =
      'block'

    const english =
      extractEnglishTranslation(
        result
      )

    translation.textContent =
      english ||
      'Translation not available'

    translation.style.display =
      'block'

    document.dispatchEvent(
      new CustomEvent(
        'trainer:setSpeech',
        {
          detail: {
            text:
              result.text
          }
        }
      )
    )
  } catch (error) {
    console.error(
      'Could not load sentence:',
      error
    )

    sentence.textContent =
      'Could not load a sentence. Try again.'

    sound.style.display =
      'none'
  } finally {
    sentenceLoading =
      false
  }
}

export function showNextSentence(
  category
) {
  loadSentence(category)
}