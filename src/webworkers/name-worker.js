addEventListener('message', function (e) {
    var files = e.data;
    var _loop_1 = function(i) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var progress = Math.ceil(i * 100 / files.length);
            postMessage(progress, undefined);
        };
        reader.readAsText(files[i]);
    };
    for (var i = 0; i < files.length; i++) {
        _loop_1(i);
    }
});
