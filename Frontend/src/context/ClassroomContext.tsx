import React, { createContext, useState, useContext, ReactNode, FunctionComponent } from 'react';
import axios from 'axios';

// Define the type for the class data and interval
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

interface ClassData {
  classroom_id: string;
  name: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
  subject: string;
  user_id: number;
  students: StudentData[]; // Updated to use StudentData interface
  list_id: string;
}

interface ClassContextType {
  classData: ClassData;
  setClassData: React.Dispatch<React.SetStateAction<ClassData>>;
  getOneClass: (class_id: string) => Promise<void>;
  error: string | null;
  isLoading: boolean;
  classList: ClassData[];
  status: boolean;
  setStatus: React.Dispatch<React.SetStateAction<boolean>>;
  interval: string;  // Added interval state
  setInterval: React.Dispatch<React.SetStateAction<string>>; // Method to update interval
  fetchInterval: (classroom_id: string) => Promise<void>;  // Method to fetch interval
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const useClassContext = (): ClassContextType => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClassContext must be used within a ClassProvider');
  }
  return context;
};

// ClassProvider component to provide context to children
interface ClassProviderProps {
  children: ReactNode;
}

export const ClassProvider: FunctionComponent<ClassProviderProps> = ({ children }) => {
  const [classData, setClassData] = useState<ClassData>({
    classroom_id: '',
    name: '',
    start_time: '',
    end_time: '',
    day_of_week: '',
    students: [],
    subject: '',
    user_id: 0,  // Initialize user_id
    list_id: '',
  });

  const [classList, setClassList] = useState<ClassData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<boolean>(false);
  const [interval, setInterval] = useState<string>('');  // Added interval state

  const getOneClass = async (class_id: string) => {
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await axios.post('http://localhost:5000/api/classroom/getOneClass', { class_id });
  
      if (response.data.status !== "true") {
        throw new Error("Invalid class data received");
      }
  
      const classInfo = response.data.class;
  
      // Directly set the students data as per the StudentData interface
      const students: StudentData[] = classInfo.students || [];
  
      // Update classData state
      setClassData({
        classroom_id: classInfo.classroom_id,
        name: classInfo.name,
        start_time: classInfo.start_time,
        end_time: classInfo.end_time,
        day_of_week: classInfo.day_of_week,
        subject: classInfo.subject,
        user_id: classInfo.user_id,
        students,  // Directly assigning the students as an array of StudentData
        list_id: classInfo.list_id
      });
  
      setStatus(true);
    } catch (error: any) {
      setError(`Error fetching class: ${error.message || 'Something went wrong'}`);
      setStatus(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch interval data for a specific class
  const fetchInterval = async (classroom_id: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/classroom/interval', {
        params: { classroom_id },
      });

      if (response.data.status === 'success') {
        const { start_time, end_time } = response.data;
        setInterval(`${formatTime(start_time)} - ${formatTime(end_time)}`);
      } else {
        setInterval('Not Available');
      }
    } catch (error: any) {
      setError('Error loading interval');
    } finally {
      setIsLoading(false);
    }
  };

  // Utility function to format time (e.g., "14:00:00" -> "2:00 PM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const isPM = hours >= 12;
    const formattedHours = hours % 12 || 12;
    const suffix = isPM ? "PM" : "AM";
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${suffix}`;
  };

  return (
    <ClassContext.Provider
      value={{
        classData,
        setClassData,
        getOneClass,
        error,
        isLoading,
        classList,
        status,
        setStatus,
        interval,  // Pass interval state
        setInterval, // Pass setInterval method
        fetchInterval,  // Pass fetchInterval method
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};
