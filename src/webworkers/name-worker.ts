addEventListener('message', (e) => {

    let file = e.data;
    let reader = new FileReader()
    reader.onload = (e) => {
        postMessage(e.target['result'], undefined);
    }
    reader.readAsText(file);

});

