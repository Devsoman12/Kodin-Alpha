import React, { useState, useEffect } from "react";
import styles from "./SolutionTests.module.css";
import axios from "axios";

interface SolutionTestsProps {
    successfullTests: number;
    totalTests: number;
}

const SolutionTests: React.FC<SolutionTestsProps> = ({ successfullTests, totalTests }) => {
    const [isOpen, setIsOpen] = useState(false);
    console.log(successfullTests, totalTests);
    const [testResults, setTestResults] = useState<{ passed: number; failed: number; total: number }>({
        passed: successfullTests,
        failed: (totalTests - successfullTests),
        total: totalTests,
    });

    const successRate = testResults.total > 0 ? (testResults.passed / testResults.total) * 100 : 0;

    return (
        <div className={styles.solutionTests}>
            <div className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)}>
                <span>Tests</span>
                <span className={styles.arrow}>{isOpen ? "▼" : "▲"}</span>
            </div>

            {isOpen && (
                <div className={styles.testResultsContainer}>
                    <div className={styles.testResults}>
                        <div className={styles.progressWrapper}>
                            <span className={styles.label}>Success Rate</span>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${successRate}%` }}></div>
                            </div>
                        </div>
                        <div className={styles.stats}>
                            <p><b>Passed:</b> {testResults.passed} / {testResults.total}</p>
                            <p><b>Failed:</b> {testResults.failed}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SolutionTests;
