// Simple Seedable Xorshift implementation.
export let seed = 0
let state = 0

export const setSeed = (s: number): boolean => {
    if (isNaN(s)) {
        return false
    }

    if (s === 0) {
        return true
    }

    seed = s
    state = seed
    return true
}

export const clearSeed = () => {
    seed = 0
    state = 0
}

export const resetRNG = () => {
    if (seed != 0) {
        state = seed
    } else {
        state = Date.now()
    }
}

export const randomN = (n: number): number => {
    state ^= state << 13
    state ^= state >> 17
    state ^= state << 5
    return Math.floor(((state >>> 0) / 0xFFFFFFFF) * n)
}