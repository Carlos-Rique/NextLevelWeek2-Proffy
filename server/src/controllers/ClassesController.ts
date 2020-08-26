import {Request, Response} from 'express';
import db from '../database/connections';
import convertHourToMinutes from '../utils/convertHourToMinute';

interface ScheduleItem {
  week_day: string,
  to: string,
  from: string
}

export default class ClassesController {


  async index(request: Request, response: Response){
    const filters = request.query;

    // console.log(filters)

    const subject = filters.subject as string;
    const week_day = filters.week_day as string;
    const time = filters.time as string;

    if (!filters.subject || !filters.week_day || !filters.time) {
      return response.status(400).json({
        error: 'Missing filters in search classes'
      });
    }

    const timeInMinutes = convertHourToMinutes(time);

    const classes = await db('classes')
      .whereExists(function() {
        this.select('class_schedule.*')
        .from('class_schedule')
        .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
        .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
        .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
        .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
      })
      .where('classes.subject', '=', subject)
      .join('users', 'classes.user_id', '=', 'users.id')
      .select(['classes.*', 'users.*']);

    return response.json(classes)
  }

  async create(request: Request, response: Response) {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule
    } = request.body;
  
    const trx = await db.transaction();
  
    try {
      const insertedUsers = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio
      });
  
      const user_id = insertedUsers[0];
  
      const insertedClassesIds = await trx('classes').insert({
        user_id,
        subject,
        cost
      }); 
  
      const class_id = insertedClassesIds[0];
  
      const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
        return {
          class_id,
          week_day: scheduleItem.week_day,
          to: convertHourToMinutes(scheduleItem.to),
          from: convertHourToMinutes(scheduleItem.from),
        };
      });
  
      await trx("class_schedule").insert(classSchedule);
      
      await trx.commit();
      return response.status(201).json({"Success": "Yes"});
  
    } catch (error) {
      await trx.rollback();
      return response.status(400).json({
        error: "Unexpected error while creating new class"
      })
    }
  }


}