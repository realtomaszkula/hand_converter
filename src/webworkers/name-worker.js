addEventListener('message', function (e) {
    var message = e.data;
    var reader = new FileReader();
    reader.onload = function (e) {
        postMessage({
            finished: message.isLast,
            hand: e.target['result']
        }, undefined);
    };
    reader.readAsText(message.file);
});
