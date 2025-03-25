const axios = require('axios');

// Define your OpenRouteService API key
// const apiKey = '5b3ce3597851110001cf6248c932f24e6e9e4ac58186a327506210a4';  // Replace with your OpenRouteService API key
// const url = 'https://api.openrouteservice.org/v2/directions/foot-walking';

// const startPoint = [18.0686, 59.3293]; // Central Stockholm
// const endPoint = [17.6389, 59.3293];  // Central Uppsala

// const requestData = {
//   coordinates: [startPoint, endPoint]
// };

// axios.post(url, requestData, {
//   headers: {
//     'Authorization': `Bearer ${apiKey}`,
//     'Content-Type': 'application/json'
//   }
// })
//   .then(response => {
//     console.log('Route:', response.data);
//   })
//   .catch(error => {
//     if (error.response) {
//       console.error('Error response:', error.response.data);
//     } else {
//       console.error('Error:', error.message);
//     }
//   });

const ORS_API_KEY = '5b3ce3597851110001cf6248c932f24e6e9e4ac58186a327506210a4';
const ORS_URL = 'https://api.openrouteservice.org/v2/directions/foot-walking';

async function getWalkingRoute(start: [number, number], end: [number, number]): Promise<void> {
    try {
      const response = await axios.post(ORS_URL, {
        coordinates: [start, end]
      }, {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      });
  
      const data = response.data;
      console.log(JSON.stringify(data, null, 2)); // Debug
  
      if (!data.routes || data.routes.length === 0) {
        console.error("Ingen rutt hittades – kontrollera koordinater eller API-nyckel.");
        return;
      }
  
      const route = data.routes[0];
      const distance = route.summary.distance;
      const duration = route.summary.duration;
  
      console.log('✅ Rutt hittad!');
      console.log('Distans (m):', distance);
      console.log('Varaktighet (s):', duration);
      console.log('Antal steg:', route.segments[0].steps.length);
      console.log('Första instruktionen:', route.segments[0].steps[0].instruction);
  
    } catch (error: any) {
      console.error('Fel vid API-anrop:', error.response?.data || error.message);
    }
  }

  // Call the function with example coordinates
const start: [number, number] = [18.0641, 59.3328];  // Stockholm
const end: [number, number] = [17.6400, 59.8581];    // Uppsala

getWalkingRoute(start, end);
  