export const CAPS = (str) => {
    if (str.includes("_")) {
        const new_string = [];
        for (let s of str.split("_")) {
            new_string.push(s.toUpperCase());
        }
        return new_string.join(" ");
    } else {
        return str.toUpperCase();
    }
}