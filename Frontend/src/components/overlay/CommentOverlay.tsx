import React, { useState, useEffect, use } from 'react';
import styles from './CommentOverlay.module.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../context/AuthContext';

interface Comment {
    id: number;
    author: string;
    text: string;
    upvotes: number;
    downvotes: number;
    replies: Comment[];
    collapsed?: boolean;
}

interface CommentOverlayProps {
    solution_id: number;
    onClose: () => void;
}

const CommentOverlay: React.FC<CommentOverlayProps> = ({ solution_id, onClose }) => {
    const { task_id } = useParams<{ task_id: string }>();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [dimensions, setDimensions] = useState({ width: 400, height: 500 });
    const {user} = useAuthStore();

    const fetchComments = async () => {
        try {
            const response = await axios.post(
                `http://localhost:5000/api/solutionHandler/getAllComments`, 
                { solution_id }
            );
            setComments(response.data.comments);

        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };
    
    useEffect(() => {

        fetchComments();
    }, [solution_id]);
    
    const handleAddComment = async () => {
        if (!newComment.trim()) return;
    
        const commentData = {
            solution_id,
            task_id,
            comment_text: newComment,
            parent_id: null,
        };
    
        try {
            await axios.post('http://localhost:5000/api/solutionHandler/createComment', commentData);
            fetchComments();
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };    

    const handleAddReply = async (parentId: number, replyText: string) => {
        if (!replyText.trim()) return;
    
        const commentData = {
            author: user?.nick,
            solution_id,
            task_id,
            comment_text: replyText,
            parent_id: parentId,
        };
    
        try {
            await axios.post('http://localhost:5000/api/solutionHandler/createComment', commentData);
            fetchComments();
        } catch (error) {
            console.error('Error adding reply:', error);
        }
    };    

    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editedText, setEditedText] = useState('');

    const handleEditComment = (commentId: number, text: string) => {
        setEditingCommentId(commentId);
        setEditedText(text);
    };

    const handleSaveComment = async () => {
        const updatedComment = {
            comment_id: editingCommentId,
            comment_text: editedText,
        };
    
        try {
            const response = await axios.post(
                'http://localhost:5000/api/solutionHandler/editComment', 
                updatedComment
            );
    
            if (response.status === 200) {
                fetchComments();
                setEditingCommentId(null);
            } else {
                console.error('Error updating comment in DB', response.data);
            }
        } catch (error) {
            console.error('Error saving comment:', error);
        }
    };    

    const handleDeleteComment = async (commentId: number) => {
      try {
        const response = await axios.post('http://localhost:5000/api/solutionHandler/deleteComment', { comment_id: commentId });
    
        if (response.status === 200) {
          fetchComments();
        } else {
          console.error('Error deleting comment from DB', response.data);
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    };    

    const renderActionsMenu = (comment: Comment) => {
        return (
            comment.author === user?.nick && (
                <div className={styles.actionsMenu}>
                    <button onClick={() => handleEditComment(comment.id, comment.text)}>Edit</button>
                    <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                </div>
            )
        );
    };

    const handleResize = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const startWidth = dimensions.width;
        const startHeight = dimensions.height;
        const startX = event.clientX;
        const startY = event.clientY;

        const onMouseMove = (e: MouseEvent) => {
            const newWidth = startWidth + (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);

            setDimensions({
                width: Math.max(newWidth, 300),
                height: Math.max(newHeight, 300),
            });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleVote = async (commentId: number, type: 'like' | 'dislike') => {
        try {
            const response = await axios.post('http://localhost:5000/api/solutionHandler/likeOrDislikeComment', {
                comment_id: commentId,
                flag: type,
            });
    
            if (response.status === 200) {
                const updatedVotes = response.data.comment;
    
                const updateVotes = (comments: Comment[]): Comment[] => {
                    return comments.map((comment) => {
                        if (comment.id === commentId) {
                            return {
                                ...comment,
                                upvotes: updatedVotes.upvotes,
                                downvotes: updatedVotes.downvotes,
                            };
                        }
                        return { ...comment, replies: updateVotes(comment.replies) };
                    });
                };
    
                setComments((prev) => updateVotes(prev));
            } else {
                console.error('Error updating vote in DB', response.data);
            }
        } catch (error) {
            console.error('Error voting on comment:', error);
        }
    };    

    const toggleCollapse = (commentId: number) => {
        const updateCollapseState = (comments: Comment[]): Comment[] => {
            return comments.map((comment) => {
                if (comment.id === commentId) {
                    return { ...comment, collapsed: !comment.collapsed };
                }
                return { ...comment, replies: updateCollapseState(comment.replies) };
            });
        };

        setComments((prev) => updateCollapseState(prev));
    };

    const renderComments = (comments: Comment[]) => {
        return comments.map((comment) => (
            <div key={comment.id} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                    <button
                        className={styles.collapseButton}
                        onClick={() => toggleCollapse(comment.id)}
                    >
                        {comment.collapsed ? '➕' : '➖'}
                    </button>
                    <span className={styles.author}>{comment.author}</span>
                    {renderActionsMenu(comment)}
                </div>
                {editingCommentId === comment.id ? (
                    <div className={styles.editInput}>
                        <input
                            type="text"
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className={styles.editTextField}
                        />
                        <button onClick={handleSaveComment} className={styles.saveButton}>
                            Save
                        </button>
                    </div>
                ) : (
                    <div className={styles.commentText}>{comment.text}</div>
                )}
                <div className={styles.votes}>
                    <button
                        className={styles.voteButton}
                        onClick={() => handleVote(comment.id, 'like')}
                    >
                        👍 {comment.upvotes}
                    </button>
                    <button
                        className={styles.voteButton}
                        onClick={() => handleVote(comment.id, 'dislike')}
                    >
                        👎 {comment.downvotes}
                    </button>
                </div>
                <ReplyInput parentId={comment.id} onReply={handleAddReply} />
                
                {!comment.collapsed && comment.replies.length > 0 && (
                    <div className={styles.replyList}>{renderComments(comment.replies)}</div>
                )}
            </div>
        ));
    };
    
    
    return (
        <div className={styles.overlay}>
            <div
                className={styles.overlayContent}
                style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
            >
                <button className={styles.closeButton} onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                         className="bi bi-x" viewBox="0 0 16 16">
                        <path
                            d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </button>

                <h2 className={styles.title}>Comments</h2>
                <div className={styles.commentList}>{renderComments(comments)}</div>
                <div className={styles.commentInputRow}>
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className={styles.commentTextField}
                    />
                    <button
                        onClick={handleAddComment}
                        className={styles.commentButton}
                    >
                        Post
                    </button>
                </div>
                <div className={styles.resizeHandle} onMouseDown={handleResize}></div>
            </div>
        </div>
    );
};

const ReplyInput: React.FC<{
    parentId: number;
    onReply: (parentId: number, replyText: string) => void;
}> = ({ parentId, onReply }) => {
    const [replyText, setReplyText] = useState('');

    const handleReply = () => {
        if (!replyText.trim()) return;
        onReply(parentId, replyText);
        setReplyText('');
    };

    return (
        <div className={styles.replyInput}>
            <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply to this comment..."
                className={styles.replyTextField}
            />
            <button onClick={handleReply} className={styles.replyButton}>
                Reply
            </button>
        </div>
    );
};

export default CommentOverlay;
