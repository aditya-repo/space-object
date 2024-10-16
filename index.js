const { S3Client, ListObjectsV2Command, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs'); // Required for file system operations
const path = require('path');
const config = require('./config'); // Import the configuration file

// Configure the S3 client with your DigitalOcean Spaces credentials
const s3Client = new S3Client(config.s3Client);

// Function to list files and directories in the Space
const listFiles = async () => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: config.bucketName, // Use the bucket name from the config
            Delimiter: '/' // This will group the results into "folders"
        });

        const data = await s3Client.send(command);

        // console.log("List command response:", JSON.stringify(data, null, 2));

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

        const response = await s3Client.send(command);
        // console.log('Uploaded:', destinationKey);
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

// Function to determine content type based on file extension
const getContentType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.zip': 'application/zip',
        '.tar': 'application/x-tar',
        '.gz': 'application/gzip',
        // Add more file types as needed
    };
    return contentTypes[ext] || 'application/octet-stream'; // Default to binary if unknown
};

// Example Usage
(async () => {
    await listFiles(); 

    // Specify the path to the folder you want to upload
    const folderPath = path.join(__dirname, './input'); // Update this path

    await uploadFolder(folderPath); // Upload the folder and its contents

    // List files again to see the uploaded files
    await listFiles();
})();
