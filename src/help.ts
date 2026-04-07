interface HelpMessage {
    title: string,
    lines: string[]
}

interface HelpMessages {
    [key: string]: HelpMessage
}

export const helpMessages: HelpMessages = {
    'start': {
        title: '[start] [seconds]',
        lines: [
            'Start the game',
            'seconds: sets a new time limit in seconds (default: 60)',
            'the start is optional',
            'Examples: start 30',
            '          30'
        ]
    },
    'color': {
        title: 'color &lt;name&gt; &lt;hex&gt;',
        lines: [
            'Change a color on the page',
            'name: primary, secondary, correct, incorrect, background',
            'hex: A hex color value (e.g., #FF5500 or FF5500)',
            'Example: color primary #FF5500'
        ]
    },
    'theme': {
        title: 'theme &lt;mode&gt;',
        lines: [
            'Switch between light and dark mode',
            'mode: light or dark',
            'Example: theme dark'
        ]
    },
    'font': {
        title: 'font size &lt;area&gt; &lt;size&gt;',
        lines: [
            'Change the font size of the typing area',
            'area: title, stats, game, or help',
            'size: Font size in px or rem',
            'Examples: font size title 48',
            '          font size main 48px',
            '          font size stats 2.5rem'
        ]
    },
    'reset': {
        title: 'reset &lt;theme|font&gt; [option]',
        lines: [
            'Reset settings to defaults',
            '',
            'reset theme [light|dark] - Reset theme to default colors',
            'reset font [area] - Reset font size to default',
            '',
            'Examples: reset theme dark',
            '          reset font'
        ]
    },
    'caret': {
        title: 'caret &lt;style&gt;',
        lines: [
            'Styles the caret',
            'style: Either bar, underscore, block, or none',
            'Example: caret underscore'
        ]
    },
    'slide': {
        title: 'slide [speed] [trigger]',
        lines: [
            'Configure how the typing row slides',
            'speed: Choose between slow, medium, fast and none.',
            'trigger: Either letter or word. On word completion sucks', 
            'Examples: slide fast',
            '          slide letter'
        ]

    },
    'help': {
        title: 'help [command]',
        lines: [
            'Show help for commands',
            'command: Optional command name for specific help',
            'Example: help color'
        ]
    },
    'default': {
        title: 'Available Commands',
        lines: [
            'start [seconds] - Start a new game',
            'color &lt;name&gt; &lt;hex&gt; - Change colors',
            'theme &lt;light|dark&gt; - Switch theme',
            'font &lt;size&gt; - Change font size',
            'caret &lt;style&gt; - Choose a caret style',
            'slide [speed] [trigger] - Customize how the typing row slides',
            'reset &lt;theme|font&gt; - Reset settings',
            'help [command] - Show help',
            '',
            'Tip: Just type a number to quick start!'
        ]
    }
};