export interface Theme {
    correctColor: string,
    incorrectColor: string,
    primaryColor: string,
    secondaryColor: string,
    backgroundColor: string
}

export interface FontSizes {
    gameFontSize: string
    statsFontSize: string
    titleFontSize: string
    helpFontSize: string
}

interface Settings {
    timeLimit: number
    slideSpeed: 'slow' | 'medium' | 'fast' | 'none'
    slideOnWord: boolean
    caretStyle: 'bar' | 'underscore' | 'block' | 'none'
    light: Theme
    dark: Theme
    selectedTheme: 'light' | 'dark'
    fontSizes: FontSizes
}

export const defaults: Settings = {
    timeLimit: 60,
    slideSpeed: 'fast',
    slideOnWord: false,
    caretStyle: 'bar',
    light: {
        correctColor: '#00CC55',
        incorrectColor: '#CC0055',
        primaryColor: '#222222',
        secondaryColor: '#444444',
        backgroundColor: '#EEEEEE'
    },
    dark: {
        correctColor: '#00CC55',
        incorrectColor: '#CC0055',
        primaryColor: '#EEEEEE',
        secondaryColor: '#CCCCCC',
        backgroundColor: '#111111'
    },
    selectedTheme: 'dark',
    fontSizes: {
        gameFontSize: '4rem',
        statsFontSize: '12px',
        titleFontSize: '2.5rem',
        helpFontSize: '1rem',
    }
}

export let settings: Settings = initSettings()

function initSettings(): Settings {
    let settings: Settings
    let storedSettingsStr = localStorage.getItem('settings');
    if (storedSettingsStr) {
        const storedSettings = JSON.parse(storedSettingsStr)
        settings = {
            ...storedSettings
        }
        settings.light = storedSettings['light']
    } else {
        settings = {...defaults}
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            settings.selectedTheme = 'dark';
        } else {
            settings.selectedTheme = 'light';
        }
    }
    return settings
}

export function saveSettings() {
    localStorage.setItem('settings', JSON.stringify(settings));
}