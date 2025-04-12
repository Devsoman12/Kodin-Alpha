import React, { FunctionComponent, ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import styles from './SearchBar.module.css';
import vectorImage from '../../assets/Vector.svg';

interface SearchBarProps {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    onSearch?: (event: MouseEvent<HTMLDivElement>) => void;
    placeholder?: string;
}

const SearchBar: FunctionComponent<SearchBarProps> = ({
                                                          value,
                                                          onChange,
                                                          onKeyDown,
                                                          onSearch,
                                                          placeholder = 'Search...',
                                                      }) => {
    return (
        <div className={styles.searchbar}>
            <input
                type="text"
                className={styles.searchBarInput}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
            />
            <div
                className={styles.vectorIconWrapper}
                onClick={onSearch}
                role="button"
                tabIndex={0}
                aria-label="Search"
                onKeyPress={(e) => {
                    if (e.key === 'Enter' && onSearch) onSearch(e as unknown as MouseEvent<HTMLDivElement>);
                }}
            >
                <img className={styles.vectorIcon} alt="Search" src={vectorImage} />
            </div>
        </div>
    );
};

export default SearchBar;
