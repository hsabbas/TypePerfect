import { defaults, saveSettings, settings } from "./settings";

export { setFontSize, resetAllFonts, resetFont, getFontSize }
type FontFieldNames = keyof typeof settings.fontSizes;
type SettingsFieldMap = Record<string, FontFieldNames>;

const fieldMap: SettingsFieldMap = {
    m: 'gameFontSize',
    g: 'gameFontSize',
    s: 'statsFontSize',
    t: 'titleFontSize',
    h: 'helpFontSize',
    main: 'gameFontSize',
    game: 'gameFontSize',
    stat: 'statsFontSize',
    stats: 'statsFontSize',
    title: 'titleFontSize',
    help: 'helpFontSize',
};

const initFonts = () => {
    updateUI();
}

const updateUI = () => {
    document.documentElement.style.setProperty('--game-font-size', settings.fontSizes.gameFontSize);
    document.documentElement.style.setProperty('--stats-font-size', settings.fontSizes.statsFontSize);
    document.documentElement.style.setProperty('--title-font-size', settings.fontSizes.titleFontSize);
    document.documentElement.style.setProperty('--help-font-size', settings.fontSizes.helpFontSize);
}

const setFontSize = function (args: string[]): boolean {
    let size = args[3];
    let units = 'px';

    const settingsField = fieldMap[args[2]];
    if (!settingsField) {
        return false;
    }

    if (isNaN(Number(size))) {
        if (args[3].endsWith('px')) {
            units = 'px';
            size = args[3].replace('px', '');
        }
        if (args[3].endsWith('rem')) {
            units = 'rem';
            size = args[3].replace('rem', '');
        }
        if (isNaN(Number(size))) {
            return false;
        }
    } else {
        if (args.length > 4) {
            if (args[4] !== 'px' && args[4] !== 'rem') {
                return false;
            }
            units = args[4];
        }
    }

    let sizeStr = parseFloat(size) + units;
    settings.fontSizes[settingsField] = sizeStr;
    updateUI();
    saveSettings();
    return true;
}

const getFontSize = function (type: string): string {
    return settings.fontSizes[fieldMap[type]];
}

const resetFont = (area: string) => {
    let fontField = fieldMap[area];
    if (!fontField) {
        return false;
    }
    settings.fontSizes[fontField] = defaults.fontSizes[fontField];
    updateUI();
    saveSettings();
    return true;
}

const resetAllFonts = () => {
    settings.fontSizes = defaults.fontSizes;
    updateUI();
    saveSettings();
}

initFonts();