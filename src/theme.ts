export { setColor, initTheme, setTheme, resetTheme, resetCurrentTheme, getThemeCode, getColor, getTheme };
import { saveSettings, settings, defaults, type Theme } from "./settings";

type ColorFieldMap = Record<string, keyof Theme>;
const fieldMap: ColorFieldMap = {
    'c': 'correctColor',
    'i': 'incorrectColor',
    'p': 'primaryColor',
    's': 'secondaryColor',
    'b': 'backgroundColor',
    'bg': 'backgroundColor',
    'correct': 'correctColor',
    'incorrect': 'incorrectColor',
    'primary': 'primaryColor',
    'secondary': 'secondaryColor',
    'background': 'backgroundColor'
};

const hexColorRegEx = /^#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

const initTheme = () => {
    updateUI();
}

const updateUI = () => {
    const theme: Theme = settings[settings.selectedTheme];
    document.documentElement.style.setProperty('--correct-color', theme.correctColor);
    document.documentElement.style.setProperty('--incorrect-color', theme.incorrectColor);
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
    document.documentElement.style.setProperty('--background-color', theme.backgroundColor);
}

const argToTheme = (arg: string): string => {
    if (arg === 'l') {
        arg = 'light';
    }
    if (arg === 'd') {
        arg = 'dark';
    }
    return arg;
}

const setColor = (type: string, color: string) => {
    let field = fieldMap[type];
    if (!field) {
        return false;
    }

    if (!color.startsWith('#')) {
        color = '#' + color;
    }

    if (!hexColorRegEx.test(color)) {
        return false;
    }

    settings[settings.selectedTheme][field] = color;
    updateUI();
    saveSettings();
    return true;
}

const getColor = (type: string) => {
    let field = fieldMap[type];
    if (!field) {
        return false;
    }

    return settings[settings.selectedTheme][field];
}

const setTheme = (theme: string) => {
    theme = argToTheme(theme);
    if (theme !== 'dark' && theme !== 'light') {
        return false;
    }

    settings.selectedTheme = theme;
    updateUI();
    saveSettings();
    return true;
}

const getTheme = () => {
    return settings.selectedTheme;
}

const resetTheme = (theme: string) => {
    theme = argToTheme(theme);
    if (theme !== 'dark' && theme !== 'light') {
        return false;
    }

    settings[theme] = { ...defaults[theme] };
    if (settings.selectedTheme === theme) {
        updateUI();
    }
    saveSettings();
    return true;
}

const resetCurrentTheme = () => {
    settings[settings.selectedTheme] = { ...defaults[settings.selectedTheme] };
    updateUI();
    saveSettings();
    return true;
}

const getThemeCode = () => {

}

initTheme()