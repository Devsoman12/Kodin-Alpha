import React, { useState } from "react";
import styles from "./EditOptions.module.css";

interface EditOptionsProps {
    messageString: string;
    index: number;
    onEdit: (index: number) => void;
    onDelete: (note: string) => void;
}

const EditOptions: React.FC<EditOptionsProps> = ({ messageString, index, onEdit, onDelete }) => {
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    return (
        <div className={styles.dropdown}>
            <button className={styles.moreButton} onClick={toggleDropdown}>
                ⋮
            </button>
            {dropdownVisible && (
                <div className={styles.dropdownMenu}>
                    <button onClick={() => onEdit(index)} className={styles.dropdownItem}>
                        Edit
                    </button>
                    <button onClick={() => onDelete(messageString)} className={styles.dropdownItem}>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default EditOptions;
