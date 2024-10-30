const fileInput = document.querySelector('.btnUpload');
const downloadButton = document.querySelector('.file-download');
const wrapperCanvas = document.querySelector('.wrapper-canvas');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const rotateButtons = document.querySelectorAll('.btn-rotate');
const upload = document.querySelector('.upload');
const download = document.querySelector('.download');
const editedPhoto = document.querySelector('.editedPhoto img');


let currentImage = null;
let currentRotation = 0;

// show image
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = new Image();
          img.onload = function() {
              currentImage = img;
              currentRotation = 0;
              drawImage();
              wrapperCanvas.classList.remove('hidden');
          };
          img.src = e.target.result;
      };
        reader.readAsDataURL(file);
    } else {
        alert('Please, seclect image.');
    }
});


// save image
function downloadImage() {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'rotated-image.png'; 
    link.click(); 

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    editedPhoto.src = './images/example-photo.png';
    editedPhoto.width = 173;
    editedPhoto.height = 259;

    download.classList.add('hidden');
    wrapperCanvas.classList.add('hidden');
    upload.classList.remove('hidden');
}

downloadButton.addEventListener('click', downloadImage);

//draw image with rotate
function drawImage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (currentRotation % 180 !== 0) {
      canvas.width = currentImage.height;
      canvas.height = currentImage.width;
  } else {
      canvas.width = currentImage.width;
      canvas.height = currentImage.height;
  }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((currentRotation * Math.PI) / 180);
  ctx.drawImage(
      currentImage,
      -currentImage.width / 2,
      -currentImage.height / 2
  );
  ctx.restore();
}


//show preview
function updateEditedPhotoPreview() {
  const scaledCanvas = document.createElement('canvas');
    const scale = Math.min(486 / canvas.width, 275 / canvas.height);
    scaledCanvas.width = canvas.width * scale;
    scaledCanvas.height = canvas.height * scale;

    const scaledCtx = scaledCanvas.getContext('2d');
    scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

    editedPhoto.src = scaledCanvas.toDataURL();
    editedPhoto.width = scaledCanvas.width;
    editedPhoto.height = scaledCanvas.height;
}

// rotate image
rotateButtons.forEach(button => {
  button.addEventListener('click', () => {
      const degree = parseInt(button.getAttribute('data-degree'));
      currentRotation = (currentRotation + degree) % 360;
      drawImage();
      upload.classList.add('hidden');
      download.classList.remove('hidden');
      updateEditedPhotoPreview();
  });
});
