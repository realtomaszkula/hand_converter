addEventListener('message', function (e) {
    var file = e.data;
    var reader = new FileReader();
    reader.onload = function (e) {
        postMessage(e.target['result'], undefined);
    };
    reader.readAsText(file);
});
