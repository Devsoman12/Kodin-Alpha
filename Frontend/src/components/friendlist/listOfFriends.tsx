import { FunctionComponent, useCallback, useState } from 'react';
import styles from './listOfFriends.module.css';
import SearchBar from '../searchbar/SearchBar';
import add from '../../assets/addFriend.svg';
import icon from '../../assets/icon.svg';
import { useNavigate } from 'react-router-dom';

const friendsData = [
	{ name: 'Helmut', rank: 'Master', points: 1456 },
	{ name: 'Helmut', rank: 'Master', points: 1456 },
	{ name: 'Helmut', rank: 'Master', points: 1456 },
	{ name: 'Helmut', rank: 'Master', points: 1456 },
	{ name: 'Helmut', rank: 'Master', points: 1456 },
	{ name: 'Helmut', rank: 'Master', points: 1456 },
	{ name: 'Helmut', rank: 'Master', points: 1456 },
	{ name: 'Helmut', rank: 'Master', points: 1456 },
];

const Content: FunctionComponent = () => {
	const navigate = useNavigate();
	const [searchValue, setSearchValue] = useState('');

	const onAddFriendClick = useCallback(() => {
		navigate('/addFriendPage');
	}, [navigate]);

	const filteredFriends = friendsData.filter(friend =>
		friend.name.toLowerCase().includes(searchValue.toLowerCase())
	);

	return (
		<div className={styles.content}>
			<div className={styles.searchbarWrapper}>
				<div className={styles.addFriend} onClick={onAddFriendClick}>
					<img className={styles.addFriendIcon} alt="Add Friend" src={add} />
				</div>
				<SearchBar
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
					placeholder="Type to search"
				/>
			</div>
			<div className={styles.contentFriends}>
				<div className={styles.fieldOfFriends}>
					{filteredFriends.map((friend, index) => (
						<div key={index} className={styles.accountCircleParent}>
							<img className={styles.accountCircleIcon} alt="Friend Icon" src={icon} />
							<div className={styles.nicknameParent}>
								<div className={styles.nickname}>
									<b className={styles.master}>{friend.name}</b>
								</div>
								<div className={styles.rank}>
									<b className={styles.master}>{friend.rank}</b>
								</div>
								<div className={styles.nickname}>
									<b className={styles.master}>Points: {friend.points}</b>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Content;
