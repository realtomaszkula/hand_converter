interface Response {
    finished: boolean;
    handObject: {
        hands: string,
        fileName: string
    }
}

interface Message {
    isLast: boolean;
    file: File;
}

addEventListener('message', (e) => {
    let message: Message = e.data;
    let reader = new FileReader()
    let name = message.file.name;
    reader.onload = (e) => {
        postMessage({
            finished: message.isLast,
            handObject: {
                fileName: name,
                hands: e.target['result']
            }
        } as Response, undefined);
    }
        console.log(message.file)
    reader.readAsText(message.file);

});

