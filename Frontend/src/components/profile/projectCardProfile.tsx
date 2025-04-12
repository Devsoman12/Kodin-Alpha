import { FunctionComponent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './projectCardProfile.module.css';
import CustomListsOfTasksSidebar from '../bars/./CustomListsOfTasksSidebar';
import axios from 'axios';

const ProjectCard: FunctionComponent = () => {
    const [taskLists, setTaskLists] = useState<{ list_id: number; name: string }[]>([]);
    const [customCategories, setCustomCategories] = useState<{ id: number; name: string }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const itemsPerView = 3;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTaskLists = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/taskHandler/getListsOfTasks');
                setTaskLists(response.data.lists);
            } catch (error) {
                console.error('Error fetching task lists:', error);
            }
        };

        fetchTaskLists();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 968);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + taskLists.length) % taskLists.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % taskLists.length);
    };

    let visibleCategories = taskLists.slice(currentIndex, currentIndex + itemsPerView);
    const seenIds = new Set<number>();
    visibleCategories = visibleCategories.filter((category) => {
        if (seenIds.has(category.list_id)) return false;
        seenIds.add(category.list_id);
        return true;
    });

    if (visibleCategories.length < itemsPerView) {
        const remainingItems = taskLists.filter((category) => !seenIds.has(category.list_id));
        visibleCategories = [...visibleCategories, ...remainingItems.slice(0, itemsPerView - visibleCategories.length)];
    }

    const handleCreateCategory = (categoryName: string) => {
        const newCategory = { id: Date.now(), name: categoryName };
        setCustomCategories((prev) => [...prev, newCategory]);
    };

    const handleRemoveCategory = (categoryId: number) => {
        setCustomCategories((prev) => prev.filter((category) => category.id !== categoryId));
    };

    return (
        <div className={styles.projectCard}>
            {/*<div className={styles.sidebarContainer}>*/}
            {/*    <CustomListsOfTasksSidebar*/}
            {/*        categories={customCategories}*/}
            {/*        onCategoryCreate={handleCreateCategory}*/}
            {/*        onCategoryRemove={handleRemoveCategory}*/}
            {/*    />*/}
            {/*</div>*/}

            <div className={styles.contentContainer}>
                <div className={styles.text}>
                    <b className={styles.tasks}>Tasks</b>
                </div>
                <div className={`${styles.carouselContainer} ${isMobile ? styles.vertical : ''}`}>
                    {!isMobile ? (
                        <>
                            <button className={styles.arrowButton} onClick={handlePrev}>&lt;</button>
                            <div className={styles.cardsContainer}>
                                {visibleCategories.map((category) => (
                                    <div key={category.list_id} className={styles.card}>
                                        <b className={styles.categoryTitle}>{category.name}</b>
                                        <button
                                            className={styles.viewAllButton}
                                            onClick={() => navigate(`/lists/${category.list_id}/listOfTasksPage/${0}`)}
                                        >
                                            VIEW ALL
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button className={styles.arrowButton} onClick={handleNext}>&gt;</button>
                        </>
                    ) : (
                        <>
                            <button className={styles.arrowButton} onClick={handlePrev}>&uarr;</button>
                            <div className={styles.cardsContainer}>
                                {visibleCategories.map((category) => (
                                    <div key={category.list_id} className={styles.card}>
                                        <b className={styles.categoryTitle}>{category.name}</b>
                                        <button
                                            className={styles.viewAllButton}
                                            onClick={() => navigate(`/lists/${category.list_id}/listOfTasksPage/${0}`)}
                                        >
                                            VIEW ALL
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button className={styles.arrowButton} onClick={handleNext}>&darr;</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
