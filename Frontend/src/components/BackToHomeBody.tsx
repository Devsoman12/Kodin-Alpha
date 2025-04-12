import { FunctionComponent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './BackToHomeBody.module.css';

const BackToHomeBody: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Access the state passed from the navigate call
    const message = location.state?.message || 'Default message template'; // Default message if none passed

    const onButtonHomeClick = () => {
        navigate('/'); // Navigate to Home page
    };

    const onButtonClassClick = () => {
        navigate('/classPage'); // Navigate to Class page
    };

    return (
        <div className={styles.backtohomebody}>
            <b className={styles.youSuccessfullyCreatedContainer}>
                {message} {/* Display the passed message */}
            </b>
            <div className={styles.auth}>
                <div className={styles.authButton} onClick={onButtonHomeClick}>
                    <div className={styles.authButtonChild} />
                    <b className={styles.text}>Return to Home</b>
                </div>
                <div className={styles.authButton1} onClick={onButtonClassClick}>
                    <div className={styles.authButtonItem} />
                    <b className={styles.text}>Return To Class</b>
                </div>
            </div>
        </div>
    );
};

export default BackToHomeBody;
