import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import convertHourToMinutes from '../utils/convertHourToMinutes';

const prisma = new PrismaClient();

interface IScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export default class ClassesController {
  async index(req: Request, res: Response) {
    const filters = req.query;

    const subject = filters.subject as string;
    const week_day = filters.week_day as string;
    const time = filters.time as string;

    if (!week_day || !subject || !time) {
      return res.status(400).json({
        error: 'Missing filters to search classes'
      });
    }

    const timeInMinutes = convertHourToMinutes(time as string);

    try {
      const classes = await prisma.classes.findMany({
        where: {
          subject,
          AND: {
            class_schedule: {
              some: {
                week_day: Number(week_day),
                from: {
                  lte: timeInMinutes
                },
                to: {
                  gt: timeInMinutes
                }
              }
            }
          }
        },
        include: {
          user: {
            select: {
              avatar: true,
              bio: true,
              name: true,
              whatsapp: true
            }
          },
        }
      });
      return res.json(classes);
    } catch (err) {
      return res.status(400).json({
        error: 'Houve algum erro'
      });
    }
  }

  async create(req: Request, res: Response) {
    const { name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule
    } = req.body;

    const Schedule = schedule.map((scheduleItem: IScheduleItem) => {
      return {
        week_day: Number(scheduleItem.week_day),
        from: convertHourToMinutes(scheduleItem.from),
        to: convertHourToMinutes(scheduleItem.to),
      };
    });

    try {
      const response = await prisma.users.create({
        data: {
          name,
          avatar,
          whatsapp,
          bio,
          classes: {
            create: {
              subject,
              cost,
              class_schedule: {
                create: Schedule
              }
            }
          }
        }
      });

      return res.json(response);

    } catch (err) {
      return res.status(400).json({
        error: 'Houve algum erro'
      });
    }
  }
}
