interface Response {
    finished: boolean;
    hand: string;
}

interface Message {
    isLast: boolean;
    file: File;
}

addEventListener('message', (e) => {
    let message: Message = e.data;
    let reader = new FileReader()
    reader.onload = (e) => {
        postMessage({
            finished: message.isLast,
            hand: e.target['result']
        } as Response, undefined);
    }
    reader.readAsText(message.file);
});

