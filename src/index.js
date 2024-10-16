const path = require('path');
const { listDirectories, listFilesInDirectory, checkDirectoryExists } = require('./directoryOperations');
const { uploadFolder, downloadFile, getPreSignedUrl } = require('./fileOperations');

// Example Usage
(async () => {
    // List all directories
    await listDirectories(); 

    // Check if a specific directory exists
    const directoryPath = 'Dataset3/Dataset/'; // Update this path
    const exists = await checkDirectoryExists(directoryPath);
// sss
    // if (exists) {
    //     // List files in the specified directory
    //     await listFilesInDirectory(directoryPath);
    // } else {
    //     console.log(`Directory "${directoryPath}" not found.`);
    // }

    // Specify the path to the folder you want to upload
    // const folderToUpload = path.join(__dirname, './input'); // Update this path
    // await uploadFolder(folderToUpload); // Upload the folder and its contents

    // List directories again to see the uploaded files
    // await listDirectories();


    // const s3FilePath = 'Dataset3/Dataset/5.png'; // The file you want to download (S3 key)
    // const localDownloadPath = path.join(__dirname, '..', 'downloads', '6.png'); // Local path to save the file

    // await downloadFile(s3FilePath, localDownloadPath); // Download the file


    const s3FilePath = 'Dataset3/Dataset/5.png'; // The file path in the S3 bucket
    const url = await getPreSignedUrl(s3FilePath, 20);
    console.log("Access the file using this URL:", url);

})();
