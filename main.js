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

  uploadedFiles.forEach(file => {
    dbx.filesUpload({
      path: `/test/${file.name}`,
      contents: file,
    })
      .then(response => {
        console.log('Success:', response);
        alert('Files uploaded successfully!');
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error uploading files!');
      }).finally(() => {
        hideLoader(); // Hide loader after all uploads are complete
      });;
  });
}

const showLoader = () => {
  loader.classList.remove('hidden'); // Show the loader
  document.body.style.pointerEvents = 'none'; // Disable all interactions
};

const hideLoader = () => {
  loader.classList.add('hidden'); // Hide the loader
  document.body.style.pointerEvents = 'auto'; // Re-enable interactions
};