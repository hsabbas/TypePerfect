import { backspace, backspaceWord, exitGame, endWord, gameState, update, endGameOver, startGame, resetGame } from './game.ts'
import { moveCaretToEnd } from './ui/ui.ts'
import { goToNextCommand, goToPreviousCommand, runCommand } from './command.ts'
import { body, input } from './ui/dom.ts'
import { showTyping } from './ui/ui.ts'
import { settings } from './settings.ts'

const init = () => {
    input.focus()
    body.addEventListener('click', () => {
        input.focus()
    })
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) input.focus()
    })

    input.addEventListener('paste', (e) => {
        if (gameState !== 'command') {
            e.preventDefault()
        }
    })

    document.addEventListener('keydown', handleKeydown)
    input.addEventListener('selectionchange', moveCaretToEnd)
    input.addEventListener('input', handleInput)
}

const handleInput = () => {
    showTyping()
    if (gameState === 'armed' || gameState === 'running') {
        update()
    }
}

const handleKeydown = (e: KeyboardEvent) => {
    switch (gameState) {
        case 'command':
            if (e.key === 'Enter') {
                runCommand()
                e.preventDefault()
            }
            if (e.key === 'Escape') {
                input.value = ''
            }
            if (e.key === 'ArrowUp') {
                goToPreviousCommand()
            }
            if (e.key === 'ArrowDown') {
                goToNextCommand()
            }
            break
        case 'armed':
        case 'running':
            if (e.key === 'Enter') {
                e.preventDefault()
            }
            if (e.key === ' ') {
                endWord()
                e.preventDefault()
            }
            if (e.key === 'Escape') {
                exitGame()
            }
            if (e.key === 'Backspace') {
                e.preventDefault()
                if (e.ctrlKey || e.altKey) {
                    backspaceWord()
                } else {
                    backspace()
                }
            }
            break
        case 'gameover':
            if (e.key === 'Enter') {
                resetGame()
                e.preventDefault()
            }
            if (e.key === 'Escape') {
                endGameOver()
                e.preventDefault()
            }
    }
}

init();