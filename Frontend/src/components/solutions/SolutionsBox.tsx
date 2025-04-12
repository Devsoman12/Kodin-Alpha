import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './SolutionsBox.module.css';
import MessageImage from '../../assets/message_icon.svg';
import HeartImage from '../../assets/heart_icon.svg';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import CommentOverlay from '../overlay/CommentOverlay';
import SolutionTests from '../dropDown/SolutionTests';
import Prism from 'prismjs';
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";

interface SolutionBoxProps {
  author: string;
  comments: number;
  likes: number;
  codeSnippet: string;
  solution_id: number;
  onClick: () => void;
  language: string;
  successfullTests: number;
  totalTests: number;
}

const SolutionBox: React.FC<SolutionBoxProps> = ({ author, comments, likes, codeSnippet, solution_id, 
                                                  language, successfullTests, totalTests }) => {
  const [localLikes, setLocalLikes] = useState(likes);
  const { task_id } = useParams<{ task_id: string }>();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [codeSnippet]);

  const handleLikeClick = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/solutionHandler/likeSolution', {
        solution_id,
        task_id,
      });

      if (response.data.status === 'true') {
        setLocalLikes(response.data.votes);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error('Error liking/unliking solution:', error);
    }
  };

  return (
      <>
        <div className={`${styles.solutionBox} ${isCollapsed ? styles.collapsed : ''}`}>
          <div className={styles.codeAuthor}>
            <div className={styles.authorLabel} onClick={() => setIsCollapsed(!isCollapsed)}>
              <div className={styles.rectangleParent}>
                <div className={styles.groupChild} />
                <div className={styles.author}>{author} ▼ </div>
              </div>
            </div>

            {!isCollapsed && (
                <div className={styles.mainBox}>
                  <pre className={`${styles.codeSnippet} language-${language}`}>
                <code className={`language-${language}`}>{codeSnippet}</code>
              </pre>

                  <div className={styles.actionPanel}>
                    <div className={styles.commentsAndLikes}>
                      <img className={styles.messageIcon} alt="Comments" src={MessageImage} onClick={() => setIsOverlayOpen(true)} />
                      <span>{comments}</span>

                      <img className={styles.heartIcon} alt="Likes" src={HeartImage} onClick={handleLikeClick} />
                      <span>{localLikes}</span>
                    </div>

                    <SolutionTests successfullTests={successfullTests} totalTests={totalTests} />
                  </div>
                </div>
            )}
          </div>
        </div>

        {isOverlayOpen &&
            ReactDOM.createPortal(
                <CommentOverlay solution_id={solution_id} onClose={() => setIsOverlayOpen(false)} />,
                document.body
            )}
      </>
  );
};

export default SolutionBox;
