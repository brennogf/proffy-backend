import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class ConnectionsController {
  async index(req: Request, res: Response) {
    try {
      const total = await prisma.connections.count();
      res.json({ total });
    } catch (err) {
      return res.status(400).json({
        error: 'Houve algum erro'
      })
    }
  }

  async create(req: Request, res: Response) {
    const { user_id } = req.body;

    try {
      await prisma.connections.create({
        data: {
          user: {
            connect: {
              id: user_id
            }
          }
        }
      });
      return res.status(201).send();
    } catch (err) {
      return res.status(400).json({
        error: 'Houve algum erro'
      })
    }
  }
}
