import { useState } from 'react';
import styles from './CustomListsOfTasksSidebar.module.css';
import SearchBar from '../searchbar/SearchBar';
import React from 'react';

interface SidebarProps {
    onCategoryCreate: (categoryName: string) => void;
    onCategoryRemove: (categoryId: number) => void;
    categories: { id: number; name: string }[];
}

const CustomListsOfTasksSidebar: React.FC<SidebarProps> = ({ onCategoryCreate, onCategoryRemove, categories }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateCategory = () => {
        if (!newCategoryName.trim()) return;
        onCategoryCreate(newCategoryName);
        setNewCategoryName('');
        setIsOverlayOpen(false); 
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.searchContainer}>
                <SearchBar
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search groups..."
                />
                <button className={styles.addButton} onClick={() => setIsOverlayOpen(true)}>
                    Add
                </button>
            </div>

            <div className={styles.customCategoryList}>
                {filteredCategories.length > 0 ? (
                    <div className={styles.categoryScrollContainer}>
                        {filteredCategories.map((category) => (
                            <div key={category.id} className={styles.customCategoryItem}>
                                <span>{category.name}</span>
                                <button
                                    className={styles.removeCategoryButton}
                                    onClick={() => onCategoryRemove(category.id)}
                                >
                                    ✖
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.noCategories}>No groups found</p>
                )}
            </div>

            {isOverlayOpen && (
                <div className={styles.overlay}>
                    <div className={styles.overlayContent}>
                        <h3>Create a New Task Group</h3>
                        <input
                            type="text"
                            className={styles.newCategoryInput}
                            placeholder="Enter group name..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <div className={styles.overlayButtons}>
                            <button className={styles.cancelButton} onClick={() => setIsOverlayOpen(false)}>
                                Cancel
                            </button>
                            <button className={styles.confirmButton} onClick={handleCreateCategory}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomListsOfTasksSidebar;
