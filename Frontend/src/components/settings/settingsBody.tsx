import React, { useState } from 'react';
import axios from 'axios';
import styles from './settingsBody.module.css';

const SettingsBody: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profileVisibility, setProfileVisibility] = useState(true);
    const [allowComments, setAllowComments] = useState(true);

    const handleSave = async () => {
        try {
            const response = await axios.put('http://localhost:5000/api/auth/updateProfile', {
                username,
                email,
                password,
                profileVisibility,
                allowComments,
            });

            console.log('Settings Saved:', response.data);
        } catch (error) {
            console.error('Error saving settings:');
        }
    };

    const handleDeleteAccount = async () => {
        const confirmation = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');

        if (confirmation) {
            try {
                const response = await axios.delete('http://localhost:5000/api/auth/deleteAccount');

                console.log('Account Deleted:', response.data);

            } catch (error) {
                console.error('Error deleting account:');
            }
        }
    };

    return (
        <div className={styles.settingsContainer}>
            <h1>Profile Settings</h1>

            <section className={styles.section}>
                <h2>Personal Information</h2>
                <div className={styles.formGroup}>
                    <label>Change Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter new username"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Change Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter new email"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Change Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                    />
                </div>
            </section>

            <section className={styles.section}>
                <h2>Account Privacy</h2>
                <div className={styles.formGroup}>
                    <label>Profile Visibility</label>
                    <select
                        value={profileVisibility ? 'visible' : 'hidden'}
                        onChange={(e) => setProfileVisibility(e.target.value === 'visible')}
                    >
                        <option value="visible">Visible</option>
                        <option value="hidden">Hidden</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label>Allow Comments and Ratings</label>
                    <input
                        type="checkbox"
                        checked={allowComments}
                        onChange={(e) => setAllowComments(e.target.checked)}
                    />
                </div>
            </section>

            <section className={styles.section}>
                <h2>Danger Zone</h2>
                <button className={styles.deleteButton} onClick={handleDeleteAccount}>
                    Delete Account
                </button>
            </section>

            <button className={styles.saveButton} onClick={handleSave}>
                Save Changes
            </button>
        </div>
    );
};

export default SettingsBody;
