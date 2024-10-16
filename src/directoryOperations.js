const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
const s3Client = require('./s3Client'); // Import the S3 client
const config = require('./config'); // Import the configuration file

// Function to list all directories in the S3 bucket
const listDirectories = async () => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: config.bucketName,
            Delimiter: '/' // Group results into "folders"
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
    } catch (error) {
        console.error("Error listing directories:", error);
    }
};

// Function to list files in a specific directory
const listFilesInDirectory = async (directoryPath) => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: config.bucketName,
            Prefix: directoryPath, // Specify the directory to list files from
            Delimiter: '/' // Optional: use to group results
        });

        const data = await s3Client.send(command);

        if (data.Contents && data.Contents.length > 0) {
            console.log(`Files in directory "${directoryPath}":`);
            data.Contents.forEach(file => {
                console.log(file.Key);
            });
        } else {
            console.log(`No files found in directory "${directoryPath}".`);
        }
    } catch (error) {
        console.error("Error listing files in directory:", error);
    }
};

// Function to check if a directory exists
const checkDirectoryExists = async (directoryPath) => {
    try {
        // Ensure directoryPath ends with a "/"
        const directoryPrefix = directoryPath.endsWith('/') ? directoryPath : `${directoryPath}/`;

        const command = new ListObjectsV2Command({
            Bucket: config.bucketName,
            Prefix: directoryPrefix, // Searching for the directory with the correct prefix
            Delimiter: '/' // This will help in grouping the results
        });

        const data = await s3Client.send(command);

        // Check if there are any contents or subdirectories under the given prefix
        if ((data.CommonPrefixes && data.CommonPrefixes.length > 0) || (data.Contents && data.Contents.length > 0)) {
            return true; // Directory exists
        } else {
            return false; // Directory not found
        }
    } catch (error) {
        console.error("Error checking directory existence:", error);
        return false;
    }
};

module.exports = { listDirectories, listFilesInDirectory, checkDirectoryExists };
