import { saveSettings, settings } from "./settings";
import { show } from "./utils";
import { generateWords } from "./words";

const timeStat = document.getElementById('time-left') as HTMLElement;
const wordsStat = document.getElementById('words-typed') as HTMLElement;
const wpmStat = document.getElementById('wpm') as HTMLElement;
const accuracyStat = document.getElementById('accuracy') as HTMLElement;
const letterContainer = document.getElementById('letters-container') as HTMLElement;
const input = document.getElementById('input') as HTMLTextAreaElement;
const caret = document.getElementById('caret') as HTMLElement;

export let gameState = 'command'

interface Word {
    word: string,
    typed: string,
    letters: HTMLElement[],
    correct: boolean,
    extra: HTMLElement[],
    div: HTMLElement
}

let timeLeft = 0;
let timerInterval: number | undefined = undefined;
let isComposing = false;
let typingTimeout: number | undefined = undefined;

let words: Word[] = [];
let spaces: HTMLElement[] = [];
let currentWord: Word;
let currentWordInd = 0;
let wordCount = 0;
let charactersTyped = 0;
let correctCharacters = 0;
let spaceTaker = document.createElement('div');

export const startGame = (seconds: number) => {
    setTime(seconds);
    timeLeft = seconds;
    gameState = 'armed';
    timeStat.textContent = String(timeLeft);
    updateStats();
    input.addEventListener('input', update);

    spaceTaker.style.width = '0';
    spaceTaker.style.opacity = '0';
    letterContainer.appendChild(spaceTaker);
    addWords(150);

    currentWord = words[0];
    shiftLetters();
}

export const endGame = () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
    }
    input.removeEventListener('input', update);
    input.removeEventListener('compositionstart', startComposition)
    input.removeEventListener('compositionend', endComposition);
    words = [];
    spaces = [];
    wordCount = 0;
    letterContainer.innerHTML = '';
    letterContainer.style.transform = 'none';
    currentWordInd = 0;
    charactersTyped = 0;
    correctCharacters = 0;
    show(input);
    input.value = '';
    gameState = 'command';
    letterContainer.classList.remove('paused');
}

export const addWords = (count: number) => {
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
    spaceTaker.style.width = `${words[count].letters[0].offsetLeft}px`;
    for (let i = 0; i < count; i++) {
        words[i].div.remove();
        spaces[i].remove();
    }
    words = words.slice(count);
    spaces = spaces.slice(count);
    currentWordInd -= count;
}

export const setTime = (seconds: number): boolean => {
    if (isNaN(seconds)) {
        return false;
    }
    settings.timeLimit = seconds;
    saveSettings();
    return true;
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

export const endWord = () => {
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
        removeWords(50);
    }

    shiftLetters();
}

export const clearCurrentWord = () => {
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

export const backspace = () => {
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

export const goToPreviousWord = () => {
    if (currentWordInd === 0 || words[currentWordInd - 1].correct) {
        return;
    }

    currentWordInd--;
    currentWord = words[currentWordInd];
    input.value = currentWord.typed;
    shiftLetters();
}

export const clearPreviousWord = () => {
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