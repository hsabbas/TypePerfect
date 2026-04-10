import { setColor, setTheme, resetTheme, resetCurrentTheme, getTheme, getColor } from './theme.ts';
import { setFontSize, resetAllFonts, resetFont, getFontSize } from './font.ts'
import { getCaret, getCaretMovement, setCaret, setCaretMovement } from './caret.ts';
import { settings } from './settings.ts';
import { helpMessages } from './help.ts';
import { backspace, clearCurrentWord, clearPreviousWord, endGame, endWord, gameState, goToPreviousWord, setTime, startGame } from './game.ts';
import { hide, show } from './utils.ts';

const body = document.querySelector('body') as HTMLElement;
const stats = document.getElementById('stats') as HTMLElement;
const input = document.getElementById('input') as HTMLTextAreaElement;
const help = document.getElementById('help') as HTMLElement;

let previousCommand = '';

const init = () => {
    input.focus()
    body.addEventListener('click', () => {
        input.focus()
    })
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) input.focus();
    });

    input.addEventListener('paste', (e) => {
        if (gameState !== 'command') {
            e.preventDefault();
        }
    });

    input.addEventListener('keydown', handleKeydown);
    input.addEventListener('selectionchange', moveCaretToEnd);
    hide(stats);
    show(input);
}

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        if (gameState === 'command') {
            runCommand()
        }
        e.preventDefault();
    }
    switch (gameState) {
        case 'command':
            if (e.key === 'ArrowUp') {
                input.value = previousCommand;
                moveCaretToEnd();
            }
            if (e.key === 'ArrowDown') {
                input.value = '';
            }
            break;
        case 'armed':
        case 'running':
            if (e.key === ' ') {
                endWord();
                e.preventDefault();
            }
            if (e.key === 'Escape') {
                show(input);
                endGame();
            }
            if (e.key === 'Backspace') {
                e.preventDefault();
                if (input.value.length === 0) {
                    if (e.ctrlKey || e.altKey) {
                        clearPreviousWord();
                    } else {
                        goToPreviousWord();
                    }
                    return;
                }

                if (e.ctrlKey || e.altKey) {
                    clearCurrentWord();
                } else {
                    backspace();
                }
            }
            break;
    }
}

const moveCaretToEnd = () => {
    let len = input.value.length;
    requestAnimationFrame(() => {
        input.setSelectionRange(len, len);
    });
}

const runCommand = () => {
    hide(help);

    let commandText = input.value.trim().toLowerCase();
    if (commandText.length !== 0 && !isNaN(Number(commandText))) {
        commandText = 'start ' + commandText;
    }
    const command = commandText.split(' ');
    switch (command[0]) {
        case '':
        case 'start':
            if (command.length < 2) {
                show(stats);
                hide(input);
                startGame(settings.timeLimit);
            } else {
                if (isNaN(Number(command[1]))) {
                    showHelp('start');
                    return
                }
                show(stats);
                hide(input);
                startGame(parseInt(command[1]));
            }
            break;
        case 'time':
            if (command.length == 1) {
                showOutput(String(settings.timeLimit));
            } else if (!setTime(Number(command[1]))) {
                showHelp('time');
            }
            break;
        case 'color':
            if (command.length == 2) {
                let result = getColor(command[1]);
                if (result) {
                    showOutput(result)
                } else {
                    showHelp('color');
                }
            } else if (command.length > 2) {
                if (!setColor(command[1], command[2])) {
                    showHelp('color');
                }
            } else {
                showHelp('color');
            }
            break;
        case 'theme':
            if (command.length < 2) {
                showOutput(getTheme());
            } else if (!setTheme(command[1])) {
                showHelp('theme');
            }
            break;
        case 'reset':
            if (command.length < 2) {
                showHelp('reset')
            }
            if (command[1] === 'theme') {
                if (command.length < 3) {
                    resetCurrentTheme()
                } else {
                    if (!resetTheme(command[2])) {
                        showHelp('reset');
                    }
                }
            }
            if (command[1] === 'font') {
                if (command.length < 3) {
                    resetAllFonts()
                } else {
                    if (!resetFont(command[2])) {
                        showHelp('reset');
                    }
                }
            }
            break;
        case 'font':
            if (command.length < 3) {
                showHelp('font');
            }
            if (command[1] === 'size') {
                if (command.length === 3) {
                    let output = getFontSize(command[2]);
                    if (!output) {
                        showHelp('font');
                    } else {
                        showOutput(output);
                    }
                } else {
                    if (!setFontSize(command)) {
                        showHelp('font');
                    }
                }
            } else {
                showHelp('font');
            }
            break;
        case 'caret':
            if (command.length < 2) {
                showOutput(getCaret());
            } else if (!setCaret(command[1])) {
                showHelp('caret');
            }
            break;
        case 'slide':
            if (command.length < 2) {
                showOutput(getCaretMovement());
            } else {

            } if (!setCaretMovement(command)) {
                showHelp('slide');
            }
            break;
        case 'help':
            if (command.length < 2) {
                showHelp('default');
            } else {
                showHelp(command[1]);
            }
            break;
        default:
            showHelp('default');
    }
    input.value = '';
    previousCommand = commandText;
}

const showHelp = (command: string) => {
    let helpMessage = helpMessages[command]
    if (!helpMessage) {
        helpMessage = helpMessages['help'];
    }

    help.innerHTML = `<div class="help-title">${helpMessage.title}</div>`;
    for (let line of helpMessage.lines) {
        help.innerHTML += `<div class="help-line">${line}</div>`
    }
    show(help);
}

const showOutput = (output: string) => {
    help.innerText = output
    show(help);
}

init();