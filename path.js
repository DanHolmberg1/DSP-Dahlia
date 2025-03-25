var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var axios = require('axios');
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
var ORS_API_KEY = '5b3ce3597851110001cf6248c932f24e6e9e4ac58186a327506210a4';
var ORS_URL = 'https://api.openrouteservice.org/v2/directions/foot-walking';
function getWalkingRoute(start, end) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, route, distance, duration, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios.post(ORS_URL, {
                            coordinates: [start, end]
                        }, {
                            headers: {
                                Authorization: ORS_API_KEY,
                                'Content-Type': 'application/json'
                            }
                        })];
                case 1:
                    response = _b.sent();
                    data = response.data;
                    console.log(JSON.stringify(data, null, 2)); // Debug
                    if (!data.routes || data.routes.length === 0) {
                        console.error("Ingen rutt hittades – kontrollera koordinater eller API-nyckel.");
                        return [2 /*return*/];
                    }
                    route = data.routes[0];
                    distance = route.summary.distance;
                    duration = route.summary.duration;
                    console.log('✅ Rutt hittad!');
                    console.log('Distans (m):', distance);
                    console.log('Varaktighet (s):', duration);
                    console.log('Antal steg:', route.segments[0].steps.length);
                    console.log('Första instruktionen:', route.segments[0].steps[0].instruction);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    console.error('Fel vid API-anrop:', ((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) || error_1.message);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Call the function with example coordinates
var start = [18.0641, 59.3328]; // Stockholm
var end = [17.6400, 59.8581]; // Uppsala
getWalkingRoute(start, end);
