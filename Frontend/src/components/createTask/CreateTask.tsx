import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import styles from './CreateTask.module.css';
import CreateTaskForm from './CreateTaskForm';
import DynamicTabs from './createTaskTabs';
import { useAuthStore } from '../../context/AuthContext';

const CreateTask: FunctionComponent = () => {
    const navigate = useNavigate();
    const { task_id } = useParams<{ task_id: string }>();
    const { user } = useAuthStore();
    const { createTask, editTask, setTaskData, isLoading, getOneTask, taskData, error } = useTaskContext();
    
    const [taskCreated, setTaskCreated] = useState(false); // Local state for tracking task creation

    const fetchTaskData = useCallback(async () => {
        if (task_id && task_id !== "0") {
            try {
                await getOneTask(task_id!);
            } catch (error) {
                console.error('Error fetching task:', error);
            }
        }
    }, [task_id, setTaskData]);

    useEffect(() => {
        fetchTaskData();
    }, [fetchTaskData]);

    useEffect(() => {
        if (taskCreated) {
            navigate(`/profilePage/${user?.userID}`, { replace: true });
        }
    }, [taskCreated, navigate, user?.userID]);

    const onCreateTaskButtonClick = useCallback(async () => {
        try {
            let success = false;

            if (task_id && task_id !== "0") {
                success = await editTask(); // Ensure editTask() returns a boolean success status
            } else {
                success = await createTask(); // Ensure createTask() returns a boolean success status
            }

            if (success) {
                setTaskCreated(true); // Use local state instead of global `status`
            } else {
                console.error('Task creation failed.');
            }
        } catch (error) {
            console.error('Error during task creation/editing:', error);
        }
    }, [task_id, createTask, editTask]);

    return (
        <div className={styles.createTaskContainer}>
            {isLoading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <>
                    <div className={styles.mainLayout}>
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Task Details</div>
                            <CreateTaskForm />
                        </div>

                        <div className={styles.editorSection}>
                            <div className={styles.sectionTitle}>Code Editor</div>
                            <DynamicTabs />
                        </div>
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            <p>{error}</p>
                        </div>
                    )}

                    <button className={styles.createTaskButton} onClick={onCreateTaskButtonClick}>
                        {task_id !== "0" ? "Edit Task" : "Create Task"}
                    </button>
                </>
            )}
        </div>
    );
};
export default CreateTask;

