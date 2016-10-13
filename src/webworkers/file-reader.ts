import { HandObject, Message, Response} from './interfaces';

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
    reader.readAsText(message.file);

});

