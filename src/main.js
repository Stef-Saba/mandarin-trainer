import './style.css'

import {
  initialiseSpeech,
  speakChinese,
  stopAudio
} from './speech.js'

import {
  loadHanzi,
  showRandomHanzi,
  showNextHanzi
} from './hanzi.js'

import {
  openTonePractice,
  selectTone,
  showNextTone
} from './tones.js'

import {
  openSentence,
  showNextSentence
} from './sentences.js'


document.querySelector('#app').innerHTML = `

  <main class="app">

    <section id="homeScreen">

      <h1>说说</h1>

      <p class="subtitle">
        Choose what you want to practise.
      </p>

      <div class="categories">

        <button
          class="category"
          data-category="pictograms"
        >
          <span class="category-title">
            🀄 Hanzi
          </span>

          <span class="category-description">
            Learn Chinese characters through their origins
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
            Practise Mandarin in context
          </span>
        </button>

      </div>

    </section>


    <section
      id="sentenceFolderScreen"
      style="display:none;"
    >

      <button
        class="back"
        id="sentenceFolderBack"
        type="button"
      >
        ← Home
      </button>

      <h1>💬 Sentences</h1>

      <p class="subtitle">
        Choose what you want to practise.
      </p>

      <div class="categories">

        <button
          class="category sentence-category"
          data-sentence-category="beginner"
          type="button"
        >
          <span class="category-title">
            🌱 Beginner Mandarin
          </span>

          <span class="category-description">
            Everyday sentences for getting started
          </span>
        </button>

        <button
          class="category sentence-category"
          data-sentence-category="food"
          type="button"
        >
          <span class="category-title">
            🍜 Food & Restaurants
          </span>

          <span class="category-description">
            Ordering, eating and talking about food
          </span>
        </button>

        <button
          class="category sentence-category"
          data-sentence-category="travel"
          type="button"
        >
          <span class="category-title">
            ✈️ Travel
          </span>

          <span class="category-description">
            Useful Mandarin for travelling
          </span>
        </button>

        <button
          class="category sentence-category"
          data-sentence-category="business"
          type="button"
        >
          <span class="category-title">
            💼 Business Chinese
          </span>

          <span class="category-description">
            Mandarin for work and professional situations
          </span>
        </button>

        <button
          class="category sentence-category"
          data-sentence-category="everyday"
          type="button"
        >
          <span class="category-title">
            🗣️ Everyday Conversation
          </span>

          <span class="category-description">
            Natural everyday Mandarin
          </span>
        </button>

      </div>

    </section>


    <section
      id="trainerScreen"
      style="display:none;"
    >

      <button
        class="back"
        id="backButton"
        type="button"
      >
        ← Home
      </button>

      <h1 id="categoryTitle">
        说说
      </h1>


      <section class="card">

        <div
          class="sentence"
          id="sentence"
        >
          Loading...
        </div>

        <button
          id="soundButton"
          class="sound-button"
          type="button"
          aria-label="Listen"
          style="display:none; margin:16px auto;"
        >
          🔊
        </button>

        <div
          class="answer"
          id="pinyin"
          style="display:none;"
        ></div>

        <div
          class="answer"
          id="translation"
          style="display:none;"
        ></div>

        <div
          id="wordDefinition"
          class="word-definition"
        ></div>

        <div
          id="pictogramExplanation"
        ></div>

      </section>


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
        class="next"
        id="nextButton"
        type="button"
      >
        Next Hanzi
      </button>


      <div
        id="toneSelection"
        class="tone-buttons"
        style="display:none;"
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

    </section>

  </main>

`


const homeScreen =
  document.querySelector('#homeScreen')

const sentenceFolderScreen =
  document.querySelector(
    '#sentenceFolderScreen'
  )

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
  document.querySelector(
    '#pictogramExplanation'
  )

const pinyinButton =
  document.querySelector('#pinyinButton')

const translationButton =
  document.querySelector(
    '#translationButton'
  )

const nextButton =
  document.querySelector('#nextButton')

const toneSelection =
  document.querySelector('#toneSelection')

const normalButtons =
  document.querySelector('#normalButtons')

const sentenceFolderBack =
  document.querySelector(
    '#sentenceFolderBack'
  )

const backButton =
  document.querySelector('#backButton')


let currentCategory = ''

let currentSentenceCategory = ''


const categoryNames = {

  pictograms: '🀄 Hanzi',

  tones: '🎵 Tones',

  sentence: '💬 Sentences'

}


function resetTrainerDisplay() {

  trainerScreen.classList.remove(
    'hanzi-mode',
    'tones-mode',
    'sentence-mode'
  )

  wordDefinition.textContent = ''

  pinyinElement.textContent = ''

  translationElement.textContent = ''

  pictogramExplanation.textContent = ''

  pinyinElement.style.display =
    'none'

  translationElement.style.display =
    'none'

  soundButton.style.display =
    'none'

  nextButton.style.display =
    'block'

  normalButtons.style.display =
    'flex'

  toneSelection.style.display =
    'none'
}


function showHome() {

  stopAudio()

  homeScreen.style.display =
    'block'

  sentenceFolderScreen.style.display =
    'none'

  trainerScreen.style.display =
    'none'

  currentCategory = ''
}


function showSentenceFolder() {

  stopAudio()

  homeScreen.style.display =
    'none'

  sentenceFolderScreen.style.display =
    'block'

  trainerScreen.style.display =
    'none'
}


async function openCategory(category) {

  stopAudio()

  currentCategory = category

  categoryTitle.textContent =
    categoryNames[category]

  homeScreen.style.display =
    'none'

  sentenceFolderScreen.style.display =
    'none'

  trainerScreen.style.display =
    'block'

  resetTrainerDisplay()


  if (category === 'pictograms') {

    trainerScreen.classList.add(
      'hanzi-mode'
    )

    await loadHanzi()

    nextButton.textContent =
      'Next Hanzi'

    showRandomHanzi()

    return
  }


  if (category === 'tones') {

    trainerScreen.classList.add(
      'tones-mode'
    )

    await loadHanzi()

    openTonePractice()

    return
  }


  if (category === 'sentence') {

    trainerScreen.classList.add(
      'sentence-mode'
    )

    await openSentence(
      currentSentenceCategory
    )

  }

}


document
  .querySelectorAll(
    '#homeScreen .category'
  )
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        const category =
          button.dataset.category

        if (
          category === 'sentences'
        ) {

          showSentenceFolder()

          return
        }

        openCategory(category)

      }
    )

  })


document
  .querySelectorAll(
    '.sentence-category'
  )
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        currentSentenceCategory =
          button.dataset.sentenceCategory

        openCategory('sentence')

      }
    )

  })


sentenceFolderBack.addEventListener(
  'click',
  showHome
)


backButton.addEventListener(
  'click',
  showHome
)


/*
 * ONE shared sound handler.
 *
 * Hanzi, Tones and Sentences all use
 * the same button and speak whatever
 * is currently displayed in #sentence.
 */

soundButton.onclick = () => {

  const text =
    sentenceElement.textContent.trim()

  if (text) {

    speakChinese(text)

  }

}


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


toneSelection
  .querySelectorAll(
    '[data-tone]'
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


nextButton.addEventListener(
  'click',
  () => {

    stopAudio()

    if (
      currentCategory ===
      'pictograms'
    ) {

      showNextHanzi()

      return
    }


    if (
      currentCategory ===
      'tones'
    ) {

      showNextTone()

      return
    }


    if (
      currentCategory ===
      'sentence'
    ) {

      showNextSentence(
        currentSentenceCategory
      )

    }

  }
)


initialiseSpeech()

showHome()