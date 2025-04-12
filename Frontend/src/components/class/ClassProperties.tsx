import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ClassProperties.module.css';
import { useLocation } from "react-router-dom";
import { useAuthStore } from '../../context/AuthContext';

interface ClassProperty {
    id: string;
    label: string;
    value: string;
}

interface ClassPropertiesProps {
    classId: string;
}

const ClassProperties: React.FC<ClassPropertiesProps> = ({ classId }) => {
    const [properties, setProperties] = useState<ClassProperty[]>([
        { id: 'class_name', label: 'Class Name', value: '' },
        { id: 'class_subject', label: 'Subject', value: '' },
        { id: 'teacher_name', label: 'Class Teacher', value: '' },
    ]);
    const location = useLocation();

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const { user } = useAuthStore();

    useEffect(() => {
        if (location.state?.editMode) {
            setIsEditing(true);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const classroom_id = classId;
                const response = await axios.post(`http://localhost:5000/api/classroom/getClassProperties`, { classroom_id });
                const data = response.data.data;

                if (data) {
                    setProperties((prev) =>
                        prev.map((prop) => ({
                            ...prop,
                            value: data[prop.id] || '',
                        }))
                    );
                    console.log(properties);
                } else {
                    console.error('Properties data is missing or malformed.');
                }
            } catch (error) {
                console.error('Error fetching class properties:', error);
            }
        };

        fetchProperties();
    }, [classId]);

    const handlePropertyChange = (id: string, value: string) => {
        setProperties((prev) =>
            prev.map((prop) => (prop.id === id ? { ...prop, value } : prop))
        );
    };

    const saveProperties = async () => {
        try {
            const class_name = properties.find(prop => prop.id === 'class_name')?.value || '';
            const class_subject = properties.find(prop => prop.id === 'class_subject')?.value || '';

            const response = await axios.post('http://localhost:5000/api/classroom/updateClassProperties', {
                classroom_id: classId,
                class_name,
                class_subject,
            });

            if (response.status === 200) {
                setIsEditing(false);
            } 
        } catch (error) {
            console.error('Error saving class properties:', error);
        }
    };

    return (
        <div className={styles.classProperties}>
            <div className={styles.header}>
                <h2>Class Properties</h2>
                {user!.role === 'teacher' && (
                    <button
                        onClick={() => setIsEditing((prev) => !prev)}
                        className={styles.editButton}
                    >
                        {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                )}
            </div>
            <div className={styles.propertiesList}>
                {properties.map((property) => (
                    <div key={property.id} className={styles.propertyItem}>
                        <label className={styles.label}>{property.label}</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={property.value}
                                onChange={(e) => handlePropertyChange(property.id, e.target.value)}
                                className={styles.input}
                                maxLength={75}
                            />
                        ) : (
                            <span className={styles.value}>{property.value}</span>
                        )}
                    </div>
                ))}
            </div>
            {isEditing && (
                <button onClick={saveProperties} className={styles.saveButton}>
                    Save
                </button>
            )}
        </div>
    );
};

export default ClassProperties;
