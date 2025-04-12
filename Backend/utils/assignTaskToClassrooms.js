export const assignTaskToClassrooms = async (pool, task_id, classrooms, start_date, start_time, end_date, end_time) => {
    if (!classrooms || classrooms.length === 0) return;
  
    for (const classroomId of classrooms) {

      if (classroomId === 0){
        continue;
      }
      
      let start_timestamp = start_date && start_time ? `${start_date} ${start_time}` : null;
      let end_timestamp = end_date && end_time ? `${end_date} ${end_time}` : null;

  
      // const classroomTaskQuery = `
      //   INSERT INTO classroomtask (task_id, classroom_id, start_date, lock_date)
      //   VALUES ($1, $2, $3, $4)`;
      const classroomTaskQuery = `
        INSERT INTO classroomtask (task_id, classroom_id, start_date, lock_date) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (task_id, classroom_id) 
        DO UPDATE SET start_date = EXCLUDED.start_date, lock_date = EXCLUDED.lock_date`;



      await pool.query(classroomTaskQuery, [task_id, classroomId, start_timestamp, end_timestamp]);
  
      const listIdQuery = `SELECT list_id FROM classroommlistoftasks WHERE classroom_id = $1`;
      const listIdResult = await pool.query(listIdQuery, [classroomId]);
  
      if (listIdResult.rowCount > 0) {
        const list_id = listIdResult.rows[0].list_id;
  
        const checkIfTaskInListQuery = `SELECT 1 FROM isInList WHERE task_id = $1 AND list_id = $2`;
        const taskInListResult = await pool.query(checkIfTaskInListQuery, [task_id, list_id]);
  
        if (taskInListResult.rowCount === 0) {
          const insertIntoListQuery = `
            INSERT INTO isInList (task_id, list_id) 
            VALUES ($1, $2) ON CONFLICT DO NOTHING`;
          await pool.query(insertIntoListQuery, [task_id, list_id]);
        }
      } else {
        console.log(`No task list found for classroom_id: ${classroomId}`);
      }
    }
  };