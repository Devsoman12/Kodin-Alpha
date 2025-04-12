// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import styles from './MainButton.module.css';
// import axios from 'axios';
// import { useCallback } from 'react';
//
// interface ReusableButtonProps {
//     icon: string;
//     hoverText: string;
//     direction?: 'left' | 'right';
//     link?: string;
// }
//
// const MainButton: React.FC<ReusableButtonProps> = ({ icon, hoverText, direction = 'right', link }) => {
//     const [isHovered, setIsHovered] = useState(false);
//     const navigate = useNavigate();
//     const [errorVisible, setError] = useState<string | null>(null);
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//
//     useEffect(() => {
//         const checkAuthentication = async () => {
//             try {
//                 const response = await axios.get('http://localhost:5000/api/auth/checkauth', { withCredentials: true });
//                 if (response.data.status === "success") {
//                     setIsAuthenticated(true);
//                 }
//             } catch (error) {
//                 setIsAuthenticated(false);
//             }
//         };
//         checkAuthentication();
//     }, []);
//
//     const handleClick = (event: React.MouseEvent) => {
//         event.stopPropagation();
//
//         const restrictedLinks = ["/CalendarPage", `/tasks/${0}/createTaskPage/`];
//
//         if (restrictedLinks.includes(link || "") && !isAuthenticated) {
//             setError("You need to be logged in to access this page.");
//             return;
//         }
//         if (link) navigate(link);
//     };
//
//     return (
//         <div
//             className={`${styles.buttonContainer} ${styles[direction]}`}
//             onMouseEnter={() => setIsHovered(true)}
//             onMouseLeave={() => setIsHovered(false)}
//         >
//
//             {/*{error && <div className={styles.error}>{error}</div>}*/}
//
//             <div className={styles.contentWrapper}>
//                 <div className={`${styles.hoverText} ${isHovered ? styles.visible : ''}`}>
//                     {hoverText}
//                 </div>
//
//                 <div className={styles.button}>
//                     <img src={icon} alt="icon" className={styles.icon} onClick={handleClick} />
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default MainButton;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MainButton.module.css';
import axios from 'axios';
import ErrorNotification from '../../overlay/ErrorNotification'; // Import ErrorNotification komponentu

interface ReusableButtonProps {
    icon: string;
    hoverText: string;
    direction?: 'left' | 'right';
    link?: string;
}

const MainButton: React.FC<ReusableButtonProps> = ({ icon, hoverText, direction = 'right', link }) => {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth/checkauth', { withCredentials: true });
                if (response.data.status === "success") {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                setIsAuthenticated(false);
            }
        };
        checkAuthentication();
    }, []);

    const handleClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        const restrictedLinks = ["/CalendarPage", `/tasks/${0}/createTaskPage/`];

        if (restrictedLinks.includes(link || "") && !isAuthenticated) {
            setError("You need to be logged in to access this page.");
            return;
        }
        if (link) navigate(link);
    };

    return (
        <div
            className={`${styles.buttonContainer} ${styles[direction]}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {error && <ErrorNotification message={error} onClose={() => setError(null)} />}

            <div className={styles.contentWrapper}>
                <div className={`${styles.hoverText} ${isHovered ? styles.visible : ''}`}>
                    {hoverText}
                </div>

                <div className={styles.button}>
                    <img src={icon} alt="icon" className={styles.icon} onClick={handleClick} />
                </div>
            </div>
        </div>
    );
};

export default MainButton;
