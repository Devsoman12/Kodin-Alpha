import React, { useEffect, useRef } from 'react';
import styles from './SettingsDropdown.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/AuthContext';

interface SettingsDropdownProps {
    onClose: () => void;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div className={styles.settingsDropdown} ref={dropdownRef}>
            <button className={styles.dropdownOption} onClick={() => { navigate(`profilePage/${user?.userID}`);
 onClose(); }}>
                Profile
            </button>
            <button className={styles.dropdownOption} onClick={() => { navigate('/settingsPage'); onClose(); }}>
                Settings
            </button>
            <button className={styles.dropdownOption} onClick={logout}>
                Sign Out
            </button>
        </div>
    );
};

export default SettingsDropdown;
