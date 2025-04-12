import React, { FunctionComponent, useState, useEffect } from "react";
import styles from "./addClassesOverlay.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ClockIcon from "../../assets/clock.svg";
import CloseIcon from "../../assets/close.svg";
import {useParams} from "react-router-dom";
import axios from "axios";

interface Classroom {
    id: number;
    name: string;
}

interface OverlayProps {
    availableClasses: Classroom[];
    preselectedClasses: number[]; // Add preselectedClasses prop
    onSave: (selectedClasses: number[], selectedTimes: { start: Date | null; end: Date | null; startTime: string; endTime: string }) => void;
    onClose: () => void;
}

const AddClassesOverlay: FunctionComponent<OverlayProps> = ({ availableClasses, preselectedClasses, onSave, onClose }) => {
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [allChecked, setAllChecked] = useState(false);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [showCalendarOverlay, setShowCalendarOverlay] = useState(false);
    const { task_id } = useParams<{ task_id: string }>();
    const [classroomIntervals, setClassroomIntervals] = useState<{
        [key: number]: { start: Date | null; end: Date | null; startTime: string; endTime: string }
    }>({});


    // Set the initial state to preselectedClasses if provided
    useEffect(() => {
        setSelectedClasses(preselectedClasses);
    }, [preselectedClasses]);

    const fetchClassroomTimeInterval = async (classroomId: number) => {
        try {
            if (!classroomId || !task_id) {
                //console.warn("Skipping fetch: No classroom selected or missing task_id");
                return;
            }

            const response = await axios.post("http://localhost:5000/api/classroom/getTaskIntervalForClass", {
                classroom_id: classroomId,
                task_id: task_id  // ✅ Nový endpoint teraz očakáva aj task_id
            });

            if (response.data) {
                const { start_date, lock_date } = response.data;

                setClassroomIntervals(prev => ({
                    ...prev,
                    [classroomId]: {
                        start: start_date ? new Date(start_date) : null,
                        end: lock_date ? new Date(lock_date) : null,
                        startTime: start_date ? new Date(start_date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "",
                        endTime: lock_date ? new Date(lock_date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "",
                    }
                }));

                // Ak je práve vybraná táto trieda, aktualizuj UI
                if (selectedClasses.includes(classroomId)) {
                    setDateRange([new Date(start_date), new Date(lock_date)]);
                    setStartTime(new Date(start_date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
                    setEndTime(new Date(lock_date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
                }
            }
        } catch (error) {
            console.error("Error fetching classroom time interval:", error);
        }
    };



    useEffect(() => {
        setSelectedClasses(preselectedClasses);
        preselectedClasses.forEach(classId => fetchClassroomTimeInterval(classId));
    }, [preselectedClasses]);

    useEffect(() => {
        if (selectedClasses.length === 1) {
            const selectedClassId = selectedClasses[0];
            if (classroomIntervals[selectedClassId]) {
                setDateRange([
                    classroomIntervals[selectedClassId].start,
                    classroomIntervals[selectedClassId].end
                ]);
                setStartTime(classroomIntervals[selectedClassId].startTime);
                setEndTime(classroomIntervals[selectedClassId].endTime);
            } else {
                setDateRange([null, null]);
                setStartTime("");
                setEndTime("");
            }
        }
    }, [selectedClasses, classroomIntervals]); // Sledujeme zmeny tried a intervalov


    const toggleClass = (classId: number) => {
        setSelectedClasses(prev => {
            if (prev.includes(classId)) {
                return prev.filter(id => id !== classId);
            } else {
                return [...prev, classId];
            }
        });
    };

// Sledujeme zmenu selectedClasses a ak pribudla nová trieda, načítame jej interval
    useEffect(() => {
        if (selectedClasses.length > 0) {
            const lastSelectedClass = selectedClasses[selectedClasses.length - 1]; // Získame poslednú vybranú triedu

            if (!classroomIntervals[lastSelectedClass]) {
                fetchClassroomTimeInterval(lastSelectedClass);
            } else {
                setDateRange([classroomIntervals[lastSelectedClass].start, classroomIntervals[lastSelectedClass].end]);
                setStartTime(classroomIntervals[lastSelectedClass].startTime);
                setEndTime(classroomIntervals[lastSelectedClass].endTime);
            }
        }
    }, [selectedClasses]); // Efekt sa spustí vždy, keď sa selectedClasses zmení


    const toggleAll = () => {
        if (allChecked) {
            setSelectedClasses([]);
        } else {
            setSelectedClasses(availableClasses.map((classroom) => classroom.id));
        }
        setAllChecked(!allChecked);
    };

    const handleDateChange = (update: [Date | null, Date | null]) => {
        setDateRange(update);
    };

    const handleTimeInputs = () => {
        return dateRange[0] && dateRange[1];
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.overlayContent}>
                <button className={styles.closeButton} onClick={onClose} style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0'
                }}>
                    <img src={CloseIcon} alt="Close" className={styles.closeIcon}/>
                </button>
                <div className={styles.header}>
                    <h3 className={styles.colorFont}>Select Available Classes</h3>

                </div>

                <div className={styles.classList}>
                    {availableClasses.map((classroom) => (
                        <label key={classroom.id} className={styles.classItem}>
                            <input type="checkbox" checked={selectedClasses.includes(classroom.id)}
                                   onChange={() => toggleClass(classroom.id)}/>
                            {classroom.name}
                        </label>
                    ))}
                </div>
                <button onClick={toggleAll}>{allChecked ? "Uncheck All" : "Check All"}</button>

                <div className={styles.timeSection}>
                    <h4 className={styles.colorFont}>Select Time Interval</h4>
                    <div className={styles.timeContainer}>
                        <div className={styles.iconWrapper} title="Click to open calendar">
                            <img
                                className={styles.clockIcon}
                                alt="Select Time Interval"
                                src={ClockIcon}
                                onClick={() => setShowCalendarOverlay(true)}
                                style={{cursor: "pointer"}}
                            />
                        </div>

                        {dateRange[0] && dateRange[1] && (
                            <div className={styles.dateInputs}>
                                <label className={styles.inputLabel}>Start Date</label>
                                <input
                                    type="date"
                                    value={dateRange[0] ? dateRange[0].toISOString().split("T")[0] : ""}
                                    onChange={(e) => setDateRange([new Date(e.target.value), dateRange[1]])}
                                    placeholder="Select Start Date"
                                    className={styles.dateInput}
                                />

                                <label className={styles.inputLabel}>End Date</label>
                                <input
                                    type="date"
                                    value={dateRange[1] ? dateRange[1].toISOString().split("T")[0] : ""}
                                    onChange={(e) => setDateRange([dateRange[0], new Date(e.target.value)])}
                                    placeholder="Select End Date"
                                    className={styles.dateInput}
                                />
                            </div>
                        )}

                        {handleTimeInputs() && (
                            <div className={styles.timeInputs}>
                                <label className={styles.inputLabel}>Start Time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    placeholder="hh:mm"
                                    className={styles.timeInput}
                                />

                                <label className={styles.inputLabel}>End Time</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    placeholder="hh:mm"
                                    className={styles.timeInput}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {showCalendarOverlay && (
                    <div className={styles.overlay2}>
                        <div className={styles.overlayContent2}>
                            <div className={styles.overlayHeader2}>
                                <h3>Select Date Range</h3>
                                <button className={styles.closeButton} onClick={() => setShowCalendarOverlay(false)}>
                                    <img src={CloseIcon} alt="Close" className={styles.closeIcon}/>
                                </button>
                            </div>
                            <DatePicker
                                selected={dateRange[0]}
                                onChange={handleDateChange}
                                startDate={dateRange[0]}
                                endDate={dateRange[1]}
                                selectsRange
                                inline
                            />

                            <button className={styles.saveButton} onClick={() => setShowCalendarOverlay(false)}>Save
                            </button>
                        </div>
                    </div>
                )}

                <div className={styles.buttonRow}>
                    <button
                        onClick={() =>
                            onSave(selectedClasses, {start: dateRange[0], end: dateRange[1], startTime, endTime})
                        }
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddClassesOverlay;