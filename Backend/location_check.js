const https = require('https');

// The IP address you want to lookup
const ip_address = ""; // If you want to test, replace with a valid IP

/**
 * Fetch location data from ipinfo.io using HTTPS
 * @param {string} ip - IP address to lookup
 * @returns {Promise<object>} - Location data
 */
function getCustomerLocation(ip) {
  return new Promise((resolve, reject) => {
    // Build the URL
    const url = `https://ipinfo.io/${ip}`;
    
    // Make HTTPS GET request (like curl)
    https.get(url, (response) => {
      let data = '';
      
      // Collect data chunks as they arrive
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      // When all data received, parse JSON
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Failed to parse JSON'));
        }
      });
      
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Run the function
getCustomerLocation(ip_address)
  .then((data) => {
    console.log('IP Information:');
    console.log(data);
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });