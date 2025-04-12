import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import styles from './TaskWriterSidebar.module.css';
import LogoImage from '../../assets/sidebar_logo.svg';
import ToggleIcon from '../../assets/hamburger_icon.svg';
import { useTaskContext } from '../../context/TaskContext';

interface SidebarProps {
  onRun: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const TaskWriterSidebar: React.FC<SidebarProps> = ({ onRun, onSubmit, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { taskData } = useTaskContext();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleNavigate = () => {
    navigate('/');
  };

  return (
      <div className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''}`}>
        <img
            className={`${styles.toggleIcon} ${isExpanded ? '' : styles.centeredIcon}`}
            alt="Toggle CustomListsOfTasksSidebar"
            src={ToggleIcon}
            onClick={toggleSidebar}
        />
        <img
            className={`${styles.sidebarLogoIcon} ${isExpanded ? styles.animatedLogo : styles.hiddenLogo}`}
            alt="Logo"
            src={LogoImage}
            onClick={handleNavigate}
        />
        {isExpanded && (
            <div className={styles.expandedContent}>
              {/* Task Description Section */}
              <div className={styles.taskSection}>
                <div className={styles.taskDescription}>
                  <div className={styles.problem}>Problem Description</div>
                  <div className={styles.exampleStatement}>
                    <ReactMarkdown>{taskData.description}</ReactMarkdown>
                  </div>
                </div>
              </div>

              <div className={styles.buttonsSection}>
                <button
                    className={`${styles.authButton} ${styles.runButton}`}
                    disabled={isLoading}
                    onClick={onRun}
                >
                  {isLoading ? 'Running...' : 'Run'}
                </button>
                <button
                    className={`${styles.authButton} ${styles.submitButton}`}
                    disabled={isLoading}
                    onClick={onSubmit}
                >
                  {isLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
        )}
      </div>
  );
};

export default TaskWriterSidebar;