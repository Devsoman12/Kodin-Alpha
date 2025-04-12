import React, { FunctionComponent, useState, useRef, useEffect } from 'react';
import styles from './FullHeader.module.css';
import adminPanelIcon from '../../assets/A.svg';
import hamburgerIcon from '../../assets/hamburger.svg';
import bellIcon from '../../assets/Bell.svg';
import logoIcon from '../../assets/logo.svg';
import settingsIcon from '../../assets/settings_dropdown.svg';
import profileIcon from '../../assets/icon.svg';
import pointsIcon from '../../assets/Points.svg';

import HamburgerMenu from './HamburgerMenu';
import NotificationInboxOverlay from './NotificationInboxOverlay';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/AuthContext';
import SettingsDropdown from './SettingsDropdown';
import axios from 'axios';
import BugReportOverlay from "../overlay/bugReportOverlay";
import bugReport from "../../assets/bugReport.svg";

const menuItems = [
  { label: 'Leaderboard', path: '/leaderboardPage' },
  { label: 'Docs', path: '/docsPage' },

];

const FullHeader: FunctionComponent = () => {
  const [isHamburgerOpen, setHamburgerOpen] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const { user, logout, isLoggedIn } = useAuthStore();

  const [newNotificationsCount, setNewNotificationsCount] = useState<number>(0);
  const [showBugReportOverlay, setShowBugReportOverlay] = useState(false);


  const hamburgerRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user?.userID) {
      const fetchProfilePicture = async () => {
        try {
          const response = await axios.post('http://localhost:5000/api/image/get-profile-pic', {
            user_id: user.userID,
          });
          if (response.data.success) {
            setProfilePic(`http://localhost:5000${response.data.profilePicture}`);
          }
        } catch (error) {
          console.error('Error fetching profile picture:', error);
        }
      };
      fetchProfilePicture();
    }
  }, [user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/notifications/getAllNotifications', {

        });

        if (response.data.status === 'success') {
          setNewNotificationsCount(response.data.notifications.length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (user?.userID) {
      fetchNotifications();
    }
  }, [user]);

  const handleToggleNotifications = () => {
    // Toggle the overlay visibility
    setNotificationOpen((prev) => !prev);

    // If opening the notification overlay, reset the new notification indicator
    if (!isNotificationOpen) {
      setNewNotificationsCount(0); // Reset notification count or indicator when the overlay is opened
    }
  };

  const handleBugReportSubmit = async (reportText: string) => {
    if (!user) return;
    try {
      const response = await axios.post(
          'http://localhost:5000/api/bugReport',

          // { task_id, reportText, user_id: user.userID }

      );
      if (response.data.status === 'success') {
        alert('Bug report submitted successfully!');
      } else {
        alert('Failed to submit bug report');
      }
    } catch (error) {
      console.error('Error submitting bug report:', error);
    }
    setShowBugReportOverlay(false);
  };

  const handleLogoClick = () => navigate('/');
  const handleProfileClick = () => navigate(`/profilePage/${user?.userID}`);
  const handleToggleDropdown = () => setDropdownVisible((prev) => !prev);

  // const handleSettingsClick = () => navigate('/settingsPage');


  return (
      <div className={styles.headerContainer}>
        {!isLoggedIn || (user && !user.isverified) ? (
            <div className={styles.authContainer}>
              <div className={styles.authButtons}>
                <button className={styles.signupButton} onClick={() => navigate('/register')}>
                  <div className={styles.signupButtonBackground} />
                  <div className={styles.buttonText}>Sign Up</div>
                </button>
                <button className={styles.loginButton} onClick={() => navigate('/login')}>
                  <div className={styles.loginButtonBackground} />
                  <div className={styles.buttonText}>Login</div>
                </button>
              </div>
            </div>
        ) : (
            <div className={styles.userActionsContainer}>
              <div className={styles.honorAndProfile}>
                <div className={styles.pointsContainer}>
                  <div className={styles.pointsBackground} />
                  <div className={styles.pointsDisplay}>
                    <img className={styles.pointsIcon} alt="Points" src={pointsIcon} />
                    <div className={styles.pointsText}>{user?.honor || 0}</div>
                  </div>
                </div>

                <img
                    className={styles.profileIcon}
                    alt="Profile"
                    src={profilePic || profileIcon}
                    onClick={handleProfileClick}
                />
              </div>
            </div>
        )}

        <div className={styles.navSection}>
          <img className={styles.logoIcon} alt="Logo" src={logoIcon} onClick={handleLogoClick}/>


          {!isMobile ? (
              <div className={styles.navbar}>

                <div className={styles.leftPanel}>

                  <img
                      className={styles.icon}
                      alt="Report Bug"
                      src={bugReport}
                      onClick={() => setShowBugReportOverlay(true)}
                      style={{cursor: 'pointer'}}
                      data-tooltip="Report a bug"
                  />

                </div>

                <div className={styles.navbarContent}>
                  {menuItems.map((item) => (
                      <button key={item.path} className={styles.menuLink} onClick={() => navigate(item.path)}>
                        {item.label}
                      </button>
                  ))}
                </div>

                <div className={styles.rightPanel}></div>
              </div>
          ) : (
              <div className={styles.navbar}>
                <div className={styles.leftPanel}>
                  <img
                      className={styles.icon}
                      alt="Report Bug"
                      src={bugReport}
                      onClick={() => setShowBugReportOverlay(true)}
                      style={{cursor: 'pointer'}}
                      data-tooltip="Report a bug"
                  />
                </div>

                <div className={styles.navbarContent}>
                  <div className={styles.hamburgerButton} ref={hamburgerRef}
                       onClick={() => setHamburgerOpen((prev) => !prev)}>
                    <img className={styles.hamburgerIcon} alt="Menu" src={hamburgerIcon}/>
                  </div>


                </div>
                <div className={styles.rightPanel}></div>

              </div>
          )}

          <div className={styles.headerActions}>
            <div className={styles.notificationsContainer} ref={bellRef}>
              <button
                  className={styles.notifications}
                  onClick={handleToggleNotifications}
                  aria-label="Toggle Notifications"
              >
                <div className={styles.notificationsBackground}/>
                <img className={styles.notificationsIcon} src={bellIcon} alt="Notifications"/>
                {newNotificationsCount > 0 && (
                    <div className={styles.notificationIndicator}></div>  // The red circle
                )}
              </button>
              {isNotificationOpen &&
                  <NotificationInboxOverlay anchorRef={bellRef} onClose={() => setNotificationOpen(false)}/>}
            </div>


            <div className={styles.settings} ref={dropdownRef}>
              <button className={styles.settingsButton} onClick={handleToggleDropdown}>
                <img src={settingsIcon} alt="Settings"/>
              </button>
              {isDropdownVisible && <SettingsDropdown onClose={() => setDropdownVisible(false)}/>}
            </div>
          </div>
        </div>

        {showBugReportOverlay && (
            <BugReportOverlay
                onSubmit={handleBugReportSubmit}
                onClose={() => setShowBugReportOverlay(false)}
            />
        )}


        {isHamburgerOpen && isMobile && (
            <HamburgerMenu menuItems={menuItems} onClose={() => setHamburgerOpen(false)} triggerRef={hamburgerRef}/>
        )}
      </div>
  );
};

export default FullHeader;
