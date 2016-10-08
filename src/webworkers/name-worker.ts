addEventListener('message', (e) => {
    let files: File[] = e.data;

    for (let i = 0; i < files.length; i++) {
        let reader = new FileReader();
        reader.onload = (e) => {
            let progress = Math.ceil(i * 100 / files.length);
            postMessage(progress, undefined);
        };
        reader.readAsText(files[i]);
    }
});

