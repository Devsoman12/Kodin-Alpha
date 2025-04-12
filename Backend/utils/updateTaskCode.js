export const upsertTaskCode = async (pool, task_id, languages) => {
  for (const [programming_language, { initial_code, solution_code, unit_test_code }] of Object.entries(languages)) {
    const checkTaskCodeQuery = `SELECT 1 FROM taskCode WHERE task_id = $1 AND programming_language = $2`;
    const taskCodeResult = await pool.query(checkTaskCodeQuery, [task_id, programming_language]);

    if (taskCodeResult.rowCount > 0) {
      const updateTaskCodeQuery = `
        UPDATE taskCode 
        SET initial_code = $1, solution_code = $2, unit_test_code = $3 
        WHERE task_id = $4 AND programming_language = $5`;
      await pool.query(updateTaskCodeQuery, [initial_code, solution_code, unit_test_code, task_id, programming_language]);
    } else {
      const insertTaskCodeQuery = `
        INSERT INTO taskCode (task_id, initial_code, solution_code, unit_test_code, programming_language) 
        VALUES ($1, $2, $3, $4, $5)`;
      await pool.query(insertTaskCodeQuery, [task_id, initial_code, solution_code, unit_test_code, programming_language]);
    }
  }
};
