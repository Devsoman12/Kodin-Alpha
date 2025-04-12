# ($) Writing Unit Tests

Unit testing is a fundamental practice in software development that ensures individual components (units) of a program work as expected. A unit test typically focuses on a single function, method, or class and verifies that it produces the correct output for a given input.

On our platform, we support only fixed tests, which means that each author needs to specifically define static test cases for their unit tests. While this approach is not the most efficient, our platform is designed to teach users about programming. I believe that the best way to understand a programming problem is to think through every possible input and output scenario. This process helps build a deeper understanding of how code behaves under different conditions and strengthens problem-solving skills.

Although it may seem less efficient, having authors define static test cases provides an opportunity for users to learn the importance of comprehensive testing and how to handle edge cases. By focusing on this detailed approach, we encourage users to think critically and develop robust solutions.

---

## ($) Why Write Unit Tests?

- **Ensures Correctness**: Catches errors early by verifying that each function behaves as expected.
- **Facilitates Refactoring**: Helps maintain code quality when making changes or adding new features.
- **Improves Code Reliability**: Reduces bugs in production by testing code in a controlled environment.
- **Supports Continuous Integration (CI)**: Automated tests ensure new changes do not break existing functionality.

---

## ($) General Structure of a Unit Test

Most unit tests follow this pattern:

1. **Arrange** – Set up the necessary test environment, including input values.
2. **Act** – Call the function or method being tested.
3. **Assert** – Verify the output against the expected result.

Example (in a generic format):

```pseudo
# Arrange
Initialize the required variables or objects.

# Act
Call the function or method with test inputs.

# Assert
Compare the output with the expected result.
```

It is crucial to write cohesive tests that cover **both basic and edge cases**. Properly structured tests ensure a high level of code quality and reliability.

---

## ($) Naming Conventions for Unit Tests

To make test cases **clear and readable**, follow these naming conventions:

- Use descriptive names that explain **what the test does**.
- Follow a **consistent format** such as:

  - **test_<functionality>** 
  - **should_<expected_behavior>**  
  - **given_<condition>_when_<action>_then_<expected_result>**  

### ($) Examples:

| Bad Naming       | Good Naming                                             |
|------------------|---------------------------------------------------------|
| **test1()**        | **test_addition_with_positive_numbers()**                 |
| **checkStuff()**   | **should_return_false_for_invalid_input()**               |
| **xyz()=**          | **given_empty_list_when_sorted_then_return_empty_list()** |


Using meaningful names makes debugging and maintaining tests much easier.

---

## ($) Referencing the Solution Function

When writing tests, ensure that your **test code correctly references the solution function**. This is especially important in platforms where the test framework automatically imports the solution file.

### ($) Example in Python:
```python
from solution import my_function

def test_my_function():
    assert my_function(2) == 4
    assert my_function(-1) == -2
```

### ($) Example in Java:
```java
import static org.junit.Assert.*;
import org.junit.Test;

public class SolutionTests {
    @Test
    public void testExampleMethod() {
        Solution solution = new Solution();
        assertEquals(4, solution.exampleMethod(2));
    }
}
```

