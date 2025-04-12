import { FunctionComponent, useEffect, useState } from "react";
import axios from "axios";
import styles from "./PreviewClasses.module.css";
import { useNavigate } from "react-router-dom";

interface Classroom {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
}

const PreviewClasses: FunctionComponent = () => {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/classroom/getAllClassrooms");
                if (response.data.status === "success") {
                    setClassrooms(response.data.result || []);
                } else {
                    console.error("Failed to fetch classrooms:", response.data.message);
                }
            } catch (error) {
                console.error("Error fetching classrooms:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClassrooms();
    }, []);

    return (
        <div className={styles.previewClassesContainer}>
            <h3 className={styles.previewClassesTitle}>Available Classes</h3>
            {loading && <p>Loading classes...</p>}
            {!loading && classrooms.length === 0 && <p>No classes available.</p>}
            <ul className={styles.classList}>
                {classrooms.map((classroom) => (
                    <li key={classroom.id} className={styles.classItem}>
                        <div className={styles.classInfo}>
                            <span
                                onClick={() => navigate(`/classPage/${classroom.id}`)}
                                className={styles.classTitleLink}
                            >
                                {classroom.name}
                            </span>
                        </div>
                        <div className={styles.classTimeInterval}>
                            {classroom.start_time} - {classroom.end_time}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PreviewClasses;