import { DBInit, routeAdd } from './db_opertions.ts';
import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const PORT = 8443;
const CURRENTIP = '172.20.10.8';
const ORS_API_KEY = process.env['ORS_API_KEY']!;


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

  if (!ORS_API_KEY) {
    throw new Error("Missing ORS_API_KEY");
  }

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
        start: { latitude: number; longitude: number };
        len: number;
        seed: number;
        userID: number;
      }>,
      res: Response,
      next: NextFunction
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
        typeof userID !== 'number'
      ) {
        res.status(400).json({ error: 'Missing or invalid parameters' });
        return;
      }

      try {
        // 3️⃣ Call external API
        const orsRes = await fetch(
          'https://api.openrouteservice.org/v2/directions/foot-walking',
          {
            method: 'POST',
            headers: {
              Authorization: ORS_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              coordinates: [[start.longitude, start.latitude]],
              continue_straight: true,
              options: {
                round_trip: {
                  length: len,
                  seed: seed,
                  points: 6,
                },
              },
            }),
          }
        );





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






  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });


  // --- Start HTTPS server ---
  http.createServer(app).listen(PORT, () => {
    console.log(`🚀 HTTPS server listening on https://${CURRENTIP}:${PORT}`);
  });
}


main()
