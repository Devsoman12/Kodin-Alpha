import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import styles from './TaskDescription.module.css';
import heartImage from '../../assets/heart.svg';
import AddActorImage from '../../assets/add_Class.svg';
import bugReport from '../../assets/bugReport.svg'
import { useAuthStore } from '../../context/AuthContext';
import AddClassesOverlay from '../overlay/addClassesOverlay';
import BugReportOverlay from "../overlay/bugReportOverlay";

const TaskDescription: FunctionComponent = () => {
    const { task_id } = useParams<{ task_id: string }>();
    const { classroom_id } = useParams<{ classroom_id: string }>();
    const [taskData, setTaskData] = useState<any>(null);
    const [liked, setLiked] = useState<boolean>(false);
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [showOverlay, setShowOverlay] = useState(false);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [userTasks, setUserTasks] = useState<any[]>([]);

    const [showBugReportOverlay, setShowBugReportOverlay] = useState(false);

    const handleBugReportSubmit = async (reportText: string) => {
        if (!user) return;
        try {
            console.log(task_id, reportText, user.userID, taskData.author_nickname);
            const response = await axios.post(
                'http://localhost:5000/api/taskHandler/pushTaskBugReport',
                { task_id, report_message: reportText, user_id: user.userID, author_nickname: taskData.author_nickname }
            );
            if (response.data.status === 'true') {
                alert('Bug report submitted successfully!');
            } else {
                alert('Failed to submit bug report');
            }
        } catch (error) {
            alert('Failed to submit bug report' + error);
        }
        setShowBugReportOverlay(false);
    };


    const fetchClassrooms = useCallback( async () => {
        try {
            if(user){
                const response = await axios.post('http://localhost:5000/api/classroom/getAllClassrooms', { task_id });
                if (response.data.status === 'success') {
                    setAvailableClasses(response.data.result.map((classroom: any) => ({
                        id: classroom.id,
                        name: classroom.name,
                    })));
                } else {
                    setAvailableClasses([]);
                }
            }
        } catch (error) {
            console.error('Error fetching classrooms:', error);
        }
    }, [task_id, user]);

    const fetchTaskData = useCallback(async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/taskHandler/getOneTask', { task_id });
            if (response.data && response.data.task) {
                setTaskData(response.data.task);
            } else {
                console.error("No task data returned");
            }
        } catch (error) {
            console.error('Error fetching task data:', error);
        }
    }, [task_id]);

    const fetchUserTasks = useCallback(async (authorId: number) => {
            try {
                const response = await axios.post(
                    'http://localhost:5000/api/taskHandler/getTasksByUser',
                    { user_id: authorId }
                );
                if (response.data.status === 'true' && response.data.tasks && response.data.tasks.length > 0) {
                    setUserTasks(response.data.tasks);
                } else {
                    console.log("No tasks found for the user.");
                    setUserTasks([]);
                }
            } catch (error) {
                console.error('Error fetching user tasks:', error);
            }
    }, []);

    useEffect(() => {
        if (task_id) {
            fetchTaskData();
        }
    }, [task_id, fetchTaskData]);

    useEffect(() => {
        if (taskData && taskData.author_id) {
            fetchUserTasks(taskData.author_id);
        }
    }, [taskData, fetchUserTasks]);

    useEffect(() => {
        fetchClassrooms();
    }, [fetchClassrooms]);

    // Handle the like button toggle
    const handleHeartClick = async () => {
        if (!user) return;
        try {
            const response = await axios.post(
                'http://localhost:5000/api/taskHandler/addTaskToLikedTasks',
                { task_id }
            );
            if (response.data.status === 'success') {
                setLiked(prev => !prev);
                alert('Task liked successfully!');
            } else {
                alert('Error liking task');
            }
        } catch (error) {
            alert('Error liking task' + error);
        }
    };

    // Handle saving task to class
    const handleSave = async (selectedClasses: number[], selectedTimes: { start: Date | null; end: Date | null; startTime: string; endTime: string }) => {
        const { start, end, startTime, endTime } = selectedTimes;
        const start_date = start ? start.toISOString().split('T')[0] : null;
        const start_hour = startTime || null;
        const lock_date = end ? end.toISOString().split('T')[0] : null;
        const lock_hour = endTime || null;

        try {
            const response = await axios.post(
                'http://localhost:5000/api/classroom/addTaskToClass',
                { task_id, classrooms: selectedClasses, start_date, start_hour, lock_date, lock_hour }
            );
            console.log(response.data.status);
            if (response.data.status === 'success') {
                fetchClassrooms(); // Reload classrooms
                alert('Task added to selected classes successfully');
            } else {
                alert('Error adding task to selected classes');
            }
        } catch (error) {
            alert('Error adding task to selected classes' + error);
        }
        setShowOverlay(false);
        fetchClassrooms();
    };

    const onTrainClick = useCallback(() => {
        navigate(`/tasks/${task_id}/codeEditorPage/${classroom_id}`);
    }, [navigate, task_id, classroom_id]);

    const onForbidClick = useCallback(() => {
        navigate(`/tasks/${task_id}/solutionsPage/${classroom_id}`);
    }, [navigate, task_id, classroom_id]);

    // Loading state
    if (!taskData) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.taskContainer}>
            {/* Task Description */}
            <div className={styles.taskdescription}>
                <div className={styles.authorInfo}>
                    <div className={styles.authorTemplate}>
                        <div className={styles.authorAvatar}>
                            <div className={styles.avatarPlaceholder}>A</div>
                        </div>
                        <div className={styles.authorDetails}>
                            <div className={styles.authorName}>
                                <b>{taskData.author_nickname || 'Unknown Author'}</b>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.problemDetails}>
                    <b className={styles.problemTitle}>Problem</b>
                    <div className={styles.problemDescription}>
                        <ReactMarkdown>{taskData.description || 'No problem description available.'}</ReactMarkdown>
                    </div>
                </div>

                <div className={styles.actionButtons}>

                    {user && (
                        <img
                            className={styles.icon}
                            alt="Like"
                            src={heartImage}
                            onClick={handleHeartClick}
                            style={{cursor: 'pointer', filter: liked ? 'grayscale(0)' : 'grayscale(100%)'}}
                            data-tooltip="Like this task"
                        />
                    )}

                    <img
                        className={styles.icon}
                        alt="Add to Class"
                        src={AddActorImage}
                        onClick={() => setShowOverlay(true)}
                        style={{cursor: 'pointer'}}
                        data-tooltip="Add task to a class"
                    />

                    <img
                        className={styles.icon}
                        alt="Report Bug"
                        src={bugReport}
                        onClick={() => setShowBugReportOverlay(true)}
                        style={{ cursor: 'pointer' }}
                        data-tooltip="Report a bug"
                    />


                    <button className={styles.trainButton} onClick={onTrainClick}>
                        TRAIN
                    </button>
                    <button className={styles.forbidButton} onClick={onForbidClick}>
                        View Solutions
                    </button>
                </div>

                {showOverlay && (
                    <AddClassesOverlay
                        availableClasses={availableClasses}
                        preselectedClasses={[0]}  // Pass selected classes to overlay
                        onSave={handleSave}
                        onClose={() => setShowOverlay(false)}
                    />
                )}

                {/*{showBugReportOverlay && (*/}
                {/*    <div className={styles.bugReportOverlay}>*/}
                {/*        <div className={styles.bugReportContent}>*/}
                {/*            <h3>Report a Bug</h3>*/}
                {/*            <textarea*/}
                {/*                placeholder="Describe the bug here..."*/}
                {/*                rows={5}*/}
                {/*                className={styles.bugReportTextarea}*/}
                {/*            ></textarea>*/}
                {/*            <div className={styles.bugReportActions}>*/}
                {/*                <button onClick={() => setShowBugReportOverlay(false)}>Cancel</button>*/}
                {/*                <button onClick={() => handleBugReportSubmit(document.querySelector('textarea')?.value || '')}>*/}
                {/*                    Submit Report*/}
                {/*                </button>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*)}*/}

                {showBugReportOverlay && (
                    <BugReportOverlay
                        onSubmit={handleBugReportSubmit}
                        onClose={() => setShowBugReportOverlay(false)}
                    />
                )}


            </div>

            {/* Sidebar with other tasks by the same author */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h3>Other Tasks by {taskData.author_nickname}</h3>
                </div>
                <div className={styles.sidebarContent}>
                    <ul>
                        {userTasks.map((task) => (
                            <li key={task.task_id}>
                                <button onClick={() => navigate(`/tasks/${task.task_id}/taskDescriptionPage/${0}`)}>
                                    {task.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
};

export default TaskDescription;
