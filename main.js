const fileInput = document.getElementById('fileInput');
const loader = document.getElementById('loader');
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popup-message');
const popupClose = document.getElementById('popup-close');
const uploadButton = document.getElementById('uploadButton');
let uploadedFiles = [];

const dbx = new Dropbox.Dropbox({
  clientId: CONFIG.DROPBOX_CLIENT_ID,
  clientSecret: CONFIG.DROPBOX_CLIENT_SECRET,
  refreshToken: CONFIG.DROPBOX_REFRESH_TOKEN,
  accessToken: CONFIG.DROPBOX_ACCESS_TOKEN,
});

// Helper to generate a unique session ID (e.g., UUID-like)
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 10);  // Simple random string
}

// Sleep function to delay execution (in milliseconds)
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const uploadFiles = async () => {
  if (uploadedFiles.length === 0) {
    showPopup('Morate odabrati barem jednu fotografiju!'); // Show error popup if no files are selected
    return;
  }

  if (uploadedFiles.length > 5) {
    showPopup('Moguće je priložiti maks. 5 fotografija odjednom!'); // Show error popup if more than 5 files are selected
    fileInput.value = ''; // Clear the file input
    uploadedFiles = []; // Reset the uploaded files array
    return;
  }

  showLoader(); // Show loader before starting the upload

  // Generate a unique session folder name
  const sessionFolder = `/svatovi/${generateSessionId()}`;

  try {
    let retries = 2; // Maximum number of retries for folder creation
    while (retries > 0) {
      try {
        // Attempt to create the session folder in Dropbox
        await dbx.filesCreateFolderV2({ path: sessionFolder });
        console.log(`Session folder created: ${sessionFolder}`);
        break; // Exit the retry loop if the folder creation is successful
      } catch (error) {
        if (error.status === 429 || (error.status >= 500 && error.status < 600)) {
          // Handle rate-limiting (429) or server-side errors (5xx)
          const delay = Math.pow(2, 3 - retries) * 1000; // Exponential backoff
          console.log(`Error creating folder (status: ${error.status}). Retrying in ${delay / 1000}s...`);
          await sleep(delay); // Wait before retrying
          retries--;
        } else {
          // Log and show popup for non-retryable errors
          console.error('Error creating session folder:', error);
          showPopup('Greška pri kreiranju mape!');
          hideLoader();
          return;
        }
      }
    }

    if (retries === 0) {
      // If all retries are exhausted, show an error and exit
      console.error('Failed to create session folder after multiple attempts.');
      showPopup('Greška pri kreiranju mape nakon više pokušaja!');
      hideLoader();
      return;
    }
  } catch (error) {
    console.error('Unexpected error during folder creation:', error);
    showPopup('Neočekivana greška pri kreiranju mape!');
    hideLoader();
    return;
  }

  const batchSize = 3; // Number of files to upload concurrently
  for (let i = 0; i < uploadedFiles.length; i += batchSize) {
    const batch = uploadedFiles.slice(i, i + batchSize); // Create a batch of files

    try {
      // Upload all files in the batch concurrently
      await Promise.all(
        batch.map(async (file) => {
          let retries = 3; // Maximum number of retries for 429 responses

          while (retries > 0) {
            try {
              console.log(`Uploading file: ${file.name}`);

              // Attempt to upload the file
              await dbx.filesUpload({
                path: `${sessionFolder}/${file.name}`,
                contents: file,
              });

              console.log(`File ${file.name} uploaded successfully.`);
              break; // Exit the retry loop if the upload is successful
            } catch (error) {
              if (error.status === 429) {
                // Handle rate-limiting (429 Too Many Requests)
                const delay = Math.pow(2, 3 - retries) * 1000; // Exponential backoff
                console.log(`Rate limit hit. Retrying in ${delay / 1000}s...`);
                await sleep(delay); // Wait before retrying
                retries--;
              } else {
                console.error(`Error uploading file ${file.name}:`, error);
                showPopup(`Greška pri učitavanju fotografija...`);
                break; // Exit the retry loop for non-429 errors
              }
            }
          }
        })
      );

      console.log(`Batch ${Math.ceil((i + 1) / batchSize)} uploaded successfully.`);
    } catch (error) {
      console.error('Error uploading batch:', error);
      showPopup('Greška pri učitavanju fotografija...');
    }

    // Add a delay between batches
    if (i + batchSize < uploadedFiles.length) {
      await sleep(100); // 500ms delay between batches
    }
  }

  hideLoader(); // Hide loader after all uploads are complete
  showPopup('Uspješno ste učitali fotografije!'); // Show success popup
  fileInput.value = ''; // Clear the file input
  uploadedFiles = []; // Reset the uploaded files array
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
  uploadedFiles = Array.from(fileInput.files); // Reset the array with the new files
});

document.addEventListener('click', (event) => {
  if (event.target === popup) {
    hidePopup(); // Hide popup when clicking outside of it
  }
})

uploadButton.addEventListener('click', async () => {
  await uploadFiles(); // Wait for the uploadFiles function to complete
});