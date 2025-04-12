import React from "react";
import styles from "../searchbar/SearchBar.module.css";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const StudentSearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={styles.searchBar}>
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder || "Search..."}
                className={styles.input}
            />
        </div>
    );
};

export default StudentSearchBar;
