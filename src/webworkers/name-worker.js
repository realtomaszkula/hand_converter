addEventListener('message', function (e) {
    var files = e.data;
    for (var i = 0; i < files.length; i++) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var progress = Math.ceil(i * 100 / files.length);
            postMessage(progress, undefined);
        };
        reader.readAsText(files[i]);
    }
});
