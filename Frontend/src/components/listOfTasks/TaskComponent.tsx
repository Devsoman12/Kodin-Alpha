import { FunctionComponent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './TaskComponent.module.css';
import { useAuthStore } from '../../context/AuthContext';

import GreenPolygonIcon from '../../assets/green_polygon_icon.svg';
import YellowPolygonIcon from '../../assets/yellow_polygon_icon.svg';
import RedPolygonIcon from '../../assets/red_polygon_icon.svg';
import UpvoteIcon from '../../assets/upvote_icon.svg';
import DownvoteIcon from '../../assets/downvote_icon.svg';

import EditIcon from '../../assets/edit_icon.svg';
import DeleteIcon from '../../assets/delete_icon.svg';
import VerifiedIcon from '../../assets/verified_icon.svg';

interface TaskProps {
    task_id: number;
    title: string;
    difficulty: string;
    author_nickname: string;
    available_languages: string[];
    likes: number;
    dislikes: number;
    is_verified: boolean;
}

const TaskComponent: FunctionComponent<TaskProps> = ({
    task_id,
    title,
    difficulty,
    author_nickname,
    available_languages,
    likes,
    dislikes,
    is_verified: initialIsVerified
}) => {
    const navigate = useNavigate();
    const [upvotes, setUpvotes] = useState<number>(likes);
    const [downvotes, setDownvotes] = useState<number>(dislikes);
    const [isVerified, setIsVerified] = useState<boolean>(initialIsVerified);
    const { user } = useAuthStore();
    const { classroom_id } = useParams<{ classroom_id: string }>();

    const handlePolygonClick = () => {
        navigate(`/tasks/${task_id}/taskDescriptionPage/${classroom_id}`);
    };

    const handleVote = async (type: 'like' | 'dislike') => {
        if (!user) return;

        try {
            const response = await axios.post('http://localhost:5000/api/taskHandler/likeOrDislikeTask', {
                task_id,
                type,
            });

            if (response.status === 200 || response.status === 201) {
                setUpvotes(response.data.likes);
                setDownvotes(response.data.dislikes);
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const handleVerifyTask = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/taskHandler/verifyTask', {
                task_id
            });

            if (response.status === 200) {
                setIsVerified(true); // Update UI to reflect verification
            }
        } catch (error) {
            console.error('Error verifying task:', error);
        }
    };

    const handleDeleteTask = async () => {
        if (!user || user.nick !== author_nickname) return;

        const confirmDelete = window.confirm("Naozaj chcete vymazať túto úlohu?");
        if (!confirmDelete) return;

        try {
            const response = await axios.post('http://localhost:5000/api/taskHandler/deleteTask', {
                task_id,
            });

            if (response.status === 200) {
                alert("Úloha bola úspešne vymazaná.");
                window.location.reload(); // Obnoví stránku, aby sa úloha odstránila zo zoznamu
            } else {
                alert("Nepodarilo sa vymazať úlohu.");
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert("Nastala chyba pri mazaní úlohy.");
        }
    };

    const getPolygonIcon = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy':
                return GreenPolygonIcon;
            case 'medium':
                return YellowPolygonIcon;
            case 'hard':
                return RedPolygonIcon;
            default:
                return GreenPolygonIcon;
        }
    };

    return (
        <div className={styles.task}>
            <div className={styles.taskIcon} onClick={handlePolygonClick}>
                <img className={styles.polygonIcon} alt="Task Icon" src={getPolygonIcon(difficulty)} />
            </div>
            <div className={styles.taskDetails}>
                <b className={styles.taskTitle}>{title}</b>
                <span className={styles.taskDifficulty}>Difficulty: {difficulty.toUpperCase()}</span>
                <span className={styles.taskAuthor}>Author: {author_nickname}</span>
                <span className={styles.taskLanguage}>Language: {available_languages.join(', ')}</span>
                {isVerified && <span className={styles.verifiedBadge}>✅ Verified</span>}
            </div>

            <div className={styles.actionsContainer}>
                {user && (
                    <div className={styles.voteSection}>
                        <button className={styles.voteButton} onClick={() => handleVote('like')}>
                            <img className={styles.voteIcon} alt="Upvote" src={UpvoteIcon} />
                        </button>
                        <span className={styles.voteCount}>{upvotes}</span>
                        <button className={styles.voteButton} onClick={() => handleVote('dislike')}>
                            <img className={styles.voteIcon} alt="Downvote" src={DownvoteIcon} />
                        </button>
                        <span className={styles.voteCount}>{downvotes}</span>
                    </div>
                )}

                { ((user && user.nick === author_nickname) ||
                (user && user.role === 'teacher' && !isVerified) ||
                (user && user.role === 'student' && !isVerified && user.verifier_flag)
                ) && (
                    <div className={styles.taskActions}>
                        <button className={styles.iconButton}
                                onClick={() => navigate(`/tasks/${task_id}/createTaskPage`)}>
                            <img className={styles.actionIcon} alt="Edit" src={EditIcon}/>
                        </button>
                        {/*<button className={styles.iconButton}>*/}
                        {/*    <img className={styles.actionIcon} alt="Delete" src={DeleteIcon}/>*/}
                        {/*</button>*/}
                        <button className={styles.iconButton} onClick={handleDeleteTask}>
                            <img className={styles.actionIcon} alt="Delete" src={DeleteIcon}/>
                        </button>
                    </div>
                )}

                { user && (
                    ((user.role === 'admin' || user.role === 'teacher') ||
                    (user.role === 'student' && user.verifier_flag)) && !isVerified
                ) && (
                    <button className={styles.iconButton} onClick={handleVerifyTask}>
                        <img className={styles.actionIcon} alt="Verify" src={VerifiedIcon}/>
                    </button>
                )}
            </div>
        </div>
    );
};

export default TaskComponent;
