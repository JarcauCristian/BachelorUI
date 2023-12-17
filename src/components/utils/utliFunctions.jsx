export const CAPS = (str) => {
    if (str.includes("_")) {
        const new_string = [];
        for (let s of str.split("_")) {
            new_string.push(s[0].toUpperCase() + s.slice(1));
        }
        return new_string.join(" ");
    } else {
        return str[0].toUpperCase() + str.slice(1);
    }
}