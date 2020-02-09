import * as Express from 'express';

export const getDepartures = async (
  _: Express.Request,
  res: Express.Response,
) => {
  return res.sendStatus(200);
};
