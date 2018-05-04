const randomInt = (start, end) => {
    return Math.floor(Math.random() * (end - start) + start)
}

const getDigit13 = (e, t, n, r, i, s, o, u, a, f, l, c) => {
    let sum = e * 13 + t * 12 + n * 11 + r * 10 + i * 9 + s * 8 + o * 7 + u * 6 + a * 5 + f * 4 + l * 3 + c * 2;
    sum = sum % 11;
    if (sum <= 1) {
        return 1 - sum
    } else {
        return 11 - sum
    }
}

const getDigit3 = (id2) => {
    let id3 = 0
    if (id2 == 1) {
        id3 = randomInt(0, 9)
    } else if (id2 == 2) {
        id3 = randomInt(0, 7)
    } else if (id2 == 3) {
        id3 = randomInt(0, 9)
    } else if (id2 == 4) {
        id3 = randomInt(0, 9)
    } else if (id2 == 5) {
        id3 = randomInt(0, 8)
    } else if (id2 == 6) {
        id3 = randomInt(0, 7)
    } else if (id2 == 7) {
        id3 = randomInt(0, 7)
    } else if (id2 == 8) {
        id3 = randomInt(0, 6)
    } else if (id2 == 9) {
        id3 = randomInt(0, 6)
    }
    return id3
}
 
export const genIdCard = () => {
    var e;
    const id1 = randomInt(1, 8);
    const id2 = randomInt(1, 9);
    const id3 = getDigit3
    const id4 = 0;
    const id5 = randomInt(1, 5);
    const id6 = 0;
    const id7 = randomInt(1, 9);
    const id8 = randomInt(0, 9);
    const id9 = randomInt(0, 9);
    const id10 = randomInt(0, 9);
    const id11 = randomInt(0, 9);
    const id12 = randomInt(1, 9);
    const id13 = getDigit13(id1, id2, id3, id4, id5, id6, id7, id8, id9, id10, id11, id12);
}