import { FunctionComponent, useCallback, useState, useEffect } from 'react';
import styles from './profileBody.module.css';
import interval from '../../assets/intervalIcon.svg';
import comment from '../../assets/message_icon.svg';
import points from '../../assets/Points.svg';
import check from '../../assets/CheckMark.svg';
import rank from "../../assets/rank.svg";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import PreviewClasses from "./PreviewClasses";

const Inside: FunctionComponent = () => {
  const { user_id } = useParams<{ user_id: string }>();
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<{ badge_id: number; badge_name: string; badge_picture: string } | null>(null);
  const [userBadges, setUserBadges] = useState<{ badge_id: number; badge_name: string; badge_picture: string }[]>([]);


  const fetchUserData = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/get-user-stats', {
        user_id: user_id,
      });

      if (response.data.status === 'success') {
        setUserData(response.data.userProfile);
      } else {
        console.error('Error fetching user data:', response.data.message);
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    }
  };

  const fetchUserBadges = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/image/getBadgePictures', { user_id });

      // console.log("Fetched Badges.md:", response.data);

      if (response.data.success) {
        setUserBadges(response.data.allBadges);

        const defaultBadge = response.data.allBadges.find((badge: { selected: boolean; }) => badge.selected === true) || response.data.allBadges[0];
        setSelectedBadge(defaultBadge);

        console.log("Selected Default Badge:", defaultBadge);
      }
    } catch (error) {
      console.error('Error fetching user badges:', error);
    }
  };


  useEffect(() => {
    fetchUserBadges();
  }, [user_id]);


  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user_id) {
      console.error('User ID is not defined');
      return;
    }

    const formData = new FormData();
    formData.append('profile_pic', file);

    formData.append('user_id', user_id as string);

    try {
      const response = await axios.post('http://localhost:5000/api/image/upload-profile-pic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrl = `http://localhost:5000${response.data.filePath}`;
      setProfilePic(imageUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  useEffect(() => {
    fetchUserData();

    const fetchProfilePicture = async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/image/get-profile-pic', { user_id: user_id });
        if (response.data.success) {
          setProfilePic(`http://localhost:5000${response.data.profilePicture}`);
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    fetchProfilePicture();
  }, [user_id]);

  const onConfirmButtonContainerClick = useCallback(() => {
    navigate('/friendListPage');
  }, [navigate]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const selectBadge = async (badge: { badge_id: number; badge_name: string; badge_picture: string }) => {
    setSelectedBadge(badge);
    setIsDropdownOpen(false);

    try {
      await axios.post('http://localhost:5000/api/badgeHandler/setUserBadge', {
        user_id,
        selected_badge_id: badge.badge_id,
      });

    } catch (error) {
      console.error('Error setting selected badge:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileSection}>
        <div className={styles.profileInfo}>
          <div className={styles.profilePicRankAndNick}>
            <div className={styles.ellipseParent}>
              <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{display: 'none'}}
              />
              <label htmlFor="profile-upload" className={styles.profileUploadLabel}>
                {profilePic ? (
                    <img src={profilePic} className={styles.profilePic} alt="Profile"/>
                ) : (
                    <div className={styles.profilePicPlaceholder}>+</div>
                )}
              </label>

              <div className={styles.badgePlaceholder} onClick={toggleDropdown}>
                {selectedBadge ? (
                    <img src={selectedBadge.badge_picture} className={styles.badgePic} alt={selectedBadge.badge_name}/>
                ) : (
                    <div className={styles.badgePicPlaceholder}>Badge</div>
                )}
              </div>

              {isDropdownOpen && (
                  <div className={styles.badgeDropdown}>
                    {userBadges.map((badge) => (
                        <div key={badge.badge_name} className={styles.badgeOption} onClick={() => selectBadge(badge)}>
                          <img src={badge.badge_picture} className={styles.badgeOptionIcon} alt={badge.badge_name}/>
                          <span>{badge.badge_name}</span>
                        </div>
                    ))}
                  </div>
              )}

            </div>
            <div className={styles.nicknameParent}>
              <b className={styles.nickname}>{userData?.nick}</b>
              {/*<div className={styles.headerButton} onClick={onConfirmButtonContainerClick}>*/}

                <div className={styles.headerButton}>
                  <div className={styles.headerButtonChild}/>
                  {/*<div className={styles.text}>*/}
                  {/*  <b className={styles.text1}>FriendList</b>*/}
                  {/*</div>*/}
                </div>
              </div>
            </div>
            <div className={styles.stats}>
              <div className={styles.statItem}>
              <img src={check} className={styles.statIcon} alt="Completed Problems"/>
              <span className={styles.statLabel}>Total completed problems:</span>
              <span className={styles.statValue}>{userData?.problems_completed}</span>
            </div>
            <div className={styles.statItem}>
              <img src={points} className={styles.statIcon} alt="Points"/>
              <span className={styles.statLabel}>Points acquired:</span>
              <span className={styles.statValue}>{userData?.honor}</span>
            </div>
            <div className={styles.statItem}>
              <img src={comment} className={styles.statIcon} alt="Comments"/>
              <span className={styles.statLabel}>Comments added:</span>
              <span className={styles.statValue}>{userData?.comments_count}</span>
            </div>
            <div className={styles.statItem}>
              <img src={interval} className={styles.statIcon} alt="Most Used Language"/>
              <span className={styles.statLabel}>Most used language:</span>
              <span className={styles.statValue}>{userData?.mostUsedLanguage}</span>
            </div>
            <div className={styles.statItem}>
              <img src={rank} className={styles.statIcon} alt="Most Used Language"/>
              <span className={styles.statLabel}>Rank</span>
              <span className={styles.statValue}>{userData?.rank}</span>
            </div>
          </div>
        </div>


        <div className={styles.rightSpace}>
          <div className={styles.reservedRectangle}>
            {/*<span className={styles.rectangleLabel}>My Classes</span>*/}
              <PreviewClasses/>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Inside;
