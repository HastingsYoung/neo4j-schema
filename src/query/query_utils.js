exports.genAlphabet = (n = 26) => {
    const alphabet = [];
    let i = 0;
    while (i < n) {
        alphabet.push('_x' + i);
        i++;
    }
    return alphabet;
};