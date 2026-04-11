import { backspace, clearCurrentWord, clearPreviousWord, endGame, endWord, gameState, goToPreviousWord } from './game.ts';
import { hide, moveCaretToEnd, show } from './utils.ts';
import { goToNextCommand, goToPreviousCommand, runCommand } from './command.ts';

const body = document.querySelector('body') as HTMLElement;
const stats = document.getElementById('stats') as HTMLElement;
const input = document.getElementById('input') as HTMLTextAreaElement;

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
    switch (gameState) {
        case 'command':
            if (e.key === 'Enter') {
                runCommand();
                e.preventDefault();
            }
            if (e.key === 'Escape') {
                input.value = '';
            }
            if (e.key === 'ArrowUp') {
                goToPreviousCommand();
            }
            if (e.key === 'ArrowDown') {
                goToNextCommand();
            }
            break;
        case 'armed':
        case 'running':
            if (e.key === 'Enter') {
                e.preventDefault();
            }
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

init();