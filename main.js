const fileInput = document.getElementById('fileInput');
const loader = document.getElementById('loader');
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
    alert('No files selected!');
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
    .then(responses => {
      console.log('Success:', responses);
      alert('All files uploaded successfully!');
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error uploading files!');
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