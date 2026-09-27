import {
  getHanzi,
  loadHanzi
} from './hanzi.js'


let currentTone = null
let toneItems = []
let currentIndex = 0
let currentItem = null
let comparisonVisible = false


function getBasePinyin(pinyin) {

  if (!pinyin) {
    return ''
  }

  return pinyin
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[0-9]/g, '')
    .trim()
}


function getToneNumber(item) {

  if (item.tone) {
    return Number(item.tone)
  }

  if (
    Array.isArray(item.tones) &&
    item.tones.length === 1
  ) {
    return Number(item.tones[0])
  }

  return null
}


/*
 * Common everyday Mandarin characters.
 *
 * The comparison feature uses this list to avoid
 * showing obscure dictionary characters.
 */
const commonCharacters = new Set(
  `
我你他她它们的了不在有是人这那一个大中小上下来去
好很也都和与要会能可以说看听吃喝做想知道觉得
什么怎么为什么谁哪哪里这里那里现在时候已经还没没有
吧呢吗啊呀哦嗯
家学校学生老师朋友工作公司钱车店饭菜水茶米面
天地方日月年今天明天昨天早上晚上上午下午
爸爸妈妈爸妈孩子儿子女儿男人女人名字中国美国
北京上海
猪肉鸡鱼牛羊
红白黑蓝绿黄
一二三四五六七八九十百千
住主助著注竹
时十实事世市师诗
吃迟池
书树水
开会生声生日
学写话
读听
买卖
走坐站
进出
开关
新旧
多少
长短
高低
快慢
热冷
早晚
前后左右
东西南北
里外
对错
真假
最更
喜欢爱想要
请谢谢再见对不起
认识明白
帮助问题回答
开始结束
一起
可能应该需要
事情地方
语言中文英文
学习生活
`
    .replace(/\s+/g, '')
)


function findToneVariants(item) {

  const basePinyin =
    getBasePinyin(item.pinyin)

  if (!basePinyin) {
    return []
  }

  const allHanzi = getHanzi()

  const variants = []

  for (const candidate of allHanzi) {

    if (
      getBasePinyin(candidate.pinyin) !==
      basePinyin
    ) {
      continue
    }

    const tone =
      getToneNumber(candidate)

    if (
      !tone ||
      tone < 1 ||
      tone > 4
    ) {
      continue
    }

    if (
      !commonCharacters.has(
        candidate.character
      )
    ) {
      continue
    }

    const alreadyExists =
      variants.some(
        existing =>
          existing.character ===
          candidate.character
      )

    if (!alreadyExists) {
      variants.push(candidate)
    }
  }

  variants.sort(
    (a, b) =>
      getToneNumber(a) -
      getToneNumber(b)
  )

  return variants
}


/*
 * Direct speech for tone comparison characters.
 *
 * This is known to work on the phone.
 */
function speakComparisonCharacter(character) {

  if (
    !character ||
    !('speechSynthesis' in window)
  ) {
    return
  }

  const utterance =
    new SpeechSynthesisUtterance(
      character
    )

  utterance.lang = 'zh-TW'
  utterance.rate = 0.85
  utterance.pitch = 1
  utterance.volume = 1

  window.speechSynthesis.speak(
    utterance
  )
}


/*
 * Direct speech for the main Tone character.
 *
 * This deliberately uses the exact same speech
 * approach as the working comparison buttons.
 */
export function playCurrentToneSound() {

  if (
    !currentItem ||
    !currentItem.character ||
    !('speechSynthesis' in window)
  ) {
    return
  }

  const utterance =
    new SpeechSynthesisUtterance(
      currentItem.character
    )

  utterance.lang = 'zh-TW'
  utterance.rate = 0.85
  utterance.pitch = 1
  utterance.volume = 1

  window.speechSynthesis.speak(
    utterance
  )
}


function renderComparison() {

  if (!currentItem) {
    return
  }

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

  const variants =
    findToneVariants(currentItem)

  sentenceElement.innerHTML = ''

  sentenceElement.classList.remove(
    'tone-choose-prompt'
  )

  const comparison =
    document.createElement('div')

  comparison.className =
    'tone-comparison'

  variants.forEach(item => {

    const column =
      document.createElement('div')

    column.className =
      'tone-comparison-item'

    const tone =
      getToneNumber(item)

    const toneLabel =
      document.createElement('div')

    toneLabel.className =
      'tone-comparison-label'

    toneLabel.textContent =
      `Tone ${tone}`

    const character =
      document.createElement('div')

    character.className =
      'tone-comparison-character'

    character.textContent =
      item.character

    const pinyin =
      document.createElement('div')

    pinyin.className =
      'tone-comparison-pinyin'

    pinyin.textContent =
      item.pinyin || ''

    const meaning =
      document.createElement('div')

    meaning.className =
      'tone-comparison-meaning'

    meaning.textContent =
      item.meaning || ''

    const listen =
      document.createElement('button')

    listen.type = 'button'

    listen.className =
      'tone-comparison-sound'

    listen.textContent = '🔊'

    listen.setAttribute(
      'aria-label',
      `Listen to ${item.character}`
    )

    listen.addEventListener(
      'click',
      event => {

        event.stopPropagation()

        speakComparisonCharacter(
          item.character
        )

      }
    )

    column.appendChild(
      toneLabel
    )

    column.appendChild(
      character
    )

    column.appendChild(
      pinyin
    )

    column.appendChild(
      meaning
    )

    column.appendChild(
      listen
    )

    comparison.appendChild(
      column
    )

  })

  sentenceElement.appendChild(
    comparison
  )

  soundButton.style.display =
    'none'

  pinyinElement.style.display =
    'none'

  translationElement.style.display =
    'none'

  wordDefinition.textContent = ''

  pictogramExplanation.textContent = ''
}


function renderToneCharacter(item) {

  currentItem = item
  comparisonVisible = false

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

  sentenceElement.classList.remove(
    'tone-choose-prompt'
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
}


export async function openTonePractice() {

  await loadHanzi()

  currentTone = null
  toneItems = []
  currentIndex = 0
  currentItem = null
  comparisonVisible = false

  const toneSelection =
    document.querySelector(
      '#toneSelection'
    )

  const normalButtons =
    document.querySelector(
      '#normalButtons'
    )

  const nextButton =
    document.querySelector(
      '#nextButton'
    )

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

  toneSelection.style.display =
    'flex'

  normalButtons.style.display =
    'flex'

  nextButton.textContent =
    'Next Hanzi'

  sentenceElement.textContent =
    'Choose a tone'

  sentenceElement.classList.add(
    'tone-choose-prompt'
  )

  soundButton.style.display =
    'none'

  pinyinElement.textContent = ''
  translationElement.textContent = ''

  pinyinElement.style.display =
    'none'

  translationElement.style.display =
    'none'
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
  comparisonVisible = false

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


export function toggleToneComparison() {

  if (!currentItem) {
    return
  }

  comparisonVisible =
    !comparisonVisible

  if (comparisonVisible) {
    renderComparison()
  } else {
    renderToneCharacter(
      currentItem
    )
  }
}