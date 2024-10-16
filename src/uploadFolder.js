const fs = require('fs'); // Required for file system operations
const path = require('path');
const s3Client = require('./s3Client'); // Import the S3 client
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const getContentType = require('./contentTypes'); // Import content type function
const config = require('./config'); // Import the configuration file

// Function to upload files from a folder to the Space
const uploadFolder = async (folderPath, basePath = '') => {
    const files = fs.readdirSync(folderPath); // Read all files in the folder

    for (const file of files) {
        const filePath = path.join(folderPath, file); // Full path of the file
        const destinationKey = path.join(basePath, file); // Key in the Space maintaining the folder structure

        if (fs.lstatSync(filePath).isDirectory()) {
            // Recursively upload folders
            await uploadFolder(filePath, destinationKey);
        } else {
            // Upload files
            await uploadFile(filePath, destinationKey);
        }
    }
};

// Function to upload a single file to the Space
const uploadFile = async (filePath, destinationKey) => {
    try {
        const fileStream = fs.createReadStream(filePath);
        const stats = fs.statSync(filePath);

        const command = new PutObjectCommand({
            Bucket: config.bucketName,
            Key: destinationKey, // The name of the file in the Space
            Body: fileStream,
            ContentType: getContentType(filePath), // Dynamically set content type
            ContentLength: stats.size // Size of the file
        });

        await s3Client.send(command);
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

module.exports = { uploadFolder };
