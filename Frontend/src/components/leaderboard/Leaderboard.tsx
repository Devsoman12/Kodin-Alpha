import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import styles from "./Leaderboard.module.css";
import Dropdown from "../dropDown/Dropdown";
import { useAuthStore } from "../../context/AuthContext";

const tabs = ["Daily", "Weekly", "Completed Problems", "Overall", "Classes"];

const Leaderboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState("Daily");
    const [leaderboardData, setLeaderboardData] = useState<{ rank: number, name: string, score: number, user_id: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [classOptions, setClassOptions] = useState<{ id: string, name: string }[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    interface Classroom {
        id: string;
        name: string;
    }

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            setError("");

            try {
                let response;
                let selectedData;

                if (activeTab === "Classes" && selectedClassId) {
                    response = await axios.post(
                        `http://localhost:5000/api/leaderboard/getClassStats`,
                        { classroomID: selectedClassId }
                    );                    
                    selectedData = response.data.classroomHonor.map((user: any) => ({
                        name: user.nick,
                        user_id: user.user_id,
                        score: user.classroom_honor
                    }));
                } else {
                    response = await axios.get("http://localhost:5000/api/leaderboard/getUserStats");
                    const data = response.data;
                    console.log(data);

                    if (activeTab === "Daily") {
                        selectedData = data.dailyStats.map((user: any) => ({
                            name: user.nick,
                            user_id: user.user_id,
                            score: user.daily_points
                        }));
                    } else if (activeTab === "Weekly") {
                        selectedData = data.weeklyStats.map((user: any) => ({
                            name: user.nick,
                            user_id: user.user_id,
                            score: user.weekly_points
                        }));
                    } else if (activeTab === "Completed Problems") {
                        selectedData = data.completedProblems.map((user: any) => ({
                            name: user.nick,
                            user_id: user.user_id,
                            score: user.completed_problems
                        }));
                    } else {
                        selectedData = data.overallStats.map((user: any) => ({
                            name: user.nick,
                            user_id: user.user_id,
                            score: user.overall_score
                        }));
                    }
                }

                const formattedData = selectedData.map((user: any, index: number) => ({
                    rank: index + 1,
                    name: user.name,
                    score: user.score,
                    user_id: user.user_id,
                }));

                setLeaderboardData(formattedData);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
                setError("Failed to load leaderboard.");
            }

            setLoading(false);
        };

        if (activeTab === "Classes" && selectedClassId) {
            fetchLeaderboard();
        } else if (activeTab !== "Classes") {
            fetchLeaderboard();
        }
    }, [activeTab, selectedClassId]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                if (!user || !user.userID) {
                    console.log("User ID is undefined:", user);
                    return;
                }

                const userId = encodeURIComponent(user.userID);
                console.log("Fetching classes for user ID:", userId);

                const response = await axios.post(`http://localhost:5000/api/classroom/getAllClassrooms`);

                console.log("API Response:", response.data);

                if (response.data.result && response.data.result.length > 0) {
                    const classes: Classroom[] = response.data.result;

                    setClassOptions(classes);

                    setSelectedClass(classes[0].name);
                    setSelectedClassId(classes[0].id);
                } else {
                    console.log("No classes found for user ID:", userId);
                    setClassOptions([]);
                }
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    console.error("Axios Error fetching classes:", error.response ? error.response.data : error.message);
                } else {
                    console.error("Unexpected Error fetching classes:", error);
                }
                setClassOptions([]);
            }
        };

        if (activeTab === "Classes") {
            fetchClasses();
        }
    }, [activeTab, user]);

    const handleNameClick = (userId: string) => {
        navigate(`/profilePage/${userId}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                {tabs.map((tab) => (
                    <div
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            {activeTab === "Classes" && (
                <Dropdown
                    label="Select Class"
                    options={classOptions.map((classroom) => classroom.name)}
                    selectedValue={selectedClass}
                    onSelect={(className) => {
                        setSelectedClass(className);
                        const selectedClassObj = classOptions.find((cls) => cls.name === className);
                        if (selectedClassObj) {
                            setSelectedClassId(selectedClassObj.id);
                        }
                    }}
                    isOpen={isDropdownOpen}
                    onToggle={() => setIsDropdownOpen((prev) => !prev)}
                />
            )}

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <div className={styles.leaderboard}>
                    <div className={styles.header}>
                        <span className={styles.rankCol}>#</span>
                        <span className={styles.nameCol}>Name</span>
                        <span className={styles.scoreCol}>Score</span>
                    </div>
                    {leaderboardData.length === 0 ? (
                        <p>No data available</p>
                    ) : (
                        leaderboardData.map((player) => (
                            <div key={player.rank} className={styles.row}>
                                <span className={styles.rankCol}>{player.rank}</span>
                                <span
                                    className={styles.nameCol}
                                    onClick={() => handleNameClick(player.user_id)}
                                >
                                    {player.name}
                                </span>
                                <span className={styles.scoreCol}>{player.score}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
