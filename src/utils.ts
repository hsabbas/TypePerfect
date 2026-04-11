const input = document.getElementById('input') as HTMLTextAreaElement;
const help = document.getElementById('help') as HTMLElement;

export const hide = (element: HTMLElement) => {
    element.style.opacity = '0';
}

export const show = (element: HTMLElement) => {
    element.style.opacity = '1';
}

export const moveCaretToEnd = () => {
    let len = input.value.length;
    requestAnimationFrame(() => {
        input.setSelectionRange(len, len);
    });
}

export const showOutput = (output: string) => {
    help.innerText = output
    show(help);
}