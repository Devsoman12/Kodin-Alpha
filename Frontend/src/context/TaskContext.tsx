import React, { createContext, useState, useContext, ReactNode, FunctionComponent } from 'react';
import axios from 'axios';

// Define the type for the task data
interface TaskData {
  problem_type: string;
  task_id: string;
  author_nickname: string;
  title: string;
  difficulty: string;
  programming_language: string;
  description: string;
  is_verified: boolean; 
  languages: {
    [key: string]: {
      initial_code: string;
      solution_code: string;
      unit_test_code: string;
    };
  };
  classrooms: number[];
  startDate: string | null;  // Adjusted field for start date
  lockDate: string | null;   // Adjusted field for end/lock date
}


interface TaskContextType {
  taskData: TaskData;
  setTaskData: React.Dispatch<React.SetStateAction<TaskData>>;
  createTask: () => Promise<boolean>;
  getOneTask: (task_id: string) => Promise<void>;
  getAllTasks: () => Promise<void>;
  runTaskCode: (code: string, programming_language: string, task_id: string) => Promise<void>;
  submitSolution: (code: string, programming_language: string, task_id: string, classroom_id: string) => Promise<boolean>;
  editTask: () => Promise<boolean>;
  error: string | null;
  isLoading: boolean;
  terminalOutput: string;
  taskList: TaskData[];
  setTerminalOutput: React.Dispatch<React.SetStateAction<string>>;
  status: boolean;
  setStatus: React.Dispatch<React.SetStateAction<boolean>>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: FunctionComponent<TaskProviderProps> = ({ children }) => {
  const [taskData, setTaskData] = useState<TaskData>({
    problem_type: '',
    task_id: '',
    author_nickname: '',
    title: '',
    difficulty: '',
    programming_language: '',
    description: '',
    is_verified: false, 
    languages: {},
    classrooms: [],
    startDate: null,  // Adjusted field name
    lockDate: null,   // Adjusted field name
  });
  
  const [taskList, setTaskList] = useState<TaskData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [status, setStatus] = useState<boolean>(false);

  // Fetch Task Data
  const getOneTask = async (task_id: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/taskHandler/getOneTask', { task_id });

      const task = response.data.task;

      // Adjusted field names for the updated response
      const updatedTaskData = {
        ...task,
        startDate: task.startDate || null,  // Adjusted field name
        lockDate: task.lockDate || null,    // Adjusted field name
      };

      setTaskData(updatedTaskData);
      setStatus(response.data.status === 'true');
    } catch (error: any) {
      setError(`Error fetching task: ${error.message || 'Something went wrong'}`);
      setStatus(false);
    } finally {
      setIsLoading(false);
    }
  };

  const editTask = async (): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/taskHandler/editTask', taskData);
      if (response.data.status === "true") {
        return true; // Return success
      }
      return false;
    } catch (error) {
      setError('Error updating task.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/taskHandler/addTask', taskData);
      if (response.data.status === "true") {
        return true; // Return success
      }
      return false;
    } catch (error) {
      setError('Error creating task.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllTasks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/taskHandler/getTasks');
      setTaskList(response.data.tasks);
      setStatus(response.data.status === 'true');
    } catch (error: any) {
      setError(`Error fetching tasks: ${error.message || 'Something went wrong'}`);
      setStatus(false);
    } finally {
      setIsLoading(false);
    }
  };

  const submitSolution = async (code: string, programming_language: string, task_id: string, classroom_id: string): Promise<boolean> => {
    if (!code || !programming_language || !task_id) {
      setTerminalOutput('Missing required parameters for submission.');
      setStatus(false);
      return false;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/solutionHandler/submitSolution', {
        code,
        programming_language,
        task_id,
        classroom_id,
      });

      if (response.data.status === 'true') {
        setTerminalOutput(response.data.message || 'Solution submitted successfully.');
        setStatus(true);
        return true;  // Success
      } else {
        setTerminalOutput(response.data.output);
        setStatus(false);
        return false;  // Failure
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      setTerminalOutput('An error occurred while submitting the solution.');
      setStatus(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const runTaskCode = async (code: string, programming_language: string, task_id: string) => {
    setIsLoading(true);
    setTerminalOutput('Running the code...');
    try {
      const response = await axios.post('http://localhost:5000/api/taskHandler/runCode', {
        code,
        programming_language,
        task_id,
      });

      const cleanedOutput = cleanOutput(response.data.output || 'Execution completed without output.');
      setTerminalOutput(cleanedOutput);
      setStatus(response.data.status === 'true');
    } catch (error) {
      setTerminalOutput('An error occurred while running the code.');
      setStatus(false);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanOutput = (output: string): string => {
    return output;
  };

  return (
      <TaskContext.Provider
          value={{
            taskData,
            setTaskData,
            createTask,
            editTask,
            getOneTask,
            getAllTasks,
            runTaskCode,
            submitSolution,
            error,
            isLoading,
            terminalOutput,
            taskList,
            setTerminalOutput,
            status,
            setStatus,
          }}
      >
        {children}
      </TaskContext.Provider>
  );
};
