import React from 'react';
import styles from './confirmAddingStudents.module.css';

interface OverlayProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmButtonText: string;
    cancelButtonText: string;
}

const ConfirmAddingStudents: React.FC<OverlayProps> = ({
    message,
    onConfirm,
    onCancel,
    confirmButtonText,
    cancelButtonText,
}) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.overlayContent}>
                <h3>{message}</h3>
                <div className={styles.buttons}>
                    <button className={styles.confirmButton} onClick={onConfirm}>
                        {confirmButtonText}
                    </button>
                    <button className={styles.cancelButton} onClick={onCancel}>
                        {cancelButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmAddingStudents;
