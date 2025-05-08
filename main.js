const fileInput = document.getElementById('fileInput');
const loader = document.getElementById('loader');
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popup-message');
const popupClose = document.getElementById('popup-close');
let uploadedFiles = [];

const dbx = new Dropbox.Dropbox({
  clientId: CONFIG.DROPBOX_CLIENT_ID,
  clientSecret: CONFIG.DROPBOX_CLIENT_SECRET,
  refreshToken: CONFIG.DROPBOX_REFRESH_TOKEN,
  accessToken: CONFIG.DROPBOX_ACCESS_TOKEN,
});

fileInput.addEventListener('change', () => {
  uploadedFiles.push(...fileInput.files);
});

const uploadFiles = () => {
  if (uploadedFiles.length === 0) {
    showPopup('No files selected!'); // Show error popup if no files are selected
    return;
  }

  showLoader(); // Show loader before starting the upload

  // Create an array of promises for all file uploads
  const uploadPromises = uploadedFiles.map(file =>
    dbx.filesUpload({
      path: `/svatovi/${file.name}`,
      contents: file,
    })
  );

  // Wait for all uploads to complete
  Promise.all(uploadPromises)
    .then(() => {
      showPopup('Uspješno ste učitali fotografije!'); // Show success popup
    })
    .catch(() => {
      showPopup('Ups! Dogodila se greška..'); // Show error popup
    })
    .finally(() => {
      fileInput.value = ''; // Clear the file input
      uploadedFiles = []; // Reset the uploaded files array
      hideLoader(); // Hide loader after all uploads are complete
    });
};

const showLoader = () => {
  loader.classList.remove('hidden'); // Show the loader
  document.body.style.pointerEvents = 'none'; // Disable all interactions
};

const hideLoader = () => {
  loader.classList.add('hidden'); // Hide the loader
  document.body.style.pointerEvents = 'auto'; // Re-enable interactions
};

// Show the popup
const showPopup = (message) => {
  popupMessage.textContent = message;
  popup.classList.remove('hidden');

  // Automatically hide the popup after 5 seconds
  setTimeout(() => {
    hidePopup();
  }, 4000);
};

// Hide the popup
const hidePopup = () => {
  popup.classList.add('hidden');
};

// Close popup on button click
popupClose.addEventListener('click', hidePopup);

fileInput.addEventListener('change', () => {
  uploadedFiles.push(...fileInput.files);
});

document.addEventListener('click', (event) => {
  if (event.target === popup) {
    hidePopup(); // Hide popup when clicking outside of it
  }
})