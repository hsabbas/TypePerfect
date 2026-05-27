import { displaySeed, hideSeed, moveCaretToEnd } from "./ui/ui.ts"
import { setColor, setTheme, resetTheme, resetCurrentTheme, getTheme, getColor } from './appearance/theme.ts'
import { setFontSize, resetAllFonts, resetFont, getFontSize } from './appearance/font.ts'
import { getCaret, getCaretMovement, setCaret, setCaretMovement } from './appearance/caret.ts'
import { settings } from './settings.ts'
import { setTime, startGame } from "./game.ts"
import { clearOutput, showHelp, showOutput } from "./help.ts"
import { clearSeed, setSeed } from "./rng.ts"
import { input } from "./ui/dom.ts"

const commandHistoryLimit = 15
let commandHistory: string[] = []
let currentCommand = 0

export const goToPreviousCommand = () => {
    if (currentCommand > 0) {
        currentCommand--
        input.value = commandHistory[currentCommand]
        moveCaretToEnd()
    }
}

export const goToNextCommand = () => {
    if (currentCommand >= commandHistory.length) {
        return
    }
    currentCommand++
    let previous = commandHistory[currentCommand]
    if (previous) {
        input.value = previous
    } else {
        input.value = ''
    }
}

const addCommand = (command: string) => {
    if (command === '') {
        return
    }
    if (commandHistory.length >= commandHistoryLimit) {
        commandHistory = commandHistory.slice(1)
    }
    commandHistory.push(command)
    currentCommand = commandHistory.length
}

export const runCommand = () => {
    clearOutput()

    let commandText = input.value.trim().toLowerCase()
    input.value = ''
    addCommand(commandText)

    if (commandText.length !== 0 && !isNaN(Number(commandText))) {
        startGame(parseInt(commandText))
        return
    }

    const command = commandText.split(' ')
    switch (command[0]) {
        case '':
        case 'start':
            startHandler(command)
            break
        case 'time':
            timeHandler(command)
            break
        case 'color':
            colorHandler(command)
            break
        case 'theme':
            themeHandler(command)
            break
        case 'reset':
            resetHandler(command)
            break
        case 'font':
            fontHandler(command)
            break
        case 'caret':
            caretHandler(command)
            break
        case 'slide':
            slideHandler(command)
            break
        case 'seed':
            seedHandler(command)
            break
        case 'help':
            helpHandler(command)
            break
        default:
            showHelp('default')
    }
}

function startHandler(args: string[]) {
    if (args.length < 2) {
        startGame(settings.timeLimit)
    } else {
        if (isNaN(Number(args[1]))) {
            showHelp('start')
            return
        }
        startGame(parseInt(args[1]))
    }
}

function timeHandler(args: string[]) {
    if (args.length == 1) {
        showOutput(String(settings.timeLimit))
    } else if (!setTime(Number(args[1]))) {
        showHelp('time')
    }
}

function colorHandler(args: string[]) {
    if (args.length == 2) {
        let result = getColor(args[1])
        if (result) {
            showOutput(result)
        } else {
            showHelp('color')
        }
    } else if (args.length > 2) {
        if (!setColor(args[1], args[2])) {
            showHelp('color')
        }
    } else {
        showHelp('color')
    }
}

function themeHandler(args: string[]) {
    if (args.length < 2) {
        showOutput(getTheme())
    } else if (!setTheme(args[1])) {
        showHelp('theme')
    }
}

function resetHandler(args: string[]) {
    if (args.length < 2) {
        showHelp('reset')
    }
    if (args[1] === 'theme') {
        if (args.length < 3) {
            resetCurrentTheme()
        } else {
            if (!resetTheme(args[2])) {
                showHelp('reset')
            }
        }
    }
    if (args[1] === 'font') {
        if (args.length < 3) {
            resetAllFonts()
        } else {
            if (!resetFont(args[2])) {
                showHelp('reset')
            }
        }
    }
    if (args[1] === 'seed') {
        clearSeed()
        hideSeed()
    }
}

function fontHandler(args: string[]) {
    if (args.length < 3) {
        showHelp('font')
    }
    if (args[1] === 'size') {
        if (args.length === 3) {
            let output = getFontSize(args[2])
            if (!output) {
                showHelp('font')
            } else {
                showOutput(output)
            }
        } else {
            if (!setFontSize(args)) {
                showHelp('font')
            }
        }
    } else {
        showHelp('font')
    }
}

function caretHandler(args: string[]) {
    if (args.length < 2) {
        showOutput(getCaret())
    } else if (!setCaret(args[1])) {
        showHelp('caret')
    }
}

function slideHandler(args: string[]) {
    if (args.length < 2) {
        showOutput(getCaretMovement())
    } else {

    } if (!setCaretMovement(args)) {
        showHelp('slide')
    }
}

function seedHandler(args: string[]) {
    if (args.length < 2) {
        showHelp('seed')
    } else {
        if (!setSeed(Number(args[1]))) {
            showHelp('seed')
        } else {
            displaySeed()
        }
    }
}

function helpHandler(args: string[]) {
    if (args.length < 2) {
        showHelp('default')
    } else {
        showHelp(args[1])
    }
}
