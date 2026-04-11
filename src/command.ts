import { hide, moveCaretToEnd, show, showOutput } from "./utils";
import { setColor, setTheme, resetTheme, resetCurrentTheme, getTheme, getColor } from './theme.ts';
import { setFontSize, resetAllFonts, resetFont, getFontSize } from './font.ts'
import { getCaret, getCaretMovement, setCaret, setCaretMovement } from './caret.ts';
import { settings } from './settings.ts';
import { setTime, startGame } from "./game.ts";
import { hideHelp, showHelp } from "./help.ts";

const stats = document.getElementById('stats') as HTMLElement;
const input = document.getElementById('input') as HTMLTextAreaElement;
const commandHistoryLimit = 15;
let commandHistory: string[] = [];
let currentCommand = 0;

export const goToPreviousCommand = () => {
    if (currentCommand > 0) {
        currentCommand--;
        input.value = commandHistory[currentCommand];
        moveCaretToEnd();
    }
}

export const goToNextCommand = () => {
    if (currentCommand >= commandHistory.length) {
        return;
    }
    currentCommand++;
    let previous = commandHistory[currentCommand];
    if (previous) {
        input.value = previous;
    } else {
        input.value = '';
    }
}

export const runCommand = () => {
    hideHelp();

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
    addCommand(commandText)
}

const addCommand = (command: string) => {
    if (command === '') {
        return;
    }
    if (commandHistory.length >= commandHistoryLimit) {
        commandHistory = commandHistory.slice(1);
        currentCommand--;
    }
    commandHistory.push(command)
    currentCommand = commandHistory.length;
}
