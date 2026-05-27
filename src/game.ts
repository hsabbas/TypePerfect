import { input } from "./ui/dom"
import { addWordElements, render, renderStats, resetRenderer } from "./renderer"
import { resetRNG } from "./rng"
import { saveSettings, settings } from "./settings"
import { displayGame, exitGameOver, leaveGameDisplay, showGameOver } from "./ui/ui"
import { generateWords } from "./words"

export let gameState = 'command'

export let timeLeft = 0
let timerInterval: number | undefined = undefined
let isComposing = false

export let words: string[] = []
export let typed: string[] = []
export let correct: boolean[] = []
export let currentWord = 0
export let wordCount = 0
export let charactersTyped = 0
export let correctCharacters = 0
export let wpm = 0
export let accuracy = 0

export const startGame = (seconds: number) => {
    setTime(seconds)
    timeLeft = seconds
    gameState = 'armed'
    updateStats()
    currentWord = 0
    resetRNG()
    addWords(150)
    displayGame()
    render()
}

const endGame = () => {
    gameState = 'gameover'
    if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = undefined
    }
    resetRenderer()
    showGameOver()
}

export const exitGame = () => {
    gameState = 'command'
    clearGame()
    leaveGameDisplay()
}

export const resetGame = () => {
    clearGame()
    startGame(settings.timeLimit)
}

const clearGame = () => {
    if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = undefined
    }
    input.removeEventListener('compositionstart', startComposition)
    input.removeEventListener('compositionend', endComposition)
    words = []
    typed = []
    correct = []
    wordCount = 0
    charactersTyped = 0
    correctCharacters = 0
    wpm = 0
    accuracy = 0
    input.value = ''
    resetRenderer()
}

export const endGameOver = () => {
    gameState = 'command'
    clearGame()
    exitGameOver()
}

const addWords = (count: number) => {
    let newWords = generateWords(count)
    for (let word of newWords) {
        words.push(word)
        typed.push('')
        correct.push(true)
    }
    addWordElements(newWords)
}

const removeWords = (count: number) => {
    words = words.slice(count)
    currentWord -= count
}

export const setTime = (seconds: number): boolean => {
    if (isNaN(seconds)) {
        return false
    }

    seconds = Math.round(seconds)
    settings.timeLimit = seconds
    saveSettings()
    return true
}

export const endWord = () => {
    if (input.value.trim() === '') {
        return
    }

    correct[currentWord] = words[currentWord] === input.value

    if (correct[currentWord]) {
        wordCount++
    }
    input.value = ''
    currentWord++
    if (words.length - currentWord < 50) {
        addWords(50)
        removeWords(50)
    }

    render()
}

export const backspaceWord = () => {
    if (input.value.length == 0) {
        if (currentWord === 0 || correct[currentWord - 1]) {
            return
        }
        currentWord--
    }

    input.value = ''
    typed[currentWord] = ''
    render()
}

export const backspace = () => {
    if (input.value.length == 0) {
        goToPreviousWord()
        return
    }

    let inputText = input.value.slice(0, -1)
    input.value = inputText
    typed[currentWord] = inputText
    render()
}

const goToPreviousWord = () => {
    if (currentWord === 0 || correct[currentWord - 1]) {
        return
    }

    currentWord--
    input.value = typed[currentWord]
    render()
}

const startComposition = () => {
    isComposing = true
}

const endComposition = () => {
    isComposing = false
    update()
}

export const update = () => {
    if (isComposing) {
        return
    }

    if (gameState === 'armed') {
        gameState = 'running'
        startTimer()
    }

    let newLetters = input.value.length - typed[currentWord].length
    for (let i = 0; i < newLetters; i++) {
        let index = typed[currentWord].length + i
        if (index < words[currentWord].length
            && typed[currentWord][index] === words[currentWord][index]) {
            correctCharacters++
        }
        charactersTyped++
    }

    typed[currentWord] = input.value

    render()
    updateStats()
}

const startTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval)
    }

    timerInterval = setInterval(() => {
        timeLeft--
        updateStats()

        if (timeLeft === 0) {
            endGame()
        }
    }, 1000)
}

const updateStats = () => {
    let timePassed = settings.timeLimit - timeLeft
    wpm = timePassed === 0 ? 0 : Math.floor(wordCount / (timePassed / 60))
    accuracy = charactersTyped === 0 ? 0 : Math.round(correctCharacters / charactersTyped * 100)
    renderStats()
}