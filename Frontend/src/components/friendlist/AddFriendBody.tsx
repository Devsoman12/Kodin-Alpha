import React, { FunctionComponent, useState, ChangeEvent, MouseEvent } from 'react';
import styles from './AddFriendBody.module.css';

import ProfilePictureImage from '../../assets/ProfilePicture.svg';
import FriendRequestComponentProps from '../profile/FriendRequestComponentProps';
import SearchBar from '../searchbar/SearchBar';
const AddFriendBody: FunctionComponent = () => {
    const [searchValue, setSearchValue] = useState('');
    const [filteredFriends, setFilteredFriends] = useState([
        { name: 'Helmut', rank: 'Master', points: 1456 },
        { name: 'Jasha', rank: 'Beginner', points: 25 },
        { name: 'Anton', rank: 'Master', points: 2500 },
        { name: 'Hannah', rank: 'Beginner', points: 27 },
        { name: 'Karol', rank: 'Beginner', points: 15 },
        { name: 'Igor', rank: 'Advanced', points: 540 },
        { name: 'Tomas', rank: 'Master', points: 1968 },
        { name: 'Anciasz', rank: 'Master', points: 2100 },
    ]);

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
        filterFriends(event.target.value);
    };

    const handleSearchClick = (event: MouseEvent<HTMLDivElement>) => {
        filterFriends(searchValue);
    };

    const filterFriends = (searchText: string) => {
        const lowerCaseSearch = searchText.toLowerCase();
        setFilteredFriends(
            [
                { name: 'Helmut', rank: 'Master', points: 1456 },
                { name: 'Jasha', rank: 'Beginner', points: 25 },
                { name: 'Anton', rank: 'Master', points: 2500 },
                { name: 'Hannah', rank: 'Beginner', points: 27 },
                { name: 'Karol', rank: 'Beginner', points: 15 },
                { name: 'Igor', rank: 'Advanced', points: 540 },
                { name: 'Tomas', rank: 'Master', points: 1968 },
                { name: 'Anciasz', rank: 'Master', points: 2100 },
            ].filter((friend) => friend.name.toLowerCase().includes(lowerCaseSearch))
        );
    };

    return (
        <div className={styles.addfriendbody}>
            <div className={styles.searchbar}>
                <SearchBar
                    value={searchValue}
                    onChange={handleSearchChange}
                    onSearch={handleSearchClick} // Updated for compatibility
                    placeholder="Search friends..."
                />
            </div>
            <div className={styles.contentFriends}>
                <div className={styles.fieldOfFriends}>
                    {filteredFriends.map((friend, index) => (
                        <div key={index} className={styles.frameParent}>
                            <div className={styles.singleProfileInFriendlistWrapper}>
                                <div className={styles.accountCircleParent}>
                                    <img
                                        className={styles.accountCircleIcon}
                                        alt=""
                                        src={ProfilePictureImage}
                                    />
                                    <div className={styles.nicknameParent}>
                                        <div className={styles.nickname}>
                                            <div className={styles.nicknameChild} />
                                            <b className={styles.master}>{friend.name}</b>
                                        </div>
                                        <div className={styles.rank}>
                                            <div className={styles.nicknameChild} />
                                            <b className={styles.master}>{friend.rank}</b>
                                        </div>
                                        <div className={styles.nickname}>
                                            <div className={styles.nicknameChild} />
                                            <b className={styles.master}>
                                                Points: {friend.points}
                                            </b>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <FriendRequestComponentProps />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddFriendBody;
