import React, { useEffect, useState } from 'react';
import styles from './Solutions.module.css';
import SolutionBox from './SolutionsBox';
import SearchBar from '../searchbar/SearchBar';
import { useParams } from 'react-router-dom';
import CommentOverlay from '../overlay/CommentOverlay';
import axios from "axios";


interface Solution {
  solution_id: number;
  user_id: number;
  votes: number;
  code: string;
  author_nickname: string;
  comment_count: number;
  successfultests: number;
  totaltests: number;
}

const Solutions: React.FC = () => {
  const { task_id } = useParams<{ task_id: string }>();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSolutionId, setSelectedSolutionId] = useState<number | null>(null);

  // Mock Data (Since API is removed)
  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/solutionHandler/getAllSolutionsForTask', { task_id, classroom_id});
        if (response.data.status === "true") {
          console.log(response.data.solutions);
          setSolutions(response.data.solutions);
        } else {
          console.error('Failed to fetch solutions:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching solutions:', error);
      }
    };

    fetchSolutions();
  }, [task_id]);

  const handleSolutionClick = (solutionId: number) => {
    setSelectedSolutionId(solutionId);
  };

  const handleCloseOverlay = () => {
    setSelectedSolutionId(null);
  };

  return (
      <div className={styles.solutionsPage}>
        <div className={styles.solutionsContainer}>
          <div className={styles.solutionsHeader}>
            <b className={styles.title}>Solutions</b>
          </div>

          <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search solutions..."
          />

          <div className={styles.solutionsList}>
            {solutions.length > 0 ? (
                solutions.map((solution) => (
                    <div key={solution.solution_id}>
                      <SolutionBox
                          solution_id={solution.solution_id}
                          author={solution.author_nickname}
                          likes={solution.votes}
                          codeSnippet={solution.code}
                          comments={solution.comment_count}
                          onClick={() => handleSolutionClick(solution.solution_id)}
                          language="python"
                          totalTests={solution.totaltests}
                          successfullTests={solution.successfultests}
                      />

                    </div>
                ))
            ) : (
                <p>No solutions available.</p>
            )}
          </div>
        </div>

        {selectedSolutionId && (
            <CommentOverlay
                solution_id={selectedSolutionId}
                onClose={handleCloseOverlay}
            />
        )}
      </div>
  );
};

export default Solutions;
