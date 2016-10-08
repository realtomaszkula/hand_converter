
const validate = (name) => (/\.txt$/).test(name);

addEventListener('message', (e) => {
    let files: File[] = e.data;
    let 
        valid = 0,
        invalid = 0;

    for (let file of files) {
        validate(file.name) ? valid++ : invalid++;
    }

    postMessage({ valid: valid, invalid: invalid }, undefined);
});

