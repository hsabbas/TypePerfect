import { saveSettings, settings } from "./settings";

export { setCaret, getCaret, setCaretMovement, getCaretMovement }

const caret = document.getElementById('caret') as HTMLElement;
const letterContainer = document.getElementById('letters-container') as HTMLElement;

const init = function () {
    updateUI();
}

const updateUI = () => {
    switch(settings.slideSpeed) {
        case 'slow':
            letterContainer.style.transitionDuration = '0.25s';
            break;
        case 'medium':
            letterContainer.style.transitionDuration = '0.15s';
            break;
        case 'fast':
            letterContainer.style.transitionDuration = '0.05s';
            break;
        case 'none':
            letterContainer.style.transitionDuration = '0s';
            break;
    }

    caret.className = settings.caretStyle;
}

const setCaretMovement = (args: string[]): boolean => {
    let success = setCaretMoveTrigger(args[1]) || setCaretSpeed(args[1]);
    if (success && args.length > 2) {
        success = success && (setCaretMoveTrigger(args[2]) || setCaretSpeed(args[2]))
    }
    updateUI();
    return success;
}

const setCaretMoveTrigger = (trigger: string): boolean => {
    switch (trigger) {
        case 'w':
        case 'word':
            settings.slideOnWord = true;
            break;
        case 'l':
        case 'letter':
            settings.slideOnWord = false;
            break;
        default:
            return false;
    }
    saveSettings();
    return true;
}

const setCaretSpeed = (speed: string): boolean => {
    switch (speed) {
        case 's':
        case 'slow':
            settings.slideSpeed = 'slow';
            break;
        case 'm':
        case 'medium':
            settings.slideSpeed = 'medium';
            break;
        case 'f':
        case 'fast':
            settings.slideSpeed = 'fast';
            break;
        case 'n':
        case 'none':
            settings.slideSpeed = 'none';
            break;
        default:
            return false;
    }
    saveSettings();
    return true;
}

const getCaretMovement = (): string => {
    return `${settings.slideOnWord ? 'word' : 'letter'} ${settings.slideSpeed}`;
}

const setCaret = function (style: string): boolean {
    if (style === 'bar' || style === 'underscore' || style === 'block') {
        caret.className = style;
        settings.caretStyle = style;
        saveSettings();
        return true;
    }

    return false;
}

const getCaret = () => {
    return caret.className;
}

init();