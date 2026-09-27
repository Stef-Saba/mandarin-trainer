import './style.css'

import {
  initialiseSpeech,
  speakChinese
} from './speech.js'

import {
  loadHanzi,
  showRandomHanzi,
  showNextHanzi,
  revealPinyin,
  revealTranslation
} from './hanzi.js'

import {
  openTonePractice,
  selectTone,
  showNextTone,
  toggleToneComparison,
  playCurrentToneSound
} from './tones.js'

import {
  openSentencePractice,
  showNextSentence
} from './sentences.js'


const app =
  document.querySelector('#app')


let currentCategory = null


app.innerHTML = `
  <div class="app">

    <section id="home">

      <h1>说说</h1>

      <p class="subtitle">
        Mandarin practice
      </p>

      <div class="categories">

        <button
          class="category"
          data-category="hanzi"
        >
          <span class="category-title">
            汉字 Hanzi
          </span>

          <span class="category-description">
            Recognise characters
          </span>
        </button>


        <button
          class="category"
          data-category="tones"
        >
          <span class="category-title">
            🎵 Tones
          </span>

          <span class="category-description">
            Practise Mandarin tones
          </span>
        </button>


        <button
          class="category"
          data-category="sentences"
        >
          <span class="category-title">
            💬 Sentences
          </span>

          <span class="category-description">
            Read and understand Mandarin
          </span>
        </button>

      </div>

    </section>


    <section
      id="trainer"
      style="display: none;"
    >

      <button
        id="backButton"
        class="back"
      >
        ← Back
      </button>


      <div class="card">

        <div
          id="sentence"
          class="sentence"
        >
        </div>


        <div
          class="tone-card-controls"
        >

          <button
            id="soundButton"
            class="sound-button"
            type="button"
            aria-label="Play sound"
          >
            🔊
          </button>

          <button
            id="compareTonesButton"
            class="compare-tones-button"
            type="button"
            style="display: none;"
          >
            Compare tones
          </button>

        </div>


        <div
          id="pinyin"
          class="answer"
        >
        </div>


        <div
          id="translation"
          class="answer"
        >
        </div>


        <div
          id="wordDefinition"
          class="word-definition"
        >
        </div>


        <div
          id="pictogramExplanation"
          class="character-hint"
        >
        </div>


        <div
          id="normalButtons"
          class="buttons"
        >

          <button
            id="pinyinButton"
            type="button"
          >
            Pinyin
          </button>

          <button
            id="translationButton"
            type="button"
          >
            Translation
          </button>

        </div>


        <button
          id="nextButton"
          class="next"
          type="button"
        >
          Next
        </button>


        <div
          id="toneSelection"
          class="tone-buttons"
          style="display: none;"
        >

          <button
            type="button"
            data-tone="1"
          >
            Tone 1
          </button>

          <button
            type="button"
            data-tone="2"
          >
            Tone 2
          </button>

          <button
            type="button"
            data-tone="3"
          >
            Tone 3
          </button>

          <button
            type="button"
            data-tone="4"
          >
            Tone 4
          </button>

        </div>

      </div>

    </section>

  </div>
`


const home =
  document.querySelector('#home')

const trainer =
  document.querySelector('#trainer')

const backButton =
  document.querySelector('#backButton')

const sentenceElement =
  document.querySelector('#sentence')

const soundButton =
  document.querySelector('#soundButton')

const compareTonesButton =
  document.querySelector(
    '#compareTonesButton'
  )

const pinyinButton =
  document.querySelector(
    '#pinyinButton'
  )

const translationButton =
  document.querySelector(
    '#translationButton'
  )

const nextButton =
  document.querySelector(
    '#nextButton'
  )

const normalButtons =
  document.querySelector(
    '#normalButtons'
  )

const toneSelection =
  document.querySelector(
    '#toneSelection'
  )


async function openCategory(
  category
) {

  currentCategory =
    category

  home.style.display =
    'none'

  trainer.style.display =
    'block'

  document.body.className =
    `${category}-mode`

  compareTonesButton.style.display =
    'none'

  toneSelection.style.display =
    'none'

  normalButtons.style.display =
    'flex'


  if (category === 'hanzi') {

    await loadHanzi()

    showRandomHanzi()

    nextButton.textContent =
      'Next Hanzi'

  }


  if (category === 'tones') {

    await openTonePractice()

    compareTonesButton.style.display =
      'block'

  }


  if (category === 'sentences') {

    await openSentencePractice()

    nextButton.textContent =
      'Next Sentence'

  }

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


backButton.addEventListener(
  'click',
  () => {

    currentCategory =
      null

    trainer.style.display =
      'none'

    home.style.display =
      'block'

    document.body.className = ''

  }
)


soundButton.onclick = () => {

  if (
    currentCategory === 'tones'
  ) {

    playCurrentToneSound()

    return
  }


  const text =
    sentenceElement.textContent.trim()


  if (text) {

    speakChinese(text)

  }

}


pinyinButton.addEventListener(
  'click',
  () => {

    revealPinyin()

  }
)


translationButton.addEventListener(
  'click',
  () => {

    revealTranslation()

  }
)


nextButton.addEventListener(
  'click',
  () => {

    if (
      currentCategory === 'hanzi'
    ) {

      showNextHanzi()

      return
    }


    if (
      currentCategory === 'tones'
    ) {

      showNextTone()

      return
    }


    if (
      currentCategory === 'sentences'
    ) {

      showNextSentence()

    }

  }
)


document
  .querySelectorAll(
    '#toneSelection button'
  )
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        selectTone(
          Number(
            button.dataset.tone
          )
        )

      }
    )

  })


compareTonesButton.addEventListener(
  'click',
  () => {

    toggleToneComparison()

  }
)


initialiseSpeech()