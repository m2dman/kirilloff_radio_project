import Spectrogram from "./spectrogram.js";
const spectrogram = new Spectrogram;
let soundFile = null;
const printButton = document.querySelector('button');
const fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    const fileURL = URL.createObjectURL(file);
        soundFile = fileURL;

});

printButton.addEventListener('click', async (ev) => {
    if (soundFile != null) {
        ev.target.remove();
        fileInput.remove();
        document.querySelector('.loading').classList.add('show');
        const picture = await spectrogram.printFrom(soundFile);
        if(picture == 'error'){
            document.querySelector('.loading').classList.add('error');
        }else{
            document.querySelector('.loading').remove();
            document.body.append(picture);
        }

    }
});



