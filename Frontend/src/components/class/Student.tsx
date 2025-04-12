import React, { useEffect, useState } from "react";
import styles from "./Student.module.css";
import EditOptions from "../dropDown/EditOptions";
import CloseImage from "../../assets/close.svg";
import axios from "axios";
import ErrorNotification from "../overlay/ErrorNotification";


interface StudentProps {
    id: number;
    name: string;
    rank: string;
    totalHonor: number;
    x: number;
    y: number;
    size: number;
    notes: string[];
    onClick: (id: string) => void;
    onNoteAdd: (id: number, note: string) => void;
    onNoteUpdate: (id: number, noteIndex: number, newNote: string) => void;
    onNoteDelete: (id: number, note: string) => void;
    onRemoveStudent: (id: number) => void;
}


const Student: React.FC<StudentProps> = ({
                                             id,
                                             name,
                                             rank,
                                             totalHonor,
                                             x,
                                             y,
                                             size,
                                             notes,
                                             onClick,
                                             onNoteAdd,
                                             onNoteUpdate,
                                             onNoteDelete,
                                             onRemoveStudent,
                                         }) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const [noteInput, setNoteInput] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editInput, setEditInput] = useState("");
    const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>(""); // Success message state
    const [isBadgeSectionOpen, setIsBadgeSectionOpen] = useState(false);
    const toggleBadgeSection = () => {
        setIsBadgeSectionOpen((prev) => !prev);
    };

    const [selectedColor, setSelectedColor] = useState<string>("blue");
    const colorOptions = ["red", "blue", "green", "yellow", "purple"];

    const handleColorChange = (color: string) => {
        setSelectedColor(color);
    };

    const badgeOptions = ["Verifier", "Bug Hunter", "Mentor", "Achiever", "Contributor"];

    const [selectedBadges, setSelectedBadges] = useState<string[]>([]);


        // Fetch the student's existing badges when component mounts
    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const response = await axios.post(`http://localhost:5000/api/badgeHandler/getUserBadges`, {user_id: id});
                const badgeNames = response.data.badges.map((badge: { badge_name: any; }) => badge.badge_name);
                setSelectedBadges(badgeNames); // Set the badge names only
            } catch (error) {
                console.error('Error fetching badges:', error);
            }
        };
            fetchBadges();
    }, []); 
    
    const handleBadgeToggle = (badge: string) => {
            setSelectedBadges((prev) =>
                prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
            );
    };

    const handleUpdateBadges = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/badgeHandler/updateUserBadges", {
                badge_names: selectedBadges,
                user_id: id
            });
            if (response.data.success) {
                setSuccessMessage("Badges.md updated successfully!"); // Show success message
            } else {
                setSuccessMessage("Error getting Badges.md"); // Show success message
            }
        } catch (error) {
            setSuccessMessage("Error getting Badges.md"); // Show success message
        }
    };

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded((prev) => !prev);
    };

    const handleCloseExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(false);
    };

    const handleAddNote = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (noteInput.trim() === "") return;
        onNoteAdd(id, noteInput);
        setNoteInput("");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        setNoteInput(e.target.value);
    };

    const handleEditNote = (index: number) => {
        setEditingIndex(index);
        setEditInput(notes[index]);
        setDropdownVisible(null); // Close the dropdown when editing starts
    };

    const handleUpdateNote = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (editingIndex !== null && editInput.trim() !== "") {
            onNoteUpdate(id, editingIndex, editInput);
            setEditingIndex(null);
            setEditInput("");
        }
    };

    const handleDeleteNote = (note: string) => {
        onNoteDelete(id, note);
        setDropdownVisible(null);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditInput(e.target.value);
    };

    const getInitials = (fullName: string): string => {
        const nameParts = fullName.split(" ");
        return nameParts.map((part) => part[0]?.toUpperCase()).join("");
    };

    return (
        <div
            className={`${styles.student}  ${isExpanded ? styles.expanded : ""}`}
            style={{
                transform: `translate(${x}px, ${y}px)`,
                width: size,
                height: size,
                zIndex: isExpanded ? 999 : 1,
                backgroundColor: selectedColor,
            }}
            onClick={handleToggleExpand}
        >
            {successMessage && (
                <ErrorNotification message={successMessage} onClose={() => setSuccessMessage('')} />)}


            <div className={styles.profileCircle}>
                <span className={styles.initials}>{getInitials(name)}</span>
            </div>


            {isExpanded && (


                <div
                    className={styles.details}
                    onClick={(e) => e.stopPropagation()}
                >

                    <button
                        className={styles.closeButton}
                        onClick={handleCloseExpand}
                        style={{
                            marginLeft: 'auto',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0',
                            display: 'flex'
                        }}
                    >
                        <img src={CloseImage} alt="Close"/>
                    </button>


                    <button
                        className={styles.removeButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to remove ${name}?`)) {
                                onRemoveStudent(id);
                            }
                        }}
                    >
                        Remove Student
                    </button>

                    <div>
                        <select
                            value={selectedColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                        >
                            {colorOptions.map((color) => (
                                <option key={color} value={color}>
                                    {color}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.badgeSection}>
                        <button className={styles.badgeToggleButton} onClick={toggleBadgeSection}>
                            {isBadgeSectionOpen ? "Hide Badges.md ▲" : "Show Badges.md ▼"}
                        </button>
                        <div className={`${styles.badgeContent} ${isBadgeSectionOpen ? styles.open : styles.closed}`}>
                            <div className={styles.badgeList}>
                                {badgeOptions.map((badge) => (
                                    <label key={badge} className={styles.badgeItem}>
                                        <input
                                            type="checkbox"
                                            checked={selectedBadges.includes(badge)}
                                            onChange={() => handleBadgeToggle(badge)}
                                        />
                                        {badge}
                                    </label>
                                ))}
                            </div>
                            <button className={styles.updateBadgeButton} onClick={handleUpdateBadges}>
                                Update Badges
                            </button>
                        </div>
                    </div>


                    <p>
                        <strong>Name:</strong> {name}
                    </p>
                    <p>
                        <strong>Rank:</strong> {rank}
                    </p>
                    <p>
                        <strong>Total Honor:</strong> {totalHonor}
                    </p>
                    <h4>Notes:</h4>
                    <div className={styles.notesSection}>
                        {notes.map((note, index) => (
                            <div key={index} className={styles.noteItem}>
                                {editingIndex === index ? (
                                    <div className={styles.editSection}>
                                        <input
                                            type="text"
                                            value={editInput}
                                            onChange={handleEditInputChange}
                                            className={styles.editInput}
                                        />
                                        <button
                                            onClick={handleUpdateNote}
                                            className={styles.saveButton}
                                        >
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.noteContainer}>
                                        <div className={styles.noteContent}>
                                            <span>{note}</span>
                                        </div>

                                        <div className={styles.noteEdit}>
                                            <EditOptions
                                                messageString={note}
                                                index={index}
                                                onEdit={handleEditNote}
                                                onDelete={handleDeleteNote}

                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className={styles.addNoteSection}>
                        <input
                            type="text"
                            placeholder="Add a note..."
                            value={noteInput}
                            onChange={handleInputChange}
                            className={styles.noteInput}
                        />
                        <button
                            onClick={handleAddNote}
                            className={styles.addNoteButton}
                        >
                            Add Note
                        </button>
                    </div>
                </div>
            )
            }
        </div>
    )
        ;
};

export default Student;
