
const validate = (name) => (/\.txt$/).test(name);

addEventListener('message', (e) => {

    let 
        valid = 0,
        invalid = 0;

    for (let f of e.data) {
        validate(f.name) ? valid++ : invalid++;
    }

    postMessage({ valid: valid, invalid: invalid });

});

