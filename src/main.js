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

          <span class="category-title">🀄 Pictograms</span>

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


const categoryNames = {

  beginner: '🌱 Beginner Mandarin',

  food: '🍜 Food & Restaurants',

  travel: '✈️ Travel',

  business: '💼 Business Chinese',

  conversation: '💬 Everyday Conversation',

  pictograms: '🀄 Pictograms',

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


const pictograms = [

  {
    character: '日',
    pinyin: 'rì',
    meaning: 'sun / day',
    origin: 'An ancient drawing representing the sun.'
  },

  {
    character: '月',
    pinyin: 'yuè',
    meaning: 'moon / month',
    origin: 'An ancient drawing representing the moon.'
  },

  {
    character: '山',
    pinyin: 'shān',
    meaning: 'mountain',
    origin: 'An ancient drawing representing mountain peaks.'
  },

  {
    character: '水',
    pinyin: 'shuǐ',
    meaning: 'water',
    origin: 'An ancient drawing representing flowing water.'
  },

  {
    character: '火',
    pinyin: 'huǒ',
    meaning: 'fire',
    origin: 'An ancient drawing representing flames.'
  },

  {
    character: '木',
    pinyin: 'mù',
    meaning: 'tree / wood',
    origin: 'An ancient drawing representing a tree.'
  },

  {
    character: '人',
    pinyin: 'rén',
    meaning: 'person',
    origin: 'An ancient drawing representing a person.'
  },

  {
    character: '口',
    pinyin: 'kǒu',
    meaning: 'mouth',
    origin: 'An ancient drawing representing a mouth.'
  },

  {
    character: '目',
    pinyin: 'mù',
    meaning: 'eye',
    origin: 'An ancient drawing representing an eye.'
  },

  {
    character: '手',
    pinyin: 'shǒu',
    meaning: 'hand',
    origin: 'An ancient drawing representing a hand.'
  },

  {
    character: '耳',
    pinyin: 'ěr',
    meaning: 'ear',
    origin: 'An ancient drawing representing an ear.'
  },

  {
    character: '女',
    pinyin: 'nǚ',
    meaning: 'woman',
    origin: 'An ancient drawing representing a woman.'
  }

]


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

    const vowels = ['a', 'e', 'i', 'o', 'u', 'ü']

    for (let i = lower.length - 1; i >= 0; i--) {

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
      addToneMarks(syllable, Number(tone))

  )

}


function extractEnglish(sentence) {

  const translations =
    sentence.translations || []

  for (const group of translations) {

    const items = Array.isArray(group)
      ? group
      : [group]

    for (const item of items) {

      if (item.lang === 'eng' && item.text) {
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

    if (!/[\u3400-\u9FFF]/.test(transcription.text)) {

      return convertPinyin(
        transcription.text
      )

    }

  }

  return ''

}


function splitChinese(sentence) {

  if (
    typeof Intl === 'undefined' ||
    !Intl.Segmenter
  ) {

    return [...sentence]

  }

  const segmenter =
    new Intl.Segmenter(
      'zh',
      { granularity: 'word' }
    )

  return [...segmenter.segment(sentence)]
    .map(item => item.segment)
    .filter(Boolean)

}


function renderClickableSentence(sentence) {

  sentenceElement.innerHTML = ''

  const words =
    splitChinese(sentence)

  for (const word of words) {

    const isChinese =
      /[\u3400-\u9FFF]/.test(word)

    const isPunctuation =
      /^[，。！？、,.!?；：:（）()「」“”‘’]+$/.test(word)

    if (!isChinese || isPunctuation) {

      const span =
        document.createElement('span')

      span.textContent = word

      sentenceElement.appendChild(span)

      continue

    }

    const button =
      document.createElement('button')

    button.className = 'word'

    button.textContent = word

    button.addEventListener(
      'click',
      () => lookupWord(word)
    )

    sentenceElement.appendChild(button)

  }

}


/* =====================================================
   DICTIONARY
   =====================================================

   The learner sees Simplified Chinese.

   Tatoeba gives us Simplified Chinese.

   The Taiwan Mandarin dictionary expects Traditional
   Chinese, so we convert only internally before making
   the dictionary request.

   Examples:

   面条 → 麵條
   还是 → 還是
   吃饭 → 吃飯

   IMPORTANT:

   Single characters use /characters/:character

   Words use /words/:word

   ===================================================== */


async function convertToTaiwanTraditional(word) {

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


async function lookupWord(word) {

  wordDefinition.innerHTML =
    '<div class="definition-loading">Looking up...</div>'

  try {

    /*
      First convert the Simplified Chinese to
      Traditional Chinese internally.

      The learner still sees the original
      Simplified Chinese.
    */

    const traditional =
      await convertToTaiwanTraditional(word)

    console.log(
      `Dictionary: ${word} → ${traditional}`
    )


    /*
      SINGLE CHARACTER

      Example:

      过 → 過

      Must use:

      /characters/過

      NOT:

      /words/過
    */

    if (traditional.length === 1) {

      const characterUrl =
        `https://api.taiwanmandarin.com/characters/${encodeURIComponent(traditional)}`

      console.log(
        `Dictionary character request: ${characterUrl}`
      )

      const response =
        await fetch(characterUrl)

      if (response.ok) {

        const data =
          await response.json()

        showWordDefinition(
          data,
          word,
          traditional
        )

        return

      }

      throw new Error(
        `No character entry for ${traditional}`
      )

    }


    /*
      MULTI-CHARACTER WORD

      Example:

      面条 → 麵條

      Use:

      /words/麵條
    */

    const wordUrl =
      `https://api.taiwanmandarin.com/words/${encodeURIComponent(traditional)}`

    console.log(
      `Dictionary word request: ${wordUrl}`
    )

    const response =
      await fetch(wordUrl)


    if (response.ok) {

      const data =
        await response.json()

      showWordDefinition(
        data,
        word,
        traditional
      )

      return

    }


    /*
      The multi-character word isn't in the
      dictionary.

      Fall back to looking up each character
      individually.
    */

    await lookupCharacters(
      traditional,
      word
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

  for (const character of traditionalWord) {

    if (!/[\u3400-\u9FFF]/.test(character)) {
      continue
    }

    try {

      const url =
        `https://api.taiwanmandarin.com/characters/${encodeURIComponent(character)}`

      const response =
        await fetch(url)

      if (!response.ok) {
        continue
      }

      const data =
        await response.json()

      results.push(data)

    } catch {

      // Continue with the remaining characters.

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

    <div class="definition-traditional">

      ${traditionalWord}

    </div>

    <div class="character-hint">

      Individual characters

    </div>

    ${results.map(data => `

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

    `).join('')}

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

  wordDefinition.innerHTML = ''

}


/* =====================================================
   SENTENCES
   ===================================================== */


function showSentence(
  sentence,
  pinyin,
  translation
) {

  renderClickableSentence(sentence)

  pinyinElement.textContent =
    pinyin || 'Pinyin not available'

  translationElement.textContent =
    translation || 'Translation not available'

  pinyinElement.style.display = 'none'

  translationElement.style.display = 'none'

  pictogramExplanation.innerHTML = ''

  clearWordDefinition()

}


function showPictogram() {

  const pictogram =
    pictograms[currentPictogramIndex]

  sentenceElement.innerHTML = `

    <div class="pictogram-character">

      ${pictogram.character}

    </div>

  `

  wordDefinition.innerHTML = ''

  pinyinElement.textContent =
    pictogram.pinyin

  translationElement.textContent =
    pictogram.meaning

  pictogramExplanation.innerHTML = `

    <div class="pictogram-origin">

      ${pictogram.origin}

    </div>

  `

  pinyinElement.style.display = 'none'

  translationElement.style.display = 'none'

}


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


function prepareCandidates(sentences) {

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

        item.sentence.id !== lastSentenceId

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


async function findTopicSentence(category) {

  const keywords =
    categoryKeywords[category]

  const shuffled =
    [...keywords].sort(
      () => Math.random() - 0.5
    )


  for (
    const keyword of shuffled.slice(0, 6)
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
      prepareCandidates(sentences)


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

        .filter(item => item.score > 0)

        .sort(
          (a, b) =>
            b.score - a.score
        )


    if (scored.length) {

      const top =
        scored.slice(
          0,
          Math.min(5, scored.length)
        )

      return top[
        Math.floor(
          Math.random() * top.length
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
      await fetchSentences(url)


    const candidates =
      prepareCandidates(sentences)

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


async function getSentence() {

  sentenceElement.textContent =
    'Loading...'

  pinyinElement.style.display =
    'none'

  translationElement.style.display =
    'none'

  clearWordDefinition()


  try {

    let result = null


    if (currentCategory === 'beginner') {

      result =
        await findBeginnerSentence()

    } else if (
      currentCategory === 'pictograms'
    ) {

      showPictogram()

      return

    } else if (
      currentCategory === 'tones'
    ) {

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

    console.error(error)

    sentenceElement.textContent =
      'Could not find a sentence.'

  }

}


/* =====================================================
   NAVIGATION
   ===================================================== */


function openCategory(category) {

  currentCategory =
    category

  lastSentenceId =
    null


  if (category === 'pictograms') {

    currentPictogramIndex =
      Math.floor(
        Math.random() *
        pictograms.length
      )

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


  if (category === 'pictograms') {

    nextButton.textContent =
      'Next pictogram'

  } else {

    nextButton.textContent =
      'Next sentence'

  }


  getSentence()

}


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

      trainerScreen.style.display =
        'none'

      homeScreen.style.display =
        'block'

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
  () => {

    if (currentCategory === 'pictograms') {

      currentPictogramIndex =
        (
          currentPictogramIndex + 1
        ) % pictograms.length

    }

    getSentence()

  }
)