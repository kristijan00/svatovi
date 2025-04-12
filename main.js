const fileInput = document.getElementById('fileInput');
let uploadedFiles = [];
import CONFIG from './config.js';

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
      });
  });
}