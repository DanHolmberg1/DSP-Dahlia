// requestHandling/routes.ts
import { getAllRoutes, pairUserAndRoute, routeAdd } from "../db_operations";
import { Request, Response, Router } from 'express';
import { db } from '../httpDriver';

const router = Router();

router.post('/create', async (req: Request, res: Response) :Promise <any>=> {
  try {
    const routeId = await routeAdd(db, req.body);
    if (!routeId.success || !routeId.data) {
      console.error("Route creation failed");
      return res.status(500).json({ error: 'Could not create route' });
    }

    const userId = Number(req.headers['userid']); // Custom header
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID in header' });
    }

    await pairUserAndRoute(db, userId, routeId.data);

    return res.status(201).json(routeId.data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

router.get('/get', async (req: Request, res: Response) :Promise<any>=> {
  try {
    const { userID } = req.query;

    if (!userID) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    const parsedUserId = parseInt(userID.toString());
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const allRoutes = await getAllRoutes(db, parsedUserId);
    return res.json(allRoutes.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
