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


/*
 * Everyday Mandarin practice pool.
 *
 * This deliberately favours useful HSK 1–3 vocabulary
 * rather than trying to include every dictionary character.
 *
 * The Make Me a Hanzi dictionary is still used as the
 * source for pinyin, tones and meanings.
 */

const COMMON_HANZI = new Set(
  `
我你他她它
我们你们他们她们
的了不没
是有在
这那
这里那里
哪谁什么
一个一些
人大家自己
也都还
很太最更
好不好
大大小小
多多少少
长短
高低
快慢
早晚
新旧
对错
真假

一二三四五六七八九十
百千

上下来
前后
左右
里面外面
东西南北
中间
开关
进出
回去回来
过来过去
走跑坐站

吃喝
饭菜
水果
肉鱼
鸡牛羊
米面
水茶
咖啡
酒
杯

买卖
钱
贵便宜
店
东西
衣服
鞋
书
手机
电脑
车
票
门

家
房子
学校
学生
老师
朋友
同学
孩子
爸爸
妈妈
哥哥
姐姐
弟弟
妹妹
儿子
女儿
男人
女人
名字
生日
年
月
日
天
今天
明天
昨天
现在
时候
早上
上午
中午
下午
晚上

工作
公司
老板
经理
问题
事情
办法
帮助
开始
结束
时间
地方
国家
中国
美国
英国
北京
上海

学
学习
上课
下课
读
写
看
听
说
话
问
回答
知道
认识
明白
觉得
想
要
需要
喜欢
爱
会
能
可以
应该
可能
希望
知道

给
找
用
做
住
等
等一下
叫
来
到
走
开
回
拿
放
找
送
帮

说
告诉
介绍
见
见面
认识
请
谢谢
再见
对不起
没关系
你好
好吃
好看
好玩

天气
热
冷
雨
雪
风
晴
阴
太阳
空气

红
黄
蓝
绿
白
黑

高兴
开心
快乐
喜欢
累
忙
饿
渴
冷
热
病
生病
身体
眼睛
耳朵
手
脚
头
脸
心

一会儿
已经
还
再
又
也
都
就
才
正在
一起
因为
所以
但是
如果
然后
真的
非常
比较
可能
一定
当然

语言
中文
英文
汉语
学习
生活
世界
文化
旅行
旅游
飞机
机场
火车
地铁
酒店
饭店
餐厅
城市
地图
照片

`
    .replace(/\s+/g, '')
)


function addToneMarks(syllable) {

  const match =
    syllable.match(/^(.+?)([1-5])$/)

  if (!match) {
    return syllable
  }

  let base = match[1]

  const tone =
    Number(match[2])

  if (tone === 5) {
    return base
  }

  base = base
    .replace(/u:/g, 'ü')
    .replace(/v/g, 'ü')

  let vowelIndex = -1

  if (base.includes('a')) {

    vowelIndex =
      base.indexOf('a')

  } else if (base.includes('e')) {

    vowelIndex =
      base.indexOf('e')

  } else if (base.includes('ou')) {

    vowelIndex =
      base.indexOf('o')

  } else {

    const indexes = []

    for (
      let i = 0;
      i < base.length;
      i++
    ) {

      if (
        'aeiouüAEIOUÜ'
          .includes(base[i])
      ) {
        indexes.push(i)
      }

    }

    if (indexes.length > 0) {

      vowelIndex =
        indexes[indexes.length - 1]

    }

  }

  if (vowelIndex === -1) {
    return base
  }

  const vowel =
    base[vowelIndex]

  const marked =
    TONE_MARKS[vowel]?.[tone - 1]

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
      .map(item =>
        convertPinyin(item)
      )
      .filter(Boolean)
      .join(', ')

  }

  return String(pinyin)
    .split(',')
    .map(item =>
      addToneMarks(
        item.trim()
      )
    )
    .filter(Boolean)
    .join(', ')

}


function getTonesFromPinyin(pinyin) {

  if (!pinyin) {
    return []
  }

  const values =
    Array.isArray(pinyin)
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

    const text =
      String(value).trim()

    const numberMatch =
      text.match(/[1-5]/)

    if (numberMatch) {

      tones.push(
        Number(numberMatch[0])
      )

      return
    }

    for (
      const character of text
    ) {

      if (
        toneMarkMap[character]
      ) {

        tones.push(
          toneMarkMap[character]
        )

        break
      }

    }

  })

  return [
    ...new Set(tones)
  ]

}


function parsePictogramData(text) {

  const results = []

  const lines =
    text.split('\n')

  for (const line of lines) {

    if (!line.trim()) {
      continue
    }

    try {

      const data =
        JSON.parse(line)

      if (!data.character) {
        continue
      }

      /*
       * Ignore dictionary characters that
       * aren't part of our useful practice pool.
       */

      if (
        !COMMON_HANZI.has(
          data.character
        )
      ) {
        continue
      }

      const pinyins =
        Array.isArray(data.pinyin)
          ? data.pinyin
          : data.pinyin
            ? [data.pinyin]
            : []

      const convertedPinyins =
        pinyins
          .map(pinyin =>
            convertPinyin(pinyin)
          )
          .filter(Boolean)

      const tones =
        getTonesFromPinyin(
          pinyins
        )

      results.push({

        character:
          data.character,

        pinyin:
          convertedPinyins.join(', '),

        pinyins:
          convertedPinyins,

        tones,

        tone:
          tones[0] || null,

        meaning:
          data.definition || ''

      })

    } catch (error) {

      // Ignore malformed lines.

    }

  }

  const unique =
    new Map()

  results.forEach(item => {

    if (
      !unique.has(
        item.character
      )
    ) {

      unique.set(
        item.character,
        item
      )

    }

  })

  return [
    ...unique.values()
  ]

}


export async function loadHanzi() {

  if (pictograms.length > 0) {
    return pictograms
  }

  try {

    const response =
      await fetch(
        PICTOGRAM_DATA_URL
      )

    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      )

    }

    const text =
      await response.text()

    pictograms =
      parsePictogramData(text)

    return pictograms

  } catch (error) {

    console.error(
      'Failed to load Hanzi data:',
      error
    )

    return []

  }

}


export function getHanzi() {

  return pictograms

}


function renderPictogram(item) {

  currentPictogram =
    item

  const characterElement =
    document.getElementById(
      'sentence'
    )

  const pinyinElement =
    document.getElementById(
      'pinyin'
    )

  const translationElement =
    document.getElementById(
      'translation'
    )

  const descriptionElement =
    document.getElementById(
      'pictogramExplanation'
    )

  const soundButton =
    document.getElementById(
      'soundButton'
    )

  if (characterElement) {

    characterElement.textContent =
      item.character

  }

  /*
   * Flashcard starts with ONLY
   * the Hanzi visible.
   */

  if (pinyinElement) {

    pinyinElement.textContent =
      item.pinyin ||
      'No pinyin available'

    pinyinElement.style.display =
      'none'

  }

  if (translationElement) {

    translationElement.textContent =
      item.meaning ||
      'No translation available'

    translationElement.style.display =
      'none'

  }

  /*
   * There is no description/etymology
   * on a Hanzi flashcard.
   */

  if (descriptionElement) {

    descriptionElement.textContent =
      ''

    descriptionElement.style.display =
      'none'

  }

  /*
   * Sound is available immediately.
   */

  if (soundButton) {

    soundButton.style.display =
      'inline-flex'

  }

  /*
   * Tell main.js exactly what should
   * be spoken.
   */

  document.dispatchEvent(
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


export async function showRandomHanzi() {

  const data =
    await loadHanzi()

  if (!data.length) {
    return
  }

  const index =
    Math.floor(
      Math.random() *
      data.length
    )

  renderPictogram(
    data[index]
  )

}


export function showNextHanzi() {

  if (!pictograms.length) {
    return
  }

  let index =
    Math.floor(
      Math.random() *
      pictograms.length
    )

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
    document.getElementById(
      'pinyin'
    )

  if (element) {

    element.style.display =
      'block'

  }

}


export function revealTranslation() {

  const element =
    document.getElementById(
      'translation'
    )

  if (element) {

    element.style.display =
      'block'

  }

}


export function playCurrentHanziSound() {

  if (!currentPictogram) {
    return
  }

  if (
    !('speechSynthesis' in window)
  ) {
    return
  }

  const utterance =
    new SpeechSynthesisUtterance(
      currentPictogram.character
    )

  utterance.lang = 'zh-TW'
  utterance.rate = 0.8

  window.speechSynthesis.cancel()

  window.speechSynthesis.speak(
    utterance
  )

}