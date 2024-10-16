// config.js

const config = {
    s3Client: {
        region: 'blr1', // Replace with your region
        endpoint: 'https://blr1.digitaloceanspaces.com', // Change to your Space's endpoint
        credentials: {
            accessKeyId: 'DO003D6YY6RGZGX9TRH2', // Replace with your DigitalOcean Spaces Access Key
            secretAccessKey: 'sg6o3cne93UCJG0SYJ2rt4HDHxwl3aymb2E9s2Japto' // Replace with your DigitalOcean Spaces Secret Key
        }
    },
    bucketName: 'bucket6220' // Replace with your Space name
};

module.exports = config;
