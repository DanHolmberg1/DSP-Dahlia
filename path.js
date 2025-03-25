var axios = require('axios');
// Define your OpenRouteService API key
var apiKey = '5b3ce3597851110001cf6248c932f24e6e9e4ac58186a327506210a4'; // Replace with your OpenRouteService API key
var url = 'https://api.openrouteservice.org/v2/directions/foot-walking';
var startPoint = [18.0686, 59.3293]; // Central Stockholm
var endPoint = [17.6389, 59.3293]; // Central Uppsala
var requestData = {
    coordinates: [startPoint, endPoint]
};
axios.post(url, requestData, {
    headers: {
        'Authorization': "Bearer ".concat(apiKey),
        'Content-Type': 'application/json'
    }
})
    .then(function (response) {
    console.log('Route:', response.data);
})
    .catch(function (error) {
    if (error.response) {
        console.error('Error response:', error.response.data);
    }
    else {
        console.error('Error:', error.message);
    }
});
