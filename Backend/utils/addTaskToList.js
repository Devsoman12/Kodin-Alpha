export const addTaskToList = async (pool, task_id, user_id, { list_id = null, list_name = null }) => {
    if (!list_id && !list_name) {
      throw new Error("Either list_id or list_name must be provided.");
    }
  
    // Get the list_id if only list_name is provided
    if (!list_id && list_name) {
      const listIdQuery = `SELECT list_id FROM listoftask WHERE name = $1 AND user_id = $2`;
      const listIdResult = await pool.query(listIdQuery, [list_name, user_id]);
  
      if (listIdResult.rowCount === 0) {
        throw new Error(`List '${list_name}' not found for user_id: ${user_id}`);
      }
  
      list_id = listIdResult.rows[0].list_id;
    }
  
    // Check if the task is already in the list
    const checkTaskInListQuery = `SELECT 1 FROM isInList WHERE task_id = $1 AND list_id = $2`;
    const taskInListResult = await pool.query(checkTaskInListQuery, [task_id, list_id]);
  
    if (taskInListResult.rowCount === 0) {
      const insertTaskQuery = `INSERT INTO isInList (task_id, list_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`;
      await pool.query(insertTaskQuery, [task_id, list_id]);
    }
};  