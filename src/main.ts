import './style.css'
import { setColor, setTheme, resetTheme, resetCurrentTheme, getThemeCode, getTheme, getColor } from './theme.ts';
import { setFontSize, resetAllFonts, resetFont, getFontSize } from './font.ts'
import { getCaret, getCaretMovement, setCaret, setCaretMovement } from './caret.ts';
import { settings } from './settings.ts';
import { generateWords } from './words.ts';
import { helpMessages } from './help.ts';

const body = document.querySelector('body') as HTMLElement;
const stats = document.getElementById('stats') as HTMLElement;
const timeStat = document.getElementById('time-left') as HTMLElement;
const wordsStat = document.getElementById('words-typed') as HTMLElement;
const wpmStat = document.getElementById('wpm') as HTMLElement;
const accuracyStat = document.getElementById('accuracy') as HTMLElement;
const input = document.getElementById('input') as HTMLTextAreaElement;
const help = document.getElementById('help') as HTMLElement;
const letterContainer = document.getElementById('letters-container') as HTMLElement;
const caret = document.getElementById('caret') as HTMLElement;

interface Word {
    word: string,
    typed: string,
    letters: HTMLElement[],
    correct: boolean,
    extra: HTMLElement[],
    div: HTMLElement
}

let gameState = 'command'
let timeLeft = 0;
let timerInterval: number | undefined = undefined;
let isComposing = false;
let typingTimeout: number | undefined = undefined;

let previousCommand = '';

let words: Word[] = [];
let spaces: HTMLElement[] = [];
let currentWord: Word;
let currentWordInd = 0;
let wordCount = 0;
let charactersTyped = 0;
let correctCharacters = 0;

const init = () => {
    input.focus()
    body.addEventListener('click', () => {
        input.focus()
    })
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) input.focus();
    });
    input.addEventListener('keydown', handleKeydown);
    input.addEventListener('selectionchange', moveCaretToEnd);
    hide(stats);
    show(input);
}

const hide = (element: HTMLElement) => {
    element.style.opacity = '0';
}

const show = (element: HTMLElement) => {
    element.style.opacity = '1';
}

const startGame = (seconds: number) => {
    settings.timeLimit = seconds;
    timeLeft = seconds;
    gameState = 'armed';
    timeStat.textContent = String(timeLeft);
    updateStats();
    show(stats);
    hide(input);
    input.addEventListener('input', update);
    input.addEventListener('compositionstart', startComposition)
    input.addEventListener('compositionend', endComposition);

    addWords(100);

    console.log('strating game with ' + words.length + ' words.')
    currentWord = words[0];
    shiftLetters();
}

const endGame = () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
    }
    input.removeEventListener('input', update);
    words = [];
    spaces = [];
    wordCount = 0;
    letterContainer.innerHTML = '';
    letterContainer.style.transform = 'none';
    currentWordInd = 0;
    input.value = '';
    show(input);
    gameState = 'command';
}

const addWords = (count: number) => {
    let upcomingWords = generateWords(count);
    for (let w = 0; w < upcomingWords.length; w++) {
        let wordDiv = document.createElement('div');
        wordDiv.className = 'word';
        let word = upcomingWords[w];
        let letters = [];
        for (let l = 0; l < word.length; l++) {
            let letter = document.createElement('span');
            letter.className = 'letter untyped';
            letter.textContent = word[l];
            wordDiv.appendChild(letter);
            letters.push(letter);
        }
        words.push({
            word: word,
            typed: '',
            letters: letters,
            correct: true,
            extra: [],
            div: wordDiv
        })
        letterContainer.appendChild(wordDiv);

        let space = document.createElement('span');
        space.className = 'letter';
        space.textContent = ' ';
        spaces.push(space);
        letterContainer.appendChild(space);
    }
}

const removeWords = (count: number) => {
    for (let i = 0; i < count; i++) {
        spaces[i].remove();
        words[i].div.remove();
    }
    words = words.slice(count);
    spaces = spaces.slice(count);
}

const setTime = (seconds: number) => {
    if (isNaN(seconds)) {
        return false;
    }
    settings.timeLimit = seconds;
    return true;
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

const shiftLetters = () => {
    let currentLetter;
    if (settings.slideOnWord) {
        currentLetter = currentWord.letters[0];
    } else if (currentWord.typed.length >= currentWord.word.length) {
        currentLetter = spaces[currentWordInd];
    } else {
        currentLetter = currentWord.letters[currentWord.typed.length];
    }

    caret.textContent = currentLetter.textContent;
    letterContainer.style.transform = `translateX(calc(-${currentLetter.offsetLeft}px))`;
}

const endWord = () => {
    if (input.value.trim() === '') {
        return;
    }

    letterContainer.classList.remove('paused');
    currentWord.correct = currentWord.word === input.value;

    if (currentWord.correct) {
        wordCount++;
    }
    input.value = '';
    currentWordInd++;
    currentWord = words[currentWordInd];
    if (words.length - currentWordInd < 50) {
        addWords(50);
    }
    shiftLetters();
}

const clearCurrentWord = () => {
    input.value = '';
    currentWord.typed = '';
    for (let i = 0; i < currentWord.extra.length; i++) {
        currentWord.extra[i].remove();
    }
    currentWord.extra = [];
    for (let i = 0; i < currentWord.word.length; i++) {
        currentWord.letters[i].innerText = currentWord.word[i];
        currentWord.letters[i].className = 'letter untyped';
    }
    letterContainer.classList.remove('paused');
    shiftLetters();
}

const backspace = () => {
    let inputText = input.value.slice(0, -1);
    input.value = inputText;
    if (currentWord.extra.length !== 0) {
        currentWord.extra.at(-1)!.remove();
        currentWord.extra.pop();
    } else {
        letterContainer.classList.remove('paused');
        currentWord.letters[inputText.length].textContent = currentWord.word[inputText.length];
        currentWord.letters[inputText.length].className = 'letter untyped';
    }
    currentWord.typed = inputText;
    shiftLetters();
}

const goToPreviousWord = () => {
    if (currentWordInd === 0 || words[currentWordInd - 1].correct) {
        return;
    }

    currentWordInd--;
    currentWord = words[currentWordInd];
    input.value = currentWord.typed;
    shiftLetters();
}

const clearPreviousWord = () => {
    if (currentWordInd === 0 || words[currentWordInd - 1].correct) {
        return;
    }

    currentWordInd--;
    currentWord = words[currentWordInd];
    clearCurrentWord();
}

const startComposition = () => {
    isComposing = true;
}

const endComposition = () => {
    isComposing = false;
    update();
}

const update = () => {
    caret.classList.add('typing');
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        caret.classList.remove('typing');
    }, 500);

    if (isComposing) {
        return;
    }

    if (gameState === 'armed') {
        gameState = 'running';
        startTimer();
    }

    let typed = input.value;
    let newLetters = typed.length - currentWord.typed.length;
    for (let i = 0; i < newLetters; i++) {
        let index = currentWord.typed.length + i;
        let extra = index >= currentWord.word.length;
        if (extra) {
            letterContainer.classList.add('paused');
            let extraLetter = document.createElement('span');
            extraLetter.className = 'letter extra incorrect';
            extraLetter.textContent = typed[index];
            currentWord.div.appendChild(extraLetter);
            currentWord.extra.push(extraLetter);
        } else {
            let letter = currentWord.letters[index];
            if (typed[index] === currentWord.word[index]) {
                letter.className = 'letter correct';
                correctCharacters++;
            } else {
                letter.className = 'letter incorrect';
                letter.textContent = typed[index];
            }
        }
        charactersTyped++;
    }
    currentWord.typed = typed;

    shiftLetters();
    updateStats();
}

const moveCaretToEnd = () => {
    let len = input.value.length;
    requestAnimationFrame(() => {
        input.setSelectionRange(len, len);
    });
}

const startTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        timeLeft--;
        updateStats();

        if (timeLeft === 0) {
            endGame();
        }
    }, 1000);
}

const updateStats = () => {
    timeStat.textContent = String(timeLeft);
    wordsStat.textContent = String(wordCount === 0);
    let timePassed = settings.timeLimit - timeLeft;
    wpmStat.textContent = String(timePassed === 0 ? 0 : Math.floor(wordCount / (timePassed / 60)));
    accuracyStat.textContent = String(charactersTyped === 0 ? 0 : Math.round(correctCharacters / charactersTyped * 100));
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
                startGame(settings.timeLimit);
            } else {
                if (isNaN(Number(command[1]))) {
                    showHelp('start');
                    return
                }
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

    help.innerHTML = `<div class="help help-title">${helpMessage.title}</div>`;
    for (let line of helpMessage.lines) {
        help.innerHTML += `<div class="help help-line">${line}</div>`
    }
    show(help);
}

const showOutput = (output: string) => {
    help.innerText = output
    show(help);
}

init();