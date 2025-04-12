import Docker from 'dockerode';

export const executeCodeWithTests = async (solutionCode, unitTestCode, language, taskName) => {
  const docker = new Docker();

  // Escape the quotes properly
  const escapedSolutionCode = solutionCode.trim().replace(/"/g, '\\"');
  const escapedUnitTestCode = unitTestCode.trim().replace(/"/g, '\\"');

  // Language-specific configuration
  const languageConfig = {
    python: {
      image: 'python-task-runner', // Python 3.8 image
      cmd: [
        "bash", "-c",
        `echo \"${escapedSolutionCode}\" > /usr/local/solution/solution.py && echo \"${escapedUnitTestCode}\" > /usr/local/solution/tests.py && python /usr/local/solution/tests.py`
      ],
    },
    java: {
      image: 'java-task-runner', // Use Maven 3.8 with OpenJDK 11
      cmd: [
        "bash", "-c",
        `echo \"${escapedSolutionCode}\" > /usr/local/solution/src/main/java/com/solution/Solution.java && \
         echo \"${escapedUnitTestCode}\" > /usr/local/solution/src/test/java/com/solution/SolutionTests.java && \
         cd /usr/local/solution && \
         mvn test`
      ],
    },
    c: {
      image: 'c-task-runner', // A container image with GCC and Make installed
      cmd: [
        "bash", "-c",
        `echo \"${escapedSolutionCode}\" > /usr/local/solution/solution.c && \
         echo \"${escapedUnitTestCode}\" > /usr/local/solution/tests.c && \
         cd /usr/local/solution && \
         gcc -o solution solution.c tests.c -lcriterion -lm -lssl -lcrypto -lpthread && ./solution`
      ],
    },
  };

  const config = languageConfig[language.toLowerCase()];
  if (!config) throw new Error(`Unsupported language: ${language}`);

  try {
    const container = await docker.createContainer({
      Image: config.image,
      Cmd: config.cmd,
      HostConfig: {
        AutoRemove: true,
        Binds: []
      },
      WorkingDir: '/app',
    });

    await container.start();

    return new Promise((resolve) => {
      container.logs({ stdout: true, stderr: true, follow: true }, (err, stream) => {
        if (err) {
          resolve({
            success: false,
            output: `Error capturing logs: ${err.message}`,
            successfulTests: 0,
            totalTests: 0,
            failedTests: 0
          });
          return;
        }

        let logs = '';
        stream.on('data', (data) => (logs += data.toString()));
        stream.on('end', async () => {
          const failuresIndicators = {
            python: /FAILED \(failures=(\d+)\)/i, // Python failures
            java: /Failures: (\d+)/i, // Java failures
            c: /Failing: (\d+)/i, // C failures
          };
          
          const errorIndicators = {
            python: /FAILED \(errors=(\d+)\)/i, // Python runtime errors (e.g., syntax errors)
            java: /Errors: (\d+)/i, // Java runtime errors
            c: /Errors: (\d+)/i, // C runtime errors
          };
          
          const testsRunIndicators = {
            python: /Ran (\d+) tests?/i, // Python total tests run
            java: /Tests run: (\d+)/i, // Java total tests run
            c: /Tested: (\d+) /i, // C tests run
          };
          
          // Extract test results
          const testsRunMatch = logs.match(testsRunIndicators[language.toLowerCase()]);
          const failuresMatch = logs.match(failuresIndicators[language.toLowerCase()]);
          const errorsMatch = logs.match(errorIndicators[language.toLowerCase()]);
          
          let totalTests = testsRunMatch ? parseInt(testsRunMatch[1], 10) : 0;
          let failedTests = failuresMatch ? parseInt(failuresMatch[1], 10) : 0;
          let errorTests = errorsMatch ? parseInt(errorsMatch[1], 10) : 0; // Capture errors
          
          let successfulTests = totalTests - failedTests - errorTests;
          
          // If no tests were run but there are errors, count them as failures
          if (!testsRunMatch && errorsMatch) {
            totalTests = 0;
            failedTests = errorTests;
            successfulTests = 0;
          }
          
          resolve({
            success: failedTests === 0 && errorTests === 0, // Success only if no failures or errors
            output: logs,
            successfulTests,
            totalTests,
            failedTests,
            errorTests,
          });
        });

        stream.on('error', (logErr) => {
          resolve({
            success: false,
            output: `Stream error: ${logErr.message}`,
            successfulTests: 0,
            totalTests: 0,
            failedTests: 0,
          });
        });
      });
    });
  } catch (err) {
    console.error('Error during container execution:', err.message);
    return {
      success: false,
      output: `Failed to execute code: ${err.message}`,
      successfulTests: 0,
      totalTests: 0,
      failedTests: 0,
    };
  }
};
