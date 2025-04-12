import React, { useState } from "react";
import styles from "./TaskFilter.module.css";
import Dropdown from "../dropDown/Dropdown";
import SearchBar from "../searchbar/SearchBar";

import SettingsIcon from "../../assets/settings_icon.svg";
import RankIcon from "../../assets/rank.svg";
import ClockIcon from "../../assets/clock.svg";
import LanguageIcon from "../../assets/python_icon.svg";
import PlusIcon from "../../assets/plus.svg";
import ResetIcon from "../../assets/reset_arrows.svg";
import ClassIcon from "../../assets/c.svg";
import topIcon from "../../assets/top_icon.svg";
import ArrowDownIcon from "../../assets/arrow_down.svg";

interface TaskFiltersProps {
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedDifficulty: string | null;
    selectedProblemType: string | null;
    selectedPostedAt: string | null;
    selectedLanguage: string | null;

    selectedPopularity: string | null;
    selectedClass: string | null;

    onFilterChange: (filterType: string, value: string) => void;
    activeDropdown: string | null;
    onToggleDropdown: (dropdownName: string) => void;
    onAddTask: () => void;
    onResetFilters: () => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
                                                     searchQuery,
                                                     onSearchChange,
                                                     selectedDifficulty,
                                                     selectedProblemType,
                                                     selectedPostedAt,
                                                     selectedLanguage,
                                                     selectedPopularity,
                                                     selectedClass,
                                                     onFilterChange,
                                                     activeDropdown,
                                                     onToggleDropdown,
                                                     onAddTask,
                                                     onResetFilters,
                                                 }) => {
    const [filtersExpanded, setFiltersExpanded] = useState(true);
    const [checkboxesExpanded, setCheckboxesExpanded] = useState(true);
    const [bothExpanded, setBothExpanded] = useState(true);

    const handleToggleBoth = () => {
        setBothExpanded(!bothExpanded);
        setFiltersExpanded(!bothExpanded);
        setCheckboxesExpanded(!bothExpanded);
    };

    return (
        <div className={styles.filtersContainer}>
            <div className={styles.topSection}>
                <SearchBar value={searchQuery} onChange={onSearchChange} placeholder="Search tasks..."/>
                <img className={styles.plusIcon} alt="Add Task" src={PlusIcon} onClick={onAddTask}/>
            </div>

            <div className={`${styles.divider} ${!bothExpanded ? styles.hidden : ""}`}/>

            <div className={`${styles.sectionHeader} ${!bothExpanded ? styles.hidden : ""}`}
                 onClick={() => setFiltersExpanded(!filtersExpanded)}>
                Filters
                <img
                    src={ArrowDownIcon}
                    alt="Toggle Filters"
                    className={`${styles.arrowIcon} ${filtersExpanded ? styles.expanded : ""} ${!bothExpanded ? styles.hidden : ""}`}
                />
            </div>
            <div
                className={`${styles.filtersSection} ${!bothExpanded ? styles.hidden : ""} ${filtersExpanded ? "" : styles.collapsed}`}>
                <Dropdown
                    label="Difficulty"
                    options={["Easy", "Medium", "Hard"]}
                    selectedValue={selectedDifficulty || "Select Difficulty"}
                    onSelect={(value) => onFilterChange("difficulty", value)}
                    icon={SettingsIcon}
                    isOpen={activeDropdown === "difficulty"}
                    onToggle={() => onToggleDropdown("difficulty")}
                />
                <Dropdown
                    label="Problem Type"
                    options={["Algorithms", "Hashmap", "Structures", "Optimized"]}
                    selectedValue={selectedProblemType || "Select Problem Type"}
                    onSelect={(value) => onFilterChange("problemType", value)}
                    icon={RankIcon}
                    isOpen={activeDropdown === "problemType"}
                    onToggle={() => onToggleDropdown("problemType")}
                />
                <Dropdown
                    label="Posted At"
                    options={["Today", "This Week", "This Month", "This Half Year", "This Year"]}
                    selectedValue={selectedPostedAt || "Select Posted At"}
                    onSelect={(value) => onFilterChange("postedAt", value)}
                    icon={ClockIcon}
                    isOpen={activeDropdown === "postedAt"}
                    onToggle={() => onToggleDropdown("postedAt")}
                />
                <Dropdown
                    label="Programming Language"
                    options={["Java", "C", "Python"]}
                    selectedValue={selectedLanguage || "Select Language"}
                    onSelect={(value) => onFilterChange("language", value)}
                    icon={LanguageIcon}
                    isOpen={activeDropdown === "language"}
                    onToggle={() => onToggleDropdown("language")}
                />
                <Dropdown
                    label="Sort by Popularity"
                    options={["Most Upvoted", "Most Liked", "Most Recent"]}
                    selectedValue={selectedPopularity || "Select Sorting"}
                    onSelect={(value) => onFilterChange("popularity", value)}
                    icon={topIcon}
                    isOpen={activeDropdown === "popularity"}
                    onToggle={() => onToggleDropdown("popularity")}
                />
                <Dropdown
                    label="Class Tasks"
                    options={["Tasks from My Classes", "Tasks with Deadlines"]}
                    selectedValue={selectedClass || "Select Class Task"}
                    onSelect={(value) => onFilterChange("classTasks", value)}
                    icon={ClassIcon}
                    isOpen={activeDropdown === "classTasks"}
                    onToggle={() => onToggleDropdown("classTasks")}
                />
            </div>

            <div className={`${styles.divider} ${!bothExpanded ? styles.hidden : ""}`}/>

            <div className={`${styles.sectionHeader} ${!bothExpanded ? styles.hidden : ""}`}
                 onClick={() => setCheckboxesExpanded(!checkboxesExpanded)}>
                Task Status
                <img
                    src={ArrowDownIcon}
                    alt="Toggle Checkboxes"
                    className={`${styles.arrowIcon} ${checkboxesExpanded ? styles.expanded : ""} ${!bothExpanded ? styles.hidden : ""}`}
                />
            </div>
            <div
                className={`${styles.checkboxSection} ${!bothExpanded ? styles.hidden : ""} ${checkboxesExpanded ? "" : styles.collapsed}`}>
                <label>
                    <input
                        type="checkbox"
                        onChange={(e) => onFilterChange("upvoted", e.target.checked ? "true" : "false")}
                    /> Tasks I Upvoted
                </label>
                <label>
                    <input
                        type="checkbox"
                        onChange={(e) => onFilterChange("downvoted", e.target.checked ? "true" : "false")}
                    /> Tasks I Downvoted
                </label>
                <label>
                    <input
                        type="checkbox"
                        onChange={(e) => onFilterChange("finished", e.target.checked ? "true" : "false")}
                    /> Tasks I Finished
                </label>
                <label>
                    <input
                        type="checkbox"
                        onChange={(e) => onFilterChange("forbidden", e.target.checked ? "true" : "false")}
                    /> Tasks I Forbidden
                </label>
            </div>

            <div className={`${styles.divider} ${!bothExpanded ? styles.hidden : ""}`}/>

            <div className={`${!bothExpanded ? styles.hidden : ""} ${styles.resetSection}`}>
                <button className={styles.resetButton} onClick={onResetFilters}>
                    <img src={ResetIcon} alt="Reset" className={styles.resetIcon}/>
                    Reset Filters
                </button>
            </div>


            <div className={styles.toggleArrowContainer} onClick={handleToggleBoth}>
                {/*Collapse all*/}
                <img
                    src={ArrowDownIcon}
                    alt="Toggle All Sections"
                    className={`${styles.arrowIcon} ${bothExpanded ? styles.expanded : ""}`}
                />
            </div>

        </div>
    );
};

export default TaskFilters;
