import { FunctionComponent, useState, useEffect } from 'react';
import styles from './CreateTaskTabs.module.css';
import TextEditor from '../textEditors/TextEditor';
import CodeEditor from '../textEditors/CodeEditor';
import { useTaskContext } from '../../context/TaskContext';

const CreateTaskTabs: FunctionComponent = () => {
  const { taskData, setTaskData } = useTaskContext();  
  const [language, setLanguage] = useState<string>(taskData.programming_language || '');  

  const [currentLangData, setCurrentData] = useState(taskData.languages?.[language] || {
    initial_code: '',
    solution_code: '',
    unit_test_code: ''
  });

  const [activeTab, setActiveTab] = useState<string>('task');

  const [taskContent, setTaskContent] = useState(taskData.description);
  const [initialCodeContent, setInitialCodeContent] = useState(currentLangData.initial_code);
  const [solutionContent, setSolutionContent] = useState(currentLangData.solution_code);
  const [testsContent, setTestsContent] = useState(currentLangData.unit_test_code);

  const getBackgroundColor = () => {
    switch (activeTab) {
      case 'task': return styles.taskBackground;  
      case 'initialCode': return styles.initialCodeBackground;  
      case 'solution': return styles.solutionBackground;  
      case 'tests': return styles.testsBackground;  
      default: return '';
    }
  };

  const renderEditor = () => {
    if (activeTab === 'task') {
      return <TextEditor key="taskEditor" value={taskContent} onChange={setTaskContent} />;
    } else if (activeTab === 'initialCode') {
      return <CodeEditor key="initialCodeEditor" value={initialCodeContent} onChange={setInitialCodeContent} />;
    } else if (activeTab === 'tests' || activeTab === 'solution') {
      return <CodeEditor
        key={activeTab === 'tests' ? 'testsEditor' : 'solutionEditor'}
        value={activeTab === 'tests' ? testsContent : solutionContent}
        onChange={activeTab === 'tests' ? setTestsContent : setSolutionContent}
      />;
    }
  };  

  useEffect(() => {
    setTaskData((prevTaskData: any) => {
      if (!language.trim()) return prevTaskData;

      return {
        ...prevTaskData,
        description: taskContent,
        programming_language: language,
        languages: {
          ...(prevTaskData.languages || {}),
          [language]: {
            initial_code: initialCodeContent.trim(),
            solution_code: solutionContent.trim(),
            unit_test_code: testsContent.trim(),
          }
        }
      };
    });
  }, [taskContent, initialCodeContent, solutionContent, testsContent, language, setTaskData]);
  
  useEffect(() => {
    if (taskData.programming_language) {
      setLanguage(taskData.programming_language);
    }
  }, [taskData]);  

  useEffect(() => {
    if (!language.trim()) return;

    setCurrentData(taskData.languages?.[language] || {
      initial_code: '',
      solution_code: '',
      unit_test_code: ''
    });

    setInitialCodeContent(taskData.languages?.[language]?.initial_code || '');
    setSolutionContent(taskData.languages?.[language]?.solution_code || '');
    setTestsContent(taskData.languages?.[language]?.unit_test_code || '');
  }, [language]);

  return (
    <div className={`${styles.tabsTask} ${getBackgroundColor()}`}>
      <div className={styles.tabs}>
        <div
          className={`${styles.tabButton} ${activeTab === 'task' ? styles.activeTabYellow : styles.inactiveTabYellow}`}
          onClick={() => setActiveTab('task')}
        >
          <b className={styles.tabText}>Task</b>
        </div>
        <div
          className={`${styles.tabButton} ${activeTab === 'initialCode' ? styles.activeTabRed : styles.inactiveTabRed}`}
          onClick={() => setActiveTab('initialCode')}
        >
          <b className={styles.tabText}>Initial Code</b>
        </div>
        <div
          className={`${styles.tabButton} ${activeTab === 'solution' ? styles.activeTabGreen : styles.inactiveTabGreen}`}
          onClick={() => setActiveTab('solution')}
        >
          <b className={styles.tabText}>Solution</b>
        </div>
        <div
          className={`${styles.tabButton} ${activeTab === 'tests' ? styles.activeTabBlue : styles.inactiveTabBlue}`}
          onClick={() => setActiveTab('tests')}
        >
          <b className={styles.tabText}>Tests</b>
        </div>
      </div>

      <div className={styles.editorContainer}>
        {renderEditor()}
      </div>
    </div>
  );
};

export default CreateTaskTabs;
