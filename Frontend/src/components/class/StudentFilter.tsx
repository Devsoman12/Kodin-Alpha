import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './StudentFilter.module.css';
import SearchBar from '../searchbar/SearchBar';
import { useParams } from 'react-router-dom';
import { useClassContext } from '../../context/ClassroomContext';
import Dropdown from '../dropDown/Dropdown';
import ConfirmAddingStudents from '../overlay/confirmAddingStudents';

interface User {
    email: string;
    nick: string;
    user_id: number;
    honor: number;
    mostUsedLanguage: string;
    role: string;
    problems_completed: number;
    comments_count: number;
    isverified: boolean;
}

interface FilterComponentProps {
    onFilterChange: (filters: string[]) => void;
}

const StudentFilter: React.FC<FilterComponentProps> = ({ onFilterChange }) => {
    const { classroom_id } = useParams<{ classroom_id: string }>();
    const [searchValue, setSearchValue] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<string>('nick');
    const [results, setResults] = useState<User[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [lastChecked, setLastChecked] = useState<number | null>(null);
    const { getOneClass } = useClassContext();

    useEffect(() => {
        const fetchStudents = async () => {

            try {

                console.log("classid: ",classroom_id);

                const response = await axios.get('http://localhost:5000/api/classroom/getAllStudents', {
                    params: { class_id: classroom_id },
                });

                console.log(response.data.data);

                if (Array.isArray(response.data.students)) {
                    setStudents(response.data.students);
                } else {
                    console.error('Expected an array but got:', response.data.students);
                }

            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };
        fetchStudents();
    }, [classroom_id]);


    const handleDropdownSelect = (value: string) => {
        setSelectedFilter(value);
        setIsDropdownOpen(false);
    };

    const handleSearchChange = (value: string) => {
        setSearchValue(value);

        if (value.trim() === '') {
            setResults([]);
            return;
        }

        const filteredResults = students.filter((user) => {
            const userValue = user[selectedFilter as keyof User];
            return userValue?.toString().toLowerCase().includes(value.toLowerCase());
        });

        setResults(filteredResults);
    };


    const confirmAddStudents = async () => {
        try {
            await Promise.all(
                selectedUsers.map((user_id) => axios.post('http://localhost:5000/api/classroom/addStudentToClassroom', {
                    classroom_id: classroom_id,
                    user_id: user_id,
                }))
            );


            const updatedResponse = await axios.get('http://localhost:5000/api/classroom/getAllStudents', {
                params: { classroom_id: classroom_id },
            });

            console.log(updatedResponse);

            setStudents(updatedResponse.data.students);
            setSelectedUsers([]);
            setResults([]);
            if (classroom_id) {
                getOneClass(classroom_id);
            }
            setIsOverlayOpen(false);
        } catch (error) {
            console.error('Error adding students:', error);
        }
    };

    const toggleUserSelection = (user_id: number, event?: React.MouseEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => {
        if (event && 'shiftKey' in event && event.shiftKey && lastChecked !== null) {
            const start = students.findIndex(user => user.user_id === lastChecked);
            const end = students.findIndex(user => user.user_id === user_id);
            const range = students.slice(Math.min(start, end), Math.max(start, end) + 1);

            setSelectedUsers(prevSelectedUsers => {
                const newSelectedUsers = [...prevSelectedUsers];
                range.forEach(user => {
                    if (!newSelectedUsers.includes(user.user_id)) {
                        newSelectedUsers.push(user.user_id);
                    }
                });
                return newSelectedUsers;
            });
        } else {
            setSelectedUsers(prevSelectedUsers =>
                prevSelectedUsers.includes(user_id)
                    ? prevSelectedUsers.filter(id => id !== user_id)
                    : [...prevSelectedUsers, user_id]
            );
        }
        setLastChecked(user_id);
    };

    return (
        <div className={styles.filterComponent}>
            <div className={styles.topRow}>
                <button className={styles.addButton} onClick={() => setIsOverlayOpen(true)}>
                    Add Students
                </button>

                <Dropdown
                    label="Select Filter"
                    options={['email', 'nick', 'honor', 'role', 'mostUsedLanguage']}
                    selectedValue={selectedFilter}
                    onSelect={handleDropdownSelect}
                    isOpen={isDropdownOpen}
                    onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
                />
            </div>

            <div className={styles.searchBarRow}>
                <SearchBar
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Type to search"
                />
            </div>


            {results.length > 0 && (
                <ul className={styles.searchDropdown}>
                    {results.map((result) => (
                        <li
                            key={result.user_id}
                            className={styles.resultItem}
                            onClick={() => toggleUserSelection(result.user_id)} // Toggle checkbox when the whole item is clicked
                        >
                            <input
                                type="checkbox"
                                checked={selectedUsers.includes(result.user_id)}
                                onChange={(e) => e.stopPropagation()} // Prevent the checkbox from triggering the click event
                            />
                            {result[selectedFilter as keyof User]} {/* Student's name or filtered field */}
                        </li>
                    ))}
                </ul>
            )}

            {isOverlayOpen && (
                <ConfirmAddingStudents
                    message="Are you sure you want to add these students to the class?"
                    onConfirm={confirmAddStudents}
                    onCancel={() => setIsOverlayOpen(false)}
                    confirmButtonText="Yes, Add Students"
                    cancelButtonText="Cancel"
                />
            )}
        </div>

    );
};

export default StudentFilter;
