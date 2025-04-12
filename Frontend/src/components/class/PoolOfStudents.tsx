import React, {useState, useEffect, useRef} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Student from "./Student";
import styles from "./PoolOfStudents.module.css";
import StudentSearchBar from "./StudentSearchBar";
import { useClassContext } from "../../context/ClassroomContext";

import { useDrag } from "react-dnd";
import { motion } from "framer-motion";

interface Note {
    note_id: number;
    note_text: string;
    date: string;
}

interface StudentData {
    id: number;
    name: string;
    rank: string;
    totalhonor: number;
    notes: Note[];
}

interface Position {
    x: number;
    y: number;
}

const PoolOfStudents: React.FC = () => {
    const {classroom_id} = useParams<{ classroom_id: string }>();
    const [students, setStudents] = useState<StudentData[]>([]);
    const { getOneClass, classData, isLoading } = useClassContext();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(0);
    const [hoveredStudent, setHoveredStudent] = useState<{ id: number; name: string } | null>(null);
    const originalPositions = useRef<{ [id: number]: Position }>({});
    const [isDragging, setIsDragging] = useState(false);
    const [allBubblePositions, setAllBubblePositions] = useState<{ [id: number]: Position }>({});
    const [draggedBubbleId, setDraggedBubbleId] = useState<number | null>(null);
    const draggingBubble = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);
    const filteredStudents = students.filter((student) =>
        new RegExp(searchQuery, "i").test(student.name)
    );

    const [bubblePositions, setBubblePositions] = useState<{ [id: number]: { x: number; y: number } }>(
        () => {
            const initialPositions: { [id: number]: { x: number; y: number } } = {};
            students.forEach((student, index) => {
                initialPositions[student.id] = positions[index];
            });
            return initialPositions;
        }
    );

    const poolRadius = 200;
    const studentsPerPage = 27;
    const paginatedStudents = filteredStudents.slice(
        currentPage * studentsPerPage,
        (currentPage + 1) * studentsPerPage
    );
    const positions = paginatedStudents.map((student) => allBubblePositions[student.id] || { x: 0, y: 0 });

    const minBubbleSize = 40;
    const maxBubbleSize = 60;
    const bubbleSize = Math.max(minBubbleSize, Math.min(maxBubbleSize, 50));

    useEffect(() => {
        if (classroom_id) {
            getOneClass(classroom_id);
        }
    }, [classroom_id]);

    useEffect(() => {
        if (classData.students && classData.students !== students) {
            setStudents(classData.students);
            console.log(classData.students);
        }
    }, [classData.students]);


    const handleRemoveStudent = async (studentId: number) => {
        try {
            console.log(`Removing student with ID: ${studentId}`);
            const response = await axios.post("http://localhost:5000/api/classroom/removeStudentFromClassroom", {
                classroom_id,
                user_id: studentId,
            });

            console.log("API Response:", response.data);

            if (response.data.status === "success") {
                console.log("Student removed successfully.");
                setStudents((prevStudents) => prevStudents.filter(student => student.id !== studentId));
            } else {
                console.error("Failed to remove student:", response.data.message);
            }
        } catch (error) {
            console.error("Error removing student:", error);
        }
    };

    const handleNoteAdd = async (id: number, note: string) => {
        try {
            const response = await axios.post("http://localhost:5000/api/classroom/addNoteToStudent", {
                note_text: note,
                classroom_id,
                user_id: id,
            });

            if (response.data.status === "success") {
                console.log("Note added successfully.");
                setStudents((prevStudents) =>
                    prevStudents.map((student) =>
                        student.id === id
                            ? {
                                ...student,
                                notes: [
                                    ...student.notes,
                                    {
                                        note_id: Date.now(),
                                        note_text: note,
                                        date: new Date().toISOString(),
                                    },
                                ],
                            }
                            : student
                    )
                );
            } else {
                console.error("Failed to add note:", response.data.message);
            }
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    const handleNoteUpdate = async (studentId: number, noteIndex: number, newNoteText: string) => {
        const student = students.find((s) => s.id === studentId);
        if (!student) {
            console.error("Student not found.");
            return;
        }

        const note = student.notes[noteIndex];
        if (!note) {
            console.error("Note not found.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/classroom/updateNoteForStudent", {
                note_id: note.note_id,
                user_id: studentId,
                note_text: newNoteText,
                classroom_id,
            });

            if (response.data.status === "success") {
                console.log("Note updated successfully.");

                setStudents((prevStudents) =>
                    prevStudents.map((s) =>
                        s.id === studentId
                            ? {
                                ...s,
                                notes: s.notes.map((n, index) =>
                                    index === noteIndex ? {...n, note_text: newNoteText} : n
                                ),
                            }
                            : s
                    )
                );
            } else {
                console.error("Failed to update note:", response.data.message);
            }
        } catch (error) {
            console.error("Error updating note:", error);
        }
    };

    const handleNoteDelete = async (userId: number, note_text: string) => {
        console.log("Deleting note:", {userId, note_text});

        try {
            const response = await axios.post("http://localhost:5000/api/classroom/deleteNoteFromStudent", {
                note_text,
                classroom_id,
                user_id: userId,
            });

            if (response.data.status === "success") {
                console.log("Note deleted successfully.");
                setStudents((prevStudents) =>
                    prevStudents.map((student) =>
                        student.id === userId
                            ? {
                                ...student,
                                notes: student.notes.filter((note) => note.note_text !== note_text),
                            }
                            : student
                    )
                );
            } else {
                console.error("Failed to delete note:", response.data.message);
            }
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    // -----------------------------


    const handleSearchChange = (query: string) => {
        const sanitizedQuery = query.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");
        setSearchQuery(sanitizedQuery);  // Nastavíme čistý, escapovaný query
        setCurrentPage(0);
    };


    const keepWithinCircle = (x: number, y: number) => {
        const centerX = poolRadius - 220;
        const centerY = poolRadius - 220;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

        // Ensure the distance is less than the radius minus half the bubble size
        if (distance > poolRadius - bubbleSize / 2) {
            const angle = Math.atan2(y - centerY, x - centerX);
            return {
                x: centerX + (poolRadius - bubbleSize / 2) * Math.cos(angle),
                y: centerY + (poolRadius - bubbleSize / 2) * Math.sin(angle),
            };
        }

        return { x, y };
    };


    const calculatePositions = (
        students: StudentData[],
        poolRadius: number,
        bubbleSize: number
    ): Position[] => {
        const radiusConst = 1.5;
        const positions: Position[] = [];
        const centerX = poolRadius - 200;
        const centerY = poolRadius - 200;

        let radius = bubbleSize * radiusConst;
        let studentsInRing = Math.floor((2 * Math.PI * radius) / bubbleSize);

        let currentIndex = 0;
        const totalStudents = students.length;

        while (currentIndex < totalStudents) {
            for (let i = 0; i < studentsInRing && currentIndex < totalStudents; i++, currentIndex++) {
                const angle = (2 * Math.PI * i) / studentsInRing;
                positions.push({
                    x: centerX + radius * Math.cos(angle) - bubbleSize / 2,
                    y: centerY + radius * Math.sin(angle) - bubbleSize / 2,
                });
            }
            radius += bubbleSize * radiusConst;
            studentsInRing = Math.floor((2 * Math.PI * radius) / bubbleSize);
        }

        return positions;
    };

    useEffect(() => {
        if (students.length > 0) {
            const filteredStudents = paginatedStudents;
            const positions = calculatePositions(filteredStudents, poolRadius, bubbleSize);

            const positionsMap: { [id: number]: Position } = {};
            filteredStudents.forEach((student, index) => {
                positionsMap[student.id] = positions[index];
            });

            setBubblePositions(positionsMap);
        }
    }, [students, currentPage, poolRadius, bubbleSize, searchQuery]);




    const handleMouseDown = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setIsDragging(true);
        setDraggedBubbleId(id);
        originalPositions.current = { ...bubblePositions };

        const offsetX = e.clientX - bubblePositions[id].x;
        const offsetY = e.clientY - bubblePositions[id].y;

        draggingBubble.current = { id, offsetX, offsetY };
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!draggingBubble.current) return;

        const { id, offsetX, offsetY } = draggingBubble.current;

        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;

        const { x, y } = keepWithinCircle(newX, newY);

        setBubblePositions((prev) => {
            let updatedBubbles = { ...prev, [id]: { x, y } };

            updatedBubbles = adjustPositionsForCollision(updatedBubbles, bubbleSize);

            Object.keys(updatedBubbles).forEach((key) => {
                const bubbleId = Number(key);
                if (bubbleId !== id) {
                    const originalPos = originalPositions.current[bubbleId];
                    const currentPos = updatedBubbles[bubbleId];

                    if (originalPos) {
                        updatedBubbles[bubbleId] = {
                            x: currentPos.x + (originalPos.x - currentPos.x) * 0.1,
                            y: currentPos.y + (originalPos.y - currentPos.y) * 0.1,
                        };
                    }
                }
            });

            return updatedBubbles;
        });

        // requestAnimationFrame(() => handleMouseMove(e));
    };

    const handleMouseUp = () => {
        draggingBubble.current = null;
        setIsDragging(false);

        setBubblePositions((prev) => {
            let updatedBubbles = { ...prev };

            if (draggedBubbleId !== null) {
                const draggedBubblePos = prev[draggedBubbleId];
                updatedBubbles[draggedBubbleId] = draggedBubblePos;
                updatedBubbles = adjustPositionsForCollision(updatedBubbles, bubbleSize);
            }

            return updatedBubbles;
        });
    };

    const handleTouchEnd = () => {
        draggingBubble.current = null;
        setIsDragging(false);

        setBubblePositions((prev) => {
            let updatedBubbles = { ...prev };

            if (draggedBubbleId !== null) {
                const draggedBubblePos = prev[draggedBubbleId];
                updatedBubbles[draggedBubbleId] = draggedBubblePos;
                updatedBubbles = adjustPositionsForCollision(updatedBubbles, bubbleSize);
            }

            return updatedBubbles;
        });
    };

    const handleTouchStart = (e: React.TouchEvent, id: number) => {
        const nativeEvent = e.nativeEvent as TouchEvent;

        nativeEvent.stopPropagation();
        nativeEvent.preventDefault();
        console.log("Touch Start", nativeEvent);

        setIsDragging(true);
        setDraggedBubbleId(id);

        originalPositions.current = { ...bubblePositions };

        const touch = nativeEvent.touches[0];
        const offsetX = touch.clientX - bubblePositions[id].x;
        const offsetY = touch.clientY - bubblePositions[id].y;

        draggingBubble.current = { id, offsetX, offsetY };
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!draggingBubble.current) return;
        e.preventDefault();  // Prevent scrolling when dragging
        const { id, offsetX, offsetY } = draggingBubble.current;

        const touch = e.touches[0];
        const newX = touch.clientX - offsetX;
        const newY = touch.clientY - offsetY;

        const { x, y } = keepWithinCircle(newX, newY);

        setBubblePositions((prev) => {
            let updatedBubbles = { ...prev, [id]: { x, y } };

            updatedBubbles = adjustPositionsForCollision(updatedBubbles, bubbleSize);

            Object.keys(updatedBubbles).forEach((key) => {
                const bubbleId = Number(key);
                if (bubbleId !== id) {
                    const originalPos = originalPositions.current[bubbleId];
                    const currentPos = updatedBubbles[bubbleId];

                    if (originalPos) {
                        updatedBubbles[bubbleId] = {
                            x: currentPos.x + (originalPos.x - currentPos.x) * 0.1,
                            y: currentPos.y + (originalPos.y - currentPos.y) * 0.1,
                        };
                    }
                }
            });

            return updatedBubbles;
        });

        // requestAnimationFrame(() => handleTouchMove(e));  // Recurse with requestAnimationFrame for smooth animation
    };


    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);



    const checkCollision = (bubbleA: Position, bubbleB: Position, bubbleSize: number) => {
        const distance = Math.sqrt((bubbleA.x - bubbleB.x) ** 2 + (bubbleA.y - bubbleB.y) ** 2);
        const combinedRadius = bubbleSize;
        return distance < combinedRadius;
    };

    const adjustPositionsForCollision = (bubbles: { [id: number]: Position }, bubbleSize: number) => {
        const adjustedBubbles = { ...bubbles };

        Object.keys(adjustedBubbles).forEach((id) => {
            const posA = adjustedBubbles[parseInt(id)];

            if (!posA) return;

            if (id === draggedBubbleId?.toString()) return;

            Object.keys(adjustedBubbles).forEach((otherId) => {
                if (id !== otherId) {
                    const posB = adjustedBubbles[parseInt(otherId)];


                    if (!posB) return;

                    if (checkCollision(posA, posB, bubbleSize)) {
                        const dx = posB.x - posA.x;
                        const dy = posB.y - posA.y;
                        let distance = Math.sqrt(dx ** 2 + dy ** 2);
                        if (distance === 0) distance = 1;

                        const overlap = bubbleSize - distance;
                        const moveX = (overlap * dx) / distance / 2;
                        const moveY = (overlap * dy) / distance / 2;

                        adjustedBubbles[parseInt(id)] = keepWithinCircle(posA.x - moveX, posA.y - moveY);
                        adjustedBubbles[parseInt(otherId)] = keepWithinCircle(posB.x + moveX, posB.y + moveY);
                    }
                }
            });
        });

        return adjustedBubbles;
    };



    useEffect(() => {
        if (!isDragging) {
            const animationInterval = setInterval(() => {
                setBubblePositions((prev) => {
                    let isChanged = false;
                    let updatedPositions = { ...prev };

                    Object.keys(prev).forEach((id) => {
                        const bubbleId = parseInt(id);
                        if (bubbleId === draggedBubbleId) return; // Ignorujeme ťahanú bublinu

                        const originalPos = originalPositions.current[bubbleId];
                        const currentPos = prev[bubbleId];

                        if (originalPos) {
                            const deltaX = originalPos.x - currentPos.x;
                            const deltaY = originalPos.y - currentPos.y;

                            if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
                                updatedPositions[bubbleId] = {
                                    x: currentPos.x + deltaX * 0.1,
                                    y: currentPos.y + deltaY * 0.1,
                                };
                                isChanged = true;
                            }
                        }
                    });
                    if (!isChanged) {
                        clearInterval(animationInterval); // Keď sa všetky bubliny vrátia, zastav animáciu
                    }

                    return updatedPositions;
                });
            }, 20);

            return () => clearInterval(animationInterval);
        }
    }, [isDragging, draggedBubbleId]);


    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Students in Class {classroom_id}</h2>
            <StudentSearchBar value={searchQuery} onChange={handleSearchChange} placeholder="Search students..."/>

            <div className={styles.pool}>
                {paginatedStudents.map((student, index) => (
                    <div
                        key={student.id}
                        className={styles.studentWrapper}
                        onMouseEnter={() => setHoveredStudent({id: student.id, name: student.name})}
                        onMouseLeave={() => setHoveredStudent(null)}
                        onMouseDown={(e) => handleMouseDown(e, student.id)}
                        onTouchStart={(e) => handleTouchStart(e, student.id)}  // Added touchstart handler
                    >

                        <Student
                            id={student.id}
                            name={student.name}
                            rank={student.rank}
                            totalHonor={student.totalhonor}
                            x={bubblePositions[student.id]?.x || positions[index]?.x || 0}
                            y={bubblePositions[student.id]?.y || positions[index]?.y || 0}
                            size={bubbleSize}
                            notes={student.notes.map((note) => note.note_text)}
                            onClick={() => console.log(`Student ${student.id} clicked`)}
                            onNoteAdd={handleNoteAdd}
                            onNoteUpdate={handleNoteUpdate}
                            onNoteDelete={handleNoteDelete}
                            onRemoveStudent={handleRemoveStudent}
                        />

                        {hoveredStudent?.id === student.id && (
                            <div
                                className={`${styles.tooltip} ${hoveredStudent ? styles.show : ''}`}
                                style={{
                                    left: `${positions[index]?.x + bubbleSize / 2 + 175}px`,
                                    top: `${positions[index]?.y - bubbleSize / 2 + 240}px`,
                                }}
                            >
                                {student.name}
                            </div>
                        )}



                    </div>
                ))}
            </div>
            <div className={styles.pagination}>
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))} disabled={currentPage === 0}>
                    -
                </button>
                <span>
                    Page {currentPage + 1} of{" "}
                    {Math.ceil(filteredStudents.length / studentsPerPage)}
                </span>
                <button
                    onClick={() =>
                        setCurrentPage((prev) =>
                            Math.min(prev + 1, Math.ceil(filteredStudents.length / studentsPerPage) - 1)
                        )
                    }
                    disabled={currentPage >= Math.ceil(filteredStudents.length / studentsPerPage) - 1}
                >
                    +
                </button>
            </div>
        </div>
    );
}

export default PoolOfStudents;
