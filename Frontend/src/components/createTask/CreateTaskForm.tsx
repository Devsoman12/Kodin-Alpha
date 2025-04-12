import React, { FunctionComponent, useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import styles from './CreateTaskForm.module.css';
import Dropdown from '../dropDown/Dropdown';
import { useAuthStore } from '../../context/AuthContext';
import AddClassesOverlay from "../overlay/addClassesOverlay";
import axios from 'axios';
import AddClassesIcon from "../../assets/add_Class.svg";
import { useLocation, useParams } from 'react-router-dom';

interface Classroom {
  id: number;
  name: string;
}

const CreateTaskForm: FunctionComponent = () => {
  const { setTaskData, taskData } = useTaskContext();
  const { user } = useAuthStore();
  const { task_id } = useParams<{ task_id: string }>();
  const [isVersionTwo, setIsVersionTwo] = useState(false);
  const [author] = useState(user?.nick || '');
  const [title, setTaskName] = useState(taskData?.title || '');
  const [difficulty, setDifficulty] = useState(taskData?.difficulty || '');
  const languagesDict = taskData?.languages || {};
  const availableLanguages = Object.keys(languagesDict);
  const defaultLanguage = availableLanguages.length > 0 ? availableLanguages[0] : '';
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [problemType, setProblemType] = useState(taskData?.problem_type || '');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);  // Add this state
  const location = useLocation();

  const toggleVersion = () => setIsVersionTwo(!isVersionTwo);

  const handleDropdownToggle = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const handleSelect = (dropdownName: string, value: string) => {
    if (dropdownName === 'difficulty') setDifficulty(value);
    if (dropdownName === 'language') setSelectedLanguage(value);
    if (dropdownName === 'problemType') setProblemType(value);
    setActiveDropdown(null);
  };

  useEffect(() => {
      if (location.state?.classMode) {
        toggleVersion();
      }
  }, [location.state]);

  const handleSave = (
      selectedClasses: number[],
      selectedTimes: { start: Date | null; end: Date | null; startTime: string; endTime: string }
  ) => {
    const startTime = selectedTimes.startTime;
    const endTime = selectedTimes.endTime;

    const startDate = selectedTimes.start ? selectedTimes.start.toISOString().split('T')[0] : '';
    const endDate = selectedTimes.end ? selectedTimes.end.toISOString().split('T')[0] : '';

    const formattedStartTime = startTime || '';
    const formattedEndTime = endTime || '';

    setTaskData((prevTaskData) => ({
      ...prevTaskData,
      classrooms: selectedClasses,
      start_time: formattedStartTime,
      start_date: startDate,
      end_time: formattedEndTime,
      end_date: endDate,
    }));

    setSelectedClasses(selectedClasses);  // Save selected classes here

    setShowOverlay(false);
  };

  useEffect(() => {
    setTaskData((prevTaskData) => ({
      ...prevTaskData,
      author_nickname: author,
      title,
      difficulty_name: difficulty,
      programming_language: selectedLanguage,
      problem_type: problemType,
    }));
  }, [author, title, difficulty, selectedLanguage, problemType, setTaskData]);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/classroom/getAllClassrooms', { task_id });
        console.log(task_id);
        if (response.data.status === 'success') {
          setClassrooms(response.data.result.map((classroom: any) => ({
            id: classroom.id,
            name: classroom.name,
          })));
        } else {
          console.error('Failed to fetch classrooms:', response.data.message);
          setClassrooms([]);
        }
      } catch (error) {
        console.error('Error fetching classrooms:', error);
      }
    };

    fetchClassrooms();
  }, []);

  return (
      <div className={styles.taskFormContainer}>
        <div className={styles.toggleRow}>
          <div className={styles.leftIcons}>

            {isVersionTwo && (
                <>
                  <img
                      className={styles.addIcon}
                      alt="Add Class"
                      src={AddClassesIcon}
                      onClick={() => setShowOverlay(true)}
                  />

                </>
            )}
          </div>
          <div className={styles.rightToggle}>
            <div className={`${styles.toggleSwitch} ${isVersionTwo ? styles.active : ''}`} onClick={toggleVersion}>
              <div className={styles.toggleCircle}></div>
            </div>
            <div className={styles.tooltipWrapper}>
              <div className={styles.tooltipIcon}>?</div>
              <div className={styles.tooltipText}>
                Enabling this will allow you to add the task to specific classes.
              </div>
            </div>
          </div>
        </div>

        {showOverlay && (
            <AddClassesOverlay
                availableClasses={classrooms}
                preselectedClasses={selectedClasses}  // Pass selected classes to overlay
                onSave={handleSave}
                onClose={() => setShowOverlay(false)}
            />
        )}

        <input
            type="text"
            className={styles.inputField}
            value={author}
            readOnly
            placeholder="Author"
        />

        <input
            type="text"
            className={styles.inputField}
            value={title}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Task Name"
        />

        <div className={styles.dropdownContainer}>
          <Dropdown
              label="Difficulty"
              options={['Easy', 'Medium', 'Hard']}
              selectedValue={difficulty || 'Select Difficulty'}
              onSelect={(value) => handleSelect('difficulty', value)}
              isOpen={activeDropdown === 'difficulty'}
              onToggle={() => handleDropdownToggle('difficulty')}
          />
        </div>

        <div className={styles.dropdownContainer}>
          <Dropdown
              label="Programming Language"
              options={['Java', 'C', 'Python']}
              selectedValue={selectedLanguage || 'Select Language'}
              onSelect={(value) => handleSelect('language', value)}
              isOpen={activeDropdown === 'language'}
              onToggle={() => handleDropdownToggle('language')}
          />
        </div>

        <div className={styles.dropdownContainer}>
          <Dropdown
              label="Problem Type"
              options={['Algorithms', 'Hashmap', 'Structures', 'Optimized']}
              selectedValue={problemType || 'Select Problem Type'}
              onSelect={(value) => handleSelect('problemType', value)}
              isOpen={activeDropdown === 'problemType'}
              onToggle={() => handleDropdownToggle('problemType')}
          />
        </div>
      </div>
  );
};

export default CreateTaskForm;
