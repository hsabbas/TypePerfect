import { seed } from "../rng"
import { caret, input, letterContainer, seedDisplay, stats } from "./dom"

let typingTimeout: number | undefined = undefined

export const showTyping = () => {
    caret.classList.add('typing')
    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
        caret.classList.remove('typing')
    }, 500)
}

export const displayGame = () => {
    input.disabled = false
    input.focus()
    stats.classList.remove('game-over')
    show(stats)
    hide(input)
    show(letterContainer)
}

export const leaveGameDisplay = () => {
    show(input)
    hide(stats)
    hide(letterContainer)
}

export const showGameOver = () => {
    input.disabled = true
    hide(caret)
    stats.classList.add('game-over')
}

export const exitGameOver = () => {
    input.disabled = false
    input.focus()
    show(caret)
    show(input)
    hide(stats)
    hide(letterContainer)
    stats.classList.remove('game-over')
}

export const displaySeed = () => {
    seedDisplay.innerText = `Seed: ${seed}`
    show(seedDisplay)
    hide(stats)
}

export const hideSeed = () =>{
    hide(seedDisplay)
    hide(stats)
}

export const hide = (element: HTMLElement) => {
    element.style.opacity = '0'
}

export const show = (element: HTMLElement) => {
    element.style.opacity = '1'
}

export const moveCaretToEnd = () => {
    let len = input.value.length
    requestAnimationFrame(() => {
        input.setSelectionRange(len, len)
    })
}