import { accuracyStat, caret, letterContainer, timeStat, wordsStat, wpmStat } from "./ui/dom"
import { accuracy, currentWord, timeLeft, typed, wordCount, words, wpm } from "./game"
import { settings } from "./settings"

interface WordElements {
    letters: HTMLElement[],
    extra: HTMLElement[],
    div: HTMLElement
}

let spaces: HTMLElement[] = []
let spaceTaker = document.createElement('div')
let wordElems: WordElements[] = []

export const startRenderer = () => {
    spaceTaker.style.width = '0'
    spaceTaker.style.opacity = '0'
    letterContainer.appendChild(spaceTaker)
}

export const resetRenderer = () => {
    letterContainer.innerHTML = ''
    letterContainer.style.transform = 'none'
    wordElems = []
    spaces = []
}

export const addWordElements = (newWords: string[]) => {
    for (let word of newWords) {
        addWord(word)
        addSpace()
    }
}

const addWord = (word: string) => {
    let wordDiv = document.createElement('div')
    wordDiv.className = 'word'
    let letters = []
    for (let l = 0; l < word.length; l++) {
        let letter = document.createElement('span')
        letter.className = 'letter untyped'
        letter.textContent = word[l]
        wordDiv.appendChild(letter)
        letters.push(letter)
    }
    wordElems.push({
        letters: letters,
        extra: [],
        div: wordDiv
    })
    letterContainer.appendChild(wordDiv)
}

const addSpace = () => {
    let space = document.createElement('span')
    space.className = 'letter'
    space.textContent = ' '
    spaces.push(space)
    letterContainer.appendChild(space)
}

export const removeWordElements = (count: number) => {
    spaceTaker.style.width = `${wordElems[count].letters[0].offsetLeft}px`
    for (let i = 0; i < count; i++) {
        wordElems[i].div.remove()
        spaces[i].remove()
    }
    spaces = spaces.slice(count)
}

const updateCurrentWord = () => {
    let t = typed[currentWord]
    let w = words[currentWord]
    let elems = wordElems[currentWord]
    let i = 0

    if (t.length - w.length < elems.extra.length) {
        let extraExtra = elems.extra.length - t.length + w.length
        for (let e of elems.extra.slice(-extraExtra)) {
            e.remove()
        }
        elems.extra = elems.extra.slice(0, -extraExtra)
    }

    while (i < w.length) {
        let l = elems.letters[i]
        if (i < t.length) {
            l.textContent = t[i]
            l.className = `letter ${w[i] == t[i] ? 'correct' : 'incorrect'}`
        } else {
            l.textContent = w[i]
            l.className = `letter untyped`
        }
        i++
    }

    while (i < t.length) {
        let e = i - w.length
        if (elems.extra.length > e) {
            elems.extra[e].textContent = t[i]
        } else {
            let extraLetter = document.createElement('span')
            extraLetter.className = 'letter extra incorrect'
            extraLetter.textContent = t[i]
            elems.div.appendChild(extraLetter)
            elems.extra.push(extraLetter)
        }
        i++
    }
}

const shiftLetters = () => {
    let currentLetter
    let word = wordElems[currentWord]
    if (settings.slideOnWord) {
        currentLetter = word.letters[0]
    } else if (typed[currentWord].length >= words[currentWord].length) {
        currentLetter = spaces[currentWord]
    } else {
        currentLetter = word.letters[typed[currentWord].length]
    }

    caret.textContent = currentLetter.textContent
    letterContainer.style.transform = `translateX(calc(-${currentLetter.offsetLeft}px))`
}

export const render = () => {
    updateCurrentWord()
    shiftLetters()
}

export const renderStats = () => {
    timeStat.textContent = String(timeLeft)
    // wordsStat.textContent = String(wordCount)
    wpmStat.textContent = String(wpm)
    accuracyStat.textContent = String(accuracy)
}