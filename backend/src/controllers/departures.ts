import * as Express from 'express';
import { getAllDepartures } from '../integrations/entur';

export const getDepartures = async (
  _: Express.Request,
  res: Express.Response,
) => {
  const departures = await getAllDepartures();
  return res.json(departures);
};
