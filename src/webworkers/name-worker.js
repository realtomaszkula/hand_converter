var validate = function (name) { return (/\.txt$/).test(name); };
addEventListener('message', function (e) {
    var files = e.data;
    var valid = 0, invalid = 0;
    for (var _i = 0; _i < files.length; _i++) {
        var file = files[_i];
        validate(file.name) ? valid++ : invalid++;
    }
    postMessage({ valid: valid, invalid: invalid }, undefined);
});
