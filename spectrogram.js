
export default class Spectrogram {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    audioBuffer = null;
    fftSize = 256;
    smooth = 0.1;
    frequencyData = [];

    async printFrom(soundFile){
        await this.#loadSoundFile(soundFile);
        await this.#offlinePlay();
        return this.#print();
    }


    async #loadSoundFile(soundFile){
        try{
            let response = await fetch(soundFile);
            if(!response.ok) throw new Error(); 
            let responseBuffer = await response.arrayBuffer();
            this.audioBuffer = await this.audioCtx.decodeAudioData(responseBuffer);
        }catch{
            console.warn('Ошибка загрузки файла звука!' + soundFile);
        }
        
    }


    async #offlinePlay(){
        const offlineCtx = new OfflineAudioContext(
            this.audioBuffer.numberOfChannels,
            this.audioBuffer.length,
            this.audioBuffer.sampleRate
        );

        const source = offlineCtx.createBufferSource();
        source.buffer = this.audioBuffer;
        source.channelCount = this.audioBuffer.numberOfChannels;

        const analyserNode = offlineCtx.createAnalyser();
        analyserNode.fftSize = this.fftSize;
        analyserNode.smoothingTimeConstant = this.smooth;
        const bufferLength = analyserNode.frequencyBinCount;

        const processor = offlineCtx.createScriptProcessor(256, 1, 1);
        let byteOffset = 0;
        processor.onaudioprocess = (ev) => {
            const freqData = new Uint8Array(bufferLength, byteOffset, analyserNode.frequencyBinCount);
            analyserNode.getByteFrequencyData(freqData);
            byteOffset += analyserNode.frequencyBinCount;
            this.frequencyData.push(freqData);
        }
        source.connect(processor);
        processor.connect(offlineCtx.destination);
        source.connect(analyserNode);
        source.start(0);
        await offlineCtx.startRendering();
        var learningData = this.frequencyData;
        console.log(learningData);
    }


    #print(){
        const canvas = document.createElement('canvas');
        const canvasCtx = canvas.getContext("2d");
        canvas.width = this.frequencyData.length;
        canvas.height = this.frequencyData[0].length;
        canvasCtx.fillStyle = `rgb(255, 255, 255)`;
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        this.frequencyData.forEach((colData, colIndex) => {
            colData.reverse();
            colData.forEach((val, indx) => {
                const v = 255 - val;
                canvasCtx.fillStyle = `rgb(${v}, ${v}, ${v})`;
                canvasCtx.fillRect(colIndex,indx, 1, 1);
            });
        });
        return canvas;
    }
}

//frequencyData массив частот


