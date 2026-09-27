let chineseVoices = []

function refreshChineseVoices() {
  if (!('speechSynthesis' in window)) {
    chineseVoices = []
    return
  }

  chineseVoices =
    window.speechSynthesis
      .getVoices()
      .filter(
        voice =>
          voice.lang &&
          voice.lang
            .toLowerCase()
            .startsWith('zh')
      )
}

export function speakChinese(text) {
  if (
    !text ||
    !('speechSynthesis' in window)
  ) {
    return
  }

  const cleanText = text.trim()

  if (!cleanText) {
    return
  }

  const synth =
    window.speechSynthesis

  /*
   * We deliberately do NOT:
   *
   * - call synth.cancel()
   * - call synth.resume()
   * - force a specific voice object
   *
   * The browser can select the Chinese system
   * voice from the zh-TW language itself.
   */

  const utterance =
    new SpeechSynthesisUtterance(
      cleanText
    )

  utterance.lang = 'zh-TW'
  utterance.rate = 0.85
  utterance.pitch = 1
  utterance.volume = 1

  utterance.onstart = () => {
    console.log(
      'CHINESE SPEECH STARTED:',
      cleanText
    )
  }

  utterance.onend = () => {
    console.log(
      'CHINESE SPEECH ENDED:',
      cleanText
    )
  }

  utterance.onerror = event => {
    console.log(
      'CHINESE SPEECH ERROR:',
      event.error,
      cleanText
    )
  }

  console.log(
    'SPEAKING:',
    cleanText
  )

  synth.speak(utterance)
}

export function stopAudio() {
  if (
    'speechSynthesis' in window
  ) {
    window.speechSynthesis.cancel()
  }
}

export function initialiseSpeech() {
  if (
    !('speechSynthesis' in window)
  ) {
    return
  }

  refreshChineseVoices()

  window.speechSynthesis.addEventListener(
    'voiceschanged',
    refreshChineseVoices
  )
}