## ($) Java Setup

Our platform supports Java development with the following configurations:

---

### ($) Versions
- **Java 8**
- **Java 11**
- **Java 17**

---

### ($) Test Frameworks
- **JUnit** (both JUnit 4 and 5 are supported)

---

### ($) Dependencies & Libraries
- **JUnit**:
  - junit:junit
  - org.junit.jupiter:junit-jupiter-api
  - org.junit.jupiter:junit-jupiter-engine
  - org.junit.platform:junit-platform-launcher
  - org.junit.vintage:junit-vintage-engine
- **Mockito**: org.mockito:mockito-core
- **AssertJ**:
  - org.assertj:assertj-core
  - org.assertj:assertj-guava
- **Apache Commons**:
  - org.apache.commons:commons-lang3
  - org.apache.commons:commons-math3

---

### ($) Example of Solution and Test Setup

For this specific language, it is crucial to name your classes the same way as the files are named. Specifically, when authoring with this language, it is important to name your solution class **Solution** and the test class **SolutionTests**.

---

### ($) Solution and Test Code Example

In this section, we provide both the solution and the test class in one code snippet.

```Java
// Solution.java
public class Solution {
    public int exampleMethod(int x) {
        // This method takes an integer `x` and returns its double
        return x * 2;
    }
}
```
```Java
// SolutionTests.java
import org.junit.Test;
import static org.junit.Assert.*;

public class SolutionTests {
    
    @Test
    public void testExampleMethod() {
        Solution solution = new Solution();

        // Test case 1: Input is 2, expected output is 4
        assertEquals(4, solution.exampleMethod(2));

        // Test case 2: Input is 3, expected output is 6
        assertEquals(6, solution.exampleMethod(3));

        // Test case 3: Input is 0, expected output is 0
        assertEquals(0, solution.exampleMethod(0));
    }
}
```
