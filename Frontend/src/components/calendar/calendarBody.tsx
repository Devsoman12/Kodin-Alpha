import { FunctionComponent, useEffect, useState } from 'react';
import axios from 'axios';
import styles from './calendarBody.module.css';
import NImage from '../../assets/N.svg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/AuthContext';
import EditOptions from "../dropDown/EditOptions";

interface Classroom {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    day_of_week: string;
    user_id: number;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const timeSlots = [
    '07:30-09:00', '09:00-10:00', '10:30-12:00', '12:00-13:30',
    '13:30-15:00', '15:00-16:30', '16:30-18:00', '18:00-19:30'
];

const isTimeInSlot = (startTime: string, slot: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [slotStart, slotEnd] = slot.split('-').map(s => s.split(':').map(Number));

    return (
        (startHour > slotStart[0] || (startHour === slotStart[0] && startMin >= slotStart[1])) &&
        (startHour < slotEnd[0] || (startHour === slotEnd[0] && startMin < slotEnd[1]))
    );
};

const CalendarBody: FunctionComponent = () => {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [editMode, setEditMode] = useState<boolean>(false);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const response = await axios.post('http://localhost:5000/api/classroom/getAllClassrooms');
                if (response.data.status === 'success') {
                    setClassrooms(response.data.result || []);
                } else {
                    console.error('Failed to fetch classrooms:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching classrooms:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClassrooms();
    }, []);

    const handleCreateClassroom = async (day: string, slot: string) => {
        if (!editMode || user?.role !== 'teacher') return;

        const [startTime, endTime] = slot.split('-');

        const newClass = {
            name: 'New Class',
            subject: 'Default',
            start_time: startTime,
            end_time: endTime,
            day_of_week: day,
            user_id: user?.userID
        };

        try {
            const response = await axios.post('http://localhost:5000/api/classroom/createClassroom', newClass);
            navigate(`/classPage/${response.data.classroom_id}`);
        } catch (error) {
            console.error('Failed to create class:', error);
        }
    };

    if (loading) {
        return <div>Loading classrooms...</div>;
    }

    return (
        <div className={styles.calendarbody}>
            <div className={styles.rozvrh}>
                <div className={styles.timesParent}>
                    <div className={styles.times}>
                        <div className={styles.timeRange}>
                            <b className={styles.time}>Time</b>
                        </div>
                        <div className={styles.intervals}>
                            {timeSlots.map((timeSlot, index) => (
                                <div key={index} className={styles.timeRange1}>
                                    <b className={styles.time}>{timeSlot}</b>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.days}>
                        {daysOfWeek.map((day, index) => (
                            <div key={index} className={styles.day}>
                                <div className={styles.authday}>
                                    <b className={styles.day1}>{day}</b>
                                </div>
                                {timeSlots.map((slot, slotIndex) => {
                                    const classForSlot = classrooms.find(
                                        (classroom) =>
                                            classroom.day_of_week?.toLowerCase() === day.toLowerCase() &&
                                            isTimeInSlot(classroom.start_time, slot)
                                    );

                                    return (
                                        <div
                                            key={slotIndex}
                                            className={styles.classCell}
                                            onClick={() => {
                                                if (!classForSlot && editMode && user?.role === 'teacher') {
                                                    handleCreateClassroom(day, slot);
                                                }
                                            }}
                                            style={{
                                                cursor: classForSlot ? 'default' : editMode && user?.role === 'teacher' ? 'pointer' : 'not-allowed',
                                                background: classForSlot ? '' : '#f0f0f0'
                                            }}
                                        >
                                            <div className={styles.frame} />
                                            {classForSlot ? (
                                            <div className={styles.classCellContent}>
                                                <Link to={`/classPage/${classForSlot.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                    <b className={styles.classNamee}>{classForSlot.name}</b>
                                                </Link>

                                                {user?.role === 'teacher' && (
                                                    <EditOptions
                                                        messageString={classForSlot.name}
                                                        index={classForSlot.id}
                                                        onEdit={() => navigate(`/classPage/${classForSlot.id}`, { state: { editMode: true } })}
                                                        onDelete={async () => {
                                                            if (!classForSlot) return;

                                                            const isConfirmed = window.confirm(`Are you sure you want to delete the class "${classForSlot.name}"?`);
                                                            if (!isConfirmed) return;

                                                            try {
                                                                const response = await axios.delete(`http://localhost:5000/api/classroom/deleteClassroom`, {
                                                                    params: { classroom_id: classForSlot.id }
                                                                });

                                                                if (response.data.status === "success") {
                                                                    setClassrooms(prevClassrooms => prevClassrooms.filter(c => c.id !== classForSlot.id));
                                                                } else {
                                                                    console.error("Failed to delete classroom:", response.data.message);
                                                                }
                                                            } catch (error) {
                                                                console.error("Error while deleting classroom:", error);
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        ) : editMode && user?.role === 'teacher' ? (
                                            <span className={styles.addClass}>+ Add Class</span>
                                        ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {user?.role === 'teacher' && (
                <div className={styles.buttons}>
                    <div className={styles.tooltipContainer}>
                        <img
                            className={styles.newClassIcon}
                            alt="Add new class"
                            src={NImage}
                            onClick={() => setEditMode(!editMode)}
                        />
                        <span className={styles.tooltip}>Click to add a new class</span>
                    </div>
                </div>

            )}
        </div>
    );
};

export default CalendarBody;
