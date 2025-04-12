import { FunctionComponent, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './ListOfTasks.module.css';

import TaskFilters from './TaskFilter';
import TaskComponent from './TaskComponent';
import { useAuthStore } from '../../context/AuthContext';

interface ProblemProps {
    task_id: number;
    title: string;
    difficulty: string;
    author_nickname: string;
    available_languages: string[];
    likes: number;
    dislikes: number;
    is_verified: boolean;
}

const ListOfTasks: FunctionComponent = () => {
    const [problems, setProblems] = useState<ProblemProps[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const { classroom_id } = useParams<{ classroom_id: string }>();
    const { list_id } = useParams<{ list_id: string }>();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
    const [selectedProblemType, setSelectedProblemType] = useState<string | null>(null);
    const [selectedPostedAt, setSelectedPostedAt] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [selectedPopularity, setPopularitySortiong] = useState<string | null>(null);
    const [selectedClassTask, setClassTaskSorting] = useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const [selectedFilters, setSelectedFilters] = useState<Record<string, boolean>>({
        upvoted: false,
        downvoted: false,
        finished: false,
        forbidden: false,
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedDifficulty(null);
        setSelectedProblemType(null);
        setSelectedPostedAt(null);
        setSelectedLanguage(null);
        setClassTaskSorting(null);
        setPopularitySortiong(null);
        setSelectedFilters({
            upvoted: false,
            downvoted: false,
            finished: false,
            forbidden: false,
        });
        setActiveDropdown(null);
    };

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.post('http://localhost:5000/api/taskHandler/getTasks', {
                    selectedDifficulty, 
                    selectedProblemType, 
                    selectedPostedAt, 
                    selectedLanguage, 
                    selectedClassTask, 
                    selectedPopularity, 
                    list_id, 
                    classroom_id,
                    selectedFilters,
                });

                if (response.data.status === 'true') {
                    setProblems(response.data.tasks);
                    setErrorMessage(null);
                } else {
                    setErrorMessage(response.data.message);
                }
            } catch (error) {
                setErrorMessage('Error fetching tasks. Please try again later.');
            }
        };
        fetchTasks();
    }, [
        selectedDifficulty, 
        selectedProblemType, 
        selectedPostedAt, 
        selectedLanguage, 
        selectedClassTask, 
        selectedPopularity, 
        selectedFilters,
        classroom_id,
        list_id
    ]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (filterType: string, value: string) => {
        const isBooleanString = value === "true" || value === "false";
    
        if (isBooleanString) {
            setSelectedFilters((prevFilters) => ({
                ...prevFilters,
                [filterType]: value === "true",
            }));
        } else {
            switch (filterType) {
                case 'difficulty':
                    setSelectedDifficulty(value);
                    break;
                case 'problemType':
                    setSelectedProblemType(value);
                    break;
                case 'postedAt':
                    setSelectedPostedAt(value);
                    break;
                case 'language':
                    setSelectedLanguage(value);
                    break;
                case 'popularity':
                    setPopularitySortiong(value);
                    break;
                case 'classTasks':
                    setClassTaskSorting(value);
                    break;
                default:
                    break;
            }
        }
    };    

    const handleDropdownToggle = (dropdownName: string) => {
        setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
    };

    return (
        <div className={styles.listOfTasks}>
            {errorMessage && (
                <div className={styles.errorModal}>
                    <div className={styles.errorModalContent}>
                        <h2>Error</h2>
                        <p>{errorMessage}</p>
                        <button onClick={() => setErrorMessage(null)}>Close</button>
                    </div>
                </div>
            )}
    
            <div className={styles.filtersLayer}>
                <TaskFilters
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    selectedDifficulty={selectedDifficulty}
                    selectedProblemType={selectedProblemType}
                    selectedPostedAt={selectedPostedAt}
                    selectedLanguage={selectedLanguage}
                    selectedPopularity={selectedPopularity}
                    selectedClass={selectedClassTask}
                    onFilterChange={handleFilterChange}
                    activeDropdown={activeDropdown}
                    onToggleDropdown={handleDropdownToggle}
                    onAddTask={() => navigate(`/tasks/${0}/createTaskPage`)}
                    onResetFilters={handleResetFilters}
                />
            </div>
    
            <div className={styles.tasks}>
                <div className={styles.tasks2}>
                    {problems
                        .filter((problem) => {
                            const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
                            const isPrivilegedUser =
                                user?.role === 'admin' || user?.role === 'teacher' || user?.nick === problem.author_nickname || (user?.verifier_flag);
                            return matchesSearch && (problem.is_verified || isPrivilegedUser);
                        })
                        .map((problem) => (
                            <TaskComponent
                                key={problem.task_id}
                                task_id={problem.task_id}
                                title={
                                    !problem.is_verified &&
                                    (user?.role === 'admin' || user?.role === 'teacher' || user?.nick === problem.author_nickname || (user?.verifier_flag))
                                        ? `${problem.title} (Unverified)`
                                        : problem.title
                                }
                                difficulty={problem.difficulty}
                                author_nickname={problem.author_nickname}
                                available_languages={problem.available_languages}
                                likes={problem.likes}
                                dislikes={problem.dislikes}
                                is_verified={problem.is_verified}
                            />
                        ))}
                </div>
            </div>
        </div>
    );    
};

export default ListOfTasks;
