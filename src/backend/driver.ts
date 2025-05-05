import { DBInit, routeAdd, } from './db_opertions.ts';
import { LatLng, getRoundRoute, getRouteWithStops, getStartEndTrip } from './api_calls.ts'
import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const PORT = 8443;
const CURRENTIP = '172.20.10.8';



function isLatLng(obj: any): obj is LatLng {
  return (
    obj != null &&
    typeof obj === 'object' &&
    typeof obj.latitude === 'number' &&
    typeof obj.longitude === 'number'
  );
}


app.use(cors({
  origin: (_incomingOrigin, callback) => {
    // allow any incomingOrigin (including undefined/null)
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// To parse JSON
app.use(express.json());

async function main() {
  const db = await DBInit();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS request_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      headers TEXT,
      body TEXT
    )
  `);

  // Write to request_log db
  app.use(async (req: Request, _res: Response, next: NextFunction) => {
    const { method, path: urlPath, headers, body } = req;
    const ts = new Date().toISOString();
    try {
      console.log("request_log")
      await db.run(
        `INSERT INTO request_log (timestamp, method, path, headers, body)
       VALUES (?, ?, ?, ?, ?)`,
        ts,
        method,
        urlPath,
        JSON.stringify(headers),
        JSON.stringify(body)
      );
    } catch (err) {
      console.error('Failed to log to DB:', err);
    }
    next();
  });


  app.post('/routesAdd', async (req: Request, res: Response): Promise<void> => {
    try {
      const userIDHeader = req.header('userID');
      if (!userIDHeader) {
        //return res.status(400).json({ success: false, message: 'Missing userID header' });
      }

      //const userID = parseInt(userIDHeader, 10);
      const routeData = req.body as JSON;

      // here’s where you “execute a function upon fetch”
      await routeAdd(db, routeData);

      // and respond:
      res.status(201).json({ success: true, message: 'Route processed' });

    } catch (err: any) {
      console.error('Error in /routesAdd:', err);
      res
        .status(err instanceof Error && err.message.startsWith('origin')
          ? 400
          : 500)
        .json({
          success: false,
          message: err.message || 'Internal server error',
        });
    }
  });

  app.post(
    '/routeGenerateRoundWalk',
    async (
      req: Request<{}, {}, {
        start: { latitude: number, longitude: number };
        len: number;
        seed: number;
        userID: number;
      }>,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      console.log("waasdasf")
      //Get values from req.body
      const { start, len, seed, userID } = req.body;
      if (
        !start ||
        typeof start.latitude !== 'number' ||
        typeof start.longitude !== 'number' ||
        typeof len !== 'number' ||
        typeof seed !== 'number' ||
        typeof userID !== 'number' // Kolla antal requests ifall en requst limit, använda loggen? eller något annat sätt.
      ) {
        res.status(400).json({ error: 'Missing or invalid parameters' });
        return;
      }

      try {
        const orsRes = await getRoundRoute(start, len, seed);
        if (!orsRes.ok) {
          const errText = await orsRes.text();
          // 4️⃣ Log & forward as a 502 Bad Gateway
          console.error('ORS error:', errText);
          res.status(502).json({ error: 'External routing service failed' });
          return;
        }

        const data = await orsRes.json();
        if (
          !data.routes ||
          !Array.isArray(data.routes) ||
          data.routes.length === 0 ||
          !data.routes[0].geometry
        ) {
          console.error('Invalid route payload:', data);
          res.status(500).json({ error: 'Invalid route data from ORS' });
          return;
        }

        // 5️⃣ Return the successful response
        res.json(data);
      } catch (err) {
        // 6️⃣ On unexpected errors, hand off to your error handler
        next(err);
      }

    }
  );



  app.post('/routeWithStops', async (req: Request<{}, {}, {
    coordinates: LatLng[];
    userID: number;
  }>, res: Response,): Promise<void> => {
    const { coordinates } = req.body;
    if (
      isLatLng(coordinates)
    )
      console.log("islatlng funkar")
    try {

      const response = await getRouteWithStops(coordinates);

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("API error:", error);
      return;
    }
  })



  app.post('/startEndTrip', async (req: Request<{}, {}, {
    start: { latitude: number, longitude: number };
    stop: { latitude: number, longitude: number };
    userID: number;
  }>, res: Response): Promise<void> => {
    const { start, stop } = req.body;
    if (!isLatLng(start) && !isLatLng(stop)) {
      console.error('is fucked');
      return;
    }

    try {
      const response = await getStartEndTrip(start, stop);
      const data = await response.json();
      console.log('yay startendtip')
      res.json(data);
    } catch (err) {
      console.error(err);
    }
  })




  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });


  // --- Start HTTPS server ---
  http.createServer(app).listen(PORT, () => {
    console.log(`🚀 HTTPS server listening on https://${CURRENTIP}:${PORT}`);
  });
}


main()
