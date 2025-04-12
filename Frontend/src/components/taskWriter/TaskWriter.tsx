import { FunctionComponent, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './TaskWriter.module.css';
import Sidebar from '../bars/TaskWriterSidebar';
import CodeEditor from '../textEditors/CodeEditor';
import axios from 'axios';
import { useTaskContext } from '../../context/TaskContext';
import { useAuthStore } from '../../context/AuthContext';
import Dropdown from '../dropDown/Dropdown';

const TaskWriter: FunctionComponent = () => {
  const { task_id } = useParams<{ task_id: string }>();
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { user } = useAuthStore();
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const {
    taskData,
    setTaskData,
    getOneTask,
    terminalOutput,
    isLoading,
    setTerminalOutput,
    runTaskCode,
    submitSolution,
    status,
  } = useTaskContext();
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    console.log(taskData);

    // Check if lockDate is available
    if (taskData.lockDate) {
      const deadlineDate = new Date(taskData.lockDate);  // Directly use lockDate as the deadline

      const interval = setInterval(() => {
        const now = new Date();
        const timeLeft = deadlineDate.getTime() - now.getTime();

        if (timeLeft <= 0) {
          clearInterval(interval);
          setCountdown('Time is up!');
        } else {
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));  // Calculate days
          const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);  // Calculate hours
          const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);  // Calculate minutes
          const seconds = Math.floor((timeLeft / 1000) % 60);  // Calculate seconds

          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);  // Update countdown with days
        }
      }, 1000);

      return () => clearInterval(interval); // Cleanup interval on component unmount or taskData changes
    } else {
      setCountdown('No deadline set');
    }
  }, [taskData.lockDate]);  // React to changes in lockDate only

  useEffect(() => {
    const fetchInitialCode = async (selectedLanguage: string = '') => {
      try {
        await getOneTask(task_id!);
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };
    fetchInitialCode(language);
  }, [task_id]);

  useEffect(() => {
    if (taskData.task_id) {
      const languages = Object.keys(taskData.languages || {});
      setAvailableLanguages(languages);
      setCode(taskData.languages[language]?.initial_code || '');
    }
  }, [taskData, language]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    setIsDropdownOpen(false);
  };

  const runCode = async () => {
    runTaskCode(code, language, task_id!);
  };

  const handleSubmit = async () => {
    if (!user) {
      setTerminalOutput("If you want to submit a solution, you need to log in.");
      return;
    }

    try {
      const isSubmitted = await submitSolution(code, language, task_id!, classroom_id!);

      if (isSubmitted) {
        navigate(`/tasks/${task_id}/solutionsPage/${classroom_id}`);
      } else {
        setErrorMessage("There was an issue submitting the solution. Please try again.");
        setTerminalOutput("There was an issue submitting the solution. Please try again.");
      }
    } catch (error) {
      console.error('Error during submission:', error);
      setErrorMessage("An unexpected error occurred while submitting your solution.");
      setTerminalOutput("An unexpected error occurred while submitting your solution.");
    }
  };

  return (
    <div className={styles.taskwriter}>
      <Sidebar onRun={runCode} onSubmit={handleSubmit} isLoading={isLoading} />

      <div className={styles.codeAndTerminal}>
        {isLoading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner}></div>
            </div>
        )}
        <div className={styles.languageSelectorContainer}>
          <Dropdown
              label="Select Language"
              options={availableLanguages}
              selectedValue={language}
              onSelect={handleLanguageChange}
              isOpen={isDropdownOpen}
              onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
          />
        </div>

        <div className={styles.countdownContainer}>
          <p className={styles.countdown}>{countdown}</p>
        </div>

        <div className={styles.codeeditor2}>
          <div className={styles.editorWrapper}>
            <CodeEditor value={code} onChange={handleCodeChange}/>
          </div>
        </div>

        <div className={styles.terminal}>
          <div className={styles.terminalContent}>
            <pre className={styles.text}>{terminalOutput || '[Awaiting Input from User...]'}</pre>
          </div>
        </div>

        {errorMessage && (
            <div className={styles.errorMessage}>
              <p>{errorMessage}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default TaskWriter;
