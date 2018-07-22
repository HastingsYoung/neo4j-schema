exports.genAlphabet = (n = 26) => {
    const GenFunc = function () {
    };
    GenFunc.prototype.alphabet = [];
    GenFunc.prototype.pop = function () {
        return this.alphabet.pop();
    };
    let i = 0;
    while (i < n) {
        GenFunc.prototype.alphabet.push('_x' + i);
        i++;
    }
    return GenFunc;
};