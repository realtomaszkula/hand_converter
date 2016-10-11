addEventListener('message', function (e) {
    var message = e.data;
    var reader = new FileReader();
    var name = message.file.name;
    reader.onload = function (e) {
        postMessage({
            finished: message.isLast,
            handObject: {
                fileName: name,
                hands: e.target['result']
            }
        }, undefined);
    };
    console.log(message.file);
    reader.readAsText(message.file);
});
