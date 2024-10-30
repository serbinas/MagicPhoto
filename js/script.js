const fileInput = document.querySelector('.btnUpload');
const downloadButton = document.querySelector('.file-download');
const wrapperCanvas = document.querySelector('.wrapper-canvas');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const rotateButtons = document.querySelectorAll('.btn-rotate');
const upload = document.querySelector('.upload');
const download = document.querySelector('.download');
const editedPhoto = document.querySelector('.editedPhoto img');
const applyFilterButton = document.querySelector('.btn-filter');
const applyCropButton = document.querySelector('.btn-crop');


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
    link.download = 'new-image.png'; 
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

  const maxCanvasWidth = 1200;
  const maxCanvasHeight = 800;

  let scale = 1;
  if (currentImage.width > maxCanvasWidth || currentImage.height > maxCanvasHeight) {
      const widthScale = maxCanvasWidth / currentImage.width;
      const heightScale = maxCanvasHeight / currentImage.height;
      scale = Math.min(widthScale, heightScale);
  }

  if (currentRotation % 180 !== 0) {
      canvas.width = currentImage.height * scale;
      canvas.height = currentImage.width * scale;
  } else {
      canvas.width = currentImage.width * scale;
      canvas.height = currentImage.height * scale;
  }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((currentRotation * Math.PI) / 180);

  ctx.drawImage(
      currentImage,
      - (currentImage.width * scale) / 2,
      - (currentImage.height * scale) / 2,
      currentImage.width * scale,
      currentImage.height * scale
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


// filter
function applyGrayscaleFilter() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
  }

  ctx.putImageData(imageData, 0, 0);

  upload.classList.add('hidden');
  download.classList.remove('hidden');
  updateEditedPhotoPreview();
}

applyFilterButton.addEventListener('click', applyGrayscaleFilter);


let isDrawing = false;
let startX, startY, endX, endY;

function drawImageCrop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); 
  ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height); 
}

canvas.addEventListener('mousedown', (e) => {
  startX = e.offsetX;
  startY = e.offsetY;
  isDrawing = true;
});

canvas.addEventListener('mousemove', (e) => {
  if (isDrawing) {
      endX = e.offsetX;
      endY = e.offsetY;
      drawSelection();
  }
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
});


function drawSelection() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); 
  drawImageCrop();

  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, startY, endX - startX, endY - startY);
}

function cropImage() {
  const width = endX - startX - 2;
  const height = endY - startY - 2;

  if (width > 0 && height > 0) {
      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCanvas.width = width;
      croppedCanvas.height = height;

      croppedCtx.drawImage(canvas, startX + 1, startY + 1, width, height, 0, 0, width, height);

      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(croppedCanvas, 0, 0);

      startX = startY = endX = endY = 0;
      isDrawing = false;
      upload.classList.add('hidden');
      download.classList.remove('hidden');
      updateEditedPhotoPreview();
  }
}


applyCropButton.addEventListener('click', cropImage);