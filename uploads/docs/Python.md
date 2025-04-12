## ($) Python Setup

Our platform supports Python development with the following configurations:

---

### ($) Versions
- **Python 3.6**
- **Python 3.8**
- **Python 3.10**

---

### ($) Test Frameworks
- **unittest** (built-in Python testing framework)
- **pytest** (popular third-party testing framework)

---

### ($) Dependencies & Libraries
- **Testing**:
  - pytest
  - unittest
  - hypothesis (property-based testing)
- **Numerical & Scientific Computing**:
  - numpy
  - pandas
  - scipy
  - sympy
- **Graph & Algorithmic Libraries**:
  - networkx
- **Utilities & Formatting**:
  - black
  - pylint
  - mypy
- **Web & API Support**:
  - requests
  - aiohttp
  - Flask
  - fastapi

---

### ($) Solution and Test Code Example

In this section, we provide both the solution and the test class in one code snippet.

```python
# solution.py

class Solution:
    def example_method(self, x: int) -> int:
        """
        This method takes an integer `x` and returns its double.
        """
        return x * 2
```

```python
# tests.py

import unittest

class SolutionTests(unittest.TestCase):
    
    def test_example_method(self):
        """
        This test case verifies the functionality of the example_method.
        """
        solution = Solution()

        # Test case 1: Input is 2, expected output is 4
        self.assertEqual(solution.example_method(2), 4)

        # Test case 2: Input is 3, expected output is 6
        self.assertEqual(solution.example_method(3), 6)

        # Test case 3: Input is 0, expected output is 0
        self.assertEqual(solution.example_method(0), 0)


# Run the tests if this script is executed directly
if __name__ == "__main__":
    unittest.main()
```