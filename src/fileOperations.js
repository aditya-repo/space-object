const fs = require('fs'); // Required for file system operations
const path = require('path');
const s3Client = require('./s3Client'); // Import the S3 client
const { ListObjectsV2Command, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const getContentType = require('./contentTypes'); // Import content type function
const config = require('./config'); 
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner'); 

// Function to list files and directories in the Space
const listFiles = async () => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: config.bucketName, // Use the bucket name from the config
            Delimiter: '/' // This will group the results into "folders"
        });

        const data = await s3Client.send(command);

        if (data.CommonPrefixes && data.CommonPrefixes.length > 0) {
            console.log("Directories in the Space:");
            data.CommonPrefixes.forEach(prefix => {
                console.log(prefix.Prefix);
            });
        } else {
            console.log("No directories found in the Space.");
        }

        if (data.Contents && data.Contents.length > 0) {
            console.log("Files in the Space:");
            data.Contents.forEach(file => {
                console.log(file.Key);
            });
        } else {
            console.log("No files found in the Space.");
        }
    } catch (error) {
        console.error("Error listing files:", error);
    }
};

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


// Function to download a file from S3
const downloadFile = async (s3FilePath, localDownloadPath) => {
    try {
        // Create the GetObjectCommand to fetch the file
        const command = new GetObjectCommand({
            Bucket: config.bucketName,
            Key: s3FilePath // File path in the S3 bucket
        });

        const data = await s3Client.send(command);

        // Create a write stream to download the file to the local system
        const fileStream = fs.createWriteStream(localDownloadPath);

        // Pipe the S3 stream data into the file stream
        data.Body.pipe(fileStream);

        // Handle stream events
        fileStream.on('close', () => {
            console.log(`File downloaded successfully to ${localDownloadPath}`);
        });

        fileStream.on('error', (error) => {
            console.error('Error downloading file:', error);
        });
    } catch (error) {
        console.error("Error fetching file:", error);
    }
};

// Function to generate a pre-signed URL
const getPreSignedUrl = async (s3FilePath, expiresIn = 900) => {
    try {
        // Create the GetObjectCommand to generate the URL for the file
        const command = new GetObjectCommand({
            Bucket: config.bucketName,
            Key: s3FilePath // File path in the S3 bucket
        });

        // Generate the pre-signed URL
        const url = await getSignedUrl(s3Client, command, { expiresIn });

        console.log(`Pre-signed URL: ${url}`);
        return url;
    } catch (error) {
        // Handle access denied and expired errors
        if (error.name === 'AccessDenied' || error.name === 'RequestExpired') {
            console.error('File not found.');
            return 'File not found.'; // Return a simple message for the user
        }

        // Log other errors
        console.error("Error generating pre-signed URL:", error);
        return 'An error occurred.'; // Return a generic error message
    }
};

module.exports = { listFiles, uploadFolder, downloadFile, getPreSignedUrl };
