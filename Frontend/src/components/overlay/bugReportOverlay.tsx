import { FunctionComponent, useState } from 'react';
import styles from './bugReportOverlay.module.css';

interface BugReportOverlayProps {
    onSubmit: (reportText: string) => void;
    onClose: () => void;
}

const BugReportOverlay: FunctionComponent<BugReportOverlayProps> = ({ onSubmit, onClose }) => {
    const [reportText, setReportText] = useState('');

    return (
        <div className={styles.bugReportOverlay}>
            <div className={styles.bugReportContent}>
                <h3>Report a Bug</h3>
                <textarea
                    placeholder="Describe the bug here..."
                    rows={5}
                    className={styles.bugReportTextarea}
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                ></textarea>
                <div className={styles.bugReportActions}>
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={() => onSubmit(reportText)}>Submit Report</button>
                </div>
            </div>
        </div>
    );
};

export default BugReportOverlay;
