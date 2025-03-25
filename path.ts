const axios = require('axios');

// Define your OpenRouteService API key
const apiKey = '5b3ce3597851110001cf6248c932f24e6e9e4ac58186a327506210a4';  // Replace with your OpenRouteService API key
const url = 'https://api.openrouteservice.org/v2/directions/foot-walking';

const startPoint = [18.0686, 59.3293]; // Central Stockholm
const endPoint = [17.6389, 59.3293];  // Central Uppsala



const requestData = {
  coordinates: [startPoint, endPoint]
};

axios.post(url, requestData, {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log('Route:', response.data);
  })
  .catch(error => {
    if (error.response) {
      console.error('Error response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  });
