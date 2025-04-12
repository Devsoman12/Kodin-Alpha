import { FunctionComponent, useEffect, useState } from "react";
import { useClassContext } from "../../context/ClassroomContext";
import { useParams, Link, useNavigate } from "react-router-dom";
import styles from "./classBody.module.css";
import plusImage from "../../assets/plus.svg";
import CImage from "../../assets/c.svg";
import CodeImage from "../../assets/code.svg";
import CupImage from "../../assets/class_cup.svg";
import ClassProperties from "./ClassProperties";
import StudentFilter from "./StudentFilter";
import PoolOfStudents from "./PoolOfStudents";
import TaskPreview from "./TaskPreview";
import { useAuthStore } from "../../context/AuthContext";

const Trieda: FunctionComponent = () => {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const { getOneClass, classData, isLoading } = useClassContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuthStore();
  

  useEffect(() => {
    if (classroom_id) {
      getOneClass(classroom_id);
    }
  }, [classroom_id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/tasks/0/createTaskPage", {
      state: { classMode: true }
    });
  };

  return (
    <div className={styles.trieda}>
      <div className={styles.header}>
        <div className={styles.timeInterval}>
          <span>
            Working Hours:{" "}
            {isLoading ? "Loading..." : `${classData.start_time} - ${classData.end_time}`}
          </span>
        </div>
        <div className={styles.clock}>
          <span>{currentTime.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.leftSection}>
          <ClassProperties classId={classroom_id || "Unknown"} />
        </div>

        <div className={styles.centerSection}>
          <PoolOfStudents />
        </div>

        <div className={styles.rightSection}>
        {user?.role === 'teacher' && (
          <StudentFilter
              onFilterChange={(filters) => {
                console.log("Filters updated:", filters);
              }}
            />
          )}
          <TaskPreview/>
        </div>
      </div>

      <div className={styles.actionContainer}>
        <div className={styles.buttonSection}>
          <Link to={`/lists/${classData.list_id}/listOfTasksPage/${classroom_id}`} className={styles.actionButton}>
            <img alt="Tasks" src={CodeImage} className={styles.svgIcon}/>
          </Link>

          <div onClick={handleNavigation} className={styles.actionButton}>
            <img alt="Add Task" src={plusImage} className={styles.svgIcon}/>
          </div>

          <Link to="/leaderBoardPage" className={styles.actionButton}>
            <img alt="Class Leaderboard" src={CupImage} className={styles.svgIcon}/>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Trieda;
