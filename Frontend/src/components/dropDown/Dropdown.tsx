import React, { useRef, useEffect } from 'react';
import styles from './Dropdown.module.css';

interface DropdownProps {
    label: string;
    options: string[];
    selectedValue: string;
    onSelect: (value: string) => void;
    icon?: string;
    isOpen: boolean;
    onToggle: () => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, selectedValue, onSelect, icon, isOpen, onToggle }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onToggle(); // Close dropdown
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onToggle]);

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <div className={styles.dropdownHeader} onClick={onToggle}>
                {icon && <img className={styles.icon} alt="Dropdown Icon" src={icon} />}
                <span className={styles.selectedText}>{selectedValue || label}</span>
            </div>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <div
                        className={styles.resetItem}
                        onClick={() => onSelect("")}
                    >
                        Reset Selection
                    </div>

                    {options.map((option) => (
                        <div
                            key={option}
                            className={styles.dropdownItem}
                            onClick={() => {
                                onSelect(option);
                                onToggle();
                            }}
                        >
                            {option}
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
};

export default Dropdown;
