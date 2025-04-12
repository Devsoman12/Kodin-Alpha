import { FunctionComponent, useEffect, useState } from "react";
import styles from "./TaskPreview.module.css";
import axios from "axios";
import { useClassContext } from "../../context/ClassroomContext";
import { useAuthStore } from "../../context/AuthContext";
import ErrorNotification from "../overlay/ErrorNotification";
import { useNavigate } from "react-router-dom";  // Import useNavigate

interface Task {
    task_id: string;
    title: string;
    description: string;
    lock_date: number | null;
    start_date: number | null;
}

const TaskPreview: FunctionComponent = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { classData } = useClassContext();
    const { user } = useAuthStore();
    const navigate = useNavigate();  // Use navigate hook

    useEffect(() => {
        const fetchTasks = async () => {
            if (!classData.classroom_id) return;
            try {
                const response = await axios.post(
                    "http://localhost:5000/api/classroom/getTaskAssignedToClassroom",
                    { classroom_id: classData.classroom_id }
                );
                setTasks(response.data);
            } catch (err) {
                setError("Error fetching tasks");
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [classData.classroom_id]);

    const handleTaskClick = (taskId: string) => {
        navigate(`/tasks/${taskId}/taskDescriptionPage/${classData.classroom_id}`);
    };

    return (
        <div className={styles.taskPreviewContainer}>

            {error && (
                <ErrorNotification message={error} onClose={() => setError(null)} />
            )}

            <h3 className={styles.taskPreviewTitle}>Class Tasks</h3>

            {loading && <p>Loading tasks...</p>}
            {!loading && !error && tasks.length === 0 && <p>No tasks assigned yet.</p>}

            <div className={styles.taskPreviewContainer2}>
                <ul className={styles.taskList}>
                    {tasks.map((task) => (
                        <li key={task.task_id} className={styles.taskItem}>
                            <div className={styles.taskInfo}>
                                {/* Make the task title clickable */}
                                <span
                                    onClick={() => handleTaskClick(task.task_id)}
                                    className={styles.taskTitleLink}  // Applying the link-like style
                                >
                                    {task.title}
                                </span>
                            </div>
                            {user?.role === "teacher" && (
                                <div className={styles.teacherActions}>
                                    <div className={styles.lockSettings}>
                                        <p className={styles.lockInfo}>
                                            {task.lock_date
                                                ? `Ends in ${new Date(task.lock_date).toLocaleString()}.`
                                                : "No lock date set."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TaskPreview;
