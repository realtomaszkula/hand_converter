export interface Response {
    finished: boolean;
    handObject: {
        hands: string,
        fileName: string
    }
}

export interface Message {
    isLast: boolean;
    file: File;
}

export interface HandObject {
    hands: string,
    fileName: string
}



