## ($) Versions
- **Compiler**: GCC (latest)
- **Language Standard**: C18
- **Libraries**: 
  - C math functions (libm)
  - OpenSSL (libcrypto)
  - Dynamic Linking (libdl)
  - POSIX threads (libpthread)
  - Criterion test framework (libcriterion)

---

## ($) Command
```c
gcc -o solution solution.c tests.c -lcriterion -lm -lssl -lcrypto -lpthread && ./solution
```

---

## ($) Testing Framework
- Criterion

---

## ($) Memory Management when Authoring Tasks in C

When authoring tasks in C, it is best practice to allocate memory in the solution code and free it in the test code. This approach has several benefits:

- **Separation of Concerns**: By allocating memory in the solution code, you ensure that the logic for handling memory is part of the actual implementation. This keeps the task's focus on solving the problem rather than managing test-specific operations.

- **Test Isolation**: By freeing memory in the test code, you ensure that the memory management responsibilities are clearly separated from the main solution. The test code becomes responsible for checking if memory is properly allocated and freed, which aids in catching memory leaks and errors in resource management.

- **Avoiding Memory Leaks**: It is crucial to ensure that memory allocated in the solution is properly freed. Freeing memory in the test code allows you to isolate any potential memory leaks to the test context and ensures that the solution itself remains efficient.

This approach promotes clarity, reduces potential errors, and maintains clean memory management practices. For a task to be accepted and verified successfully, you must design your C tasks this way.

---

## ($) Referencing Solution in C Unit Test

When writing unit tests for C solutions, it is important not to directly include the **.h** header file in the test code. Our platform does not include support for **.h** files. Instead, it is easier to **extern** declare the function(s) you are testing in the test file. This practice has several advantages:

- **Simplifies Dependencies**: Including the header file in the test code may bring unnecessary dependencies or implementation details that are not needed for the tests. Using **extern** keeps the test file minimal and focused only on testing the behavior of the solution.

- **Prevents Multiple Inclusions**: Including the **.h** file could potentially lead to multiple inclusions of the same definitions, especially if the file is already included in the solution. Using **extern** ensures that the test code can reference the solution code without these complications.

Generally, it is easier than adding support for **.h** files to our platform. It has one disadvantage, though: when working with custom data structures, it is necessary to define them in both the solution and unit test code.

---

### ($) Example Code Snippet

Here is an example of how you should structure the test file with **extern**:

```c
// solution.c
#include <stdio.h>

int add(int a, int b) {
    return a + b;
}
```

```c
// tests.c
#include <criterion/criterion.h>

// Extern declaration of the function from solution.c
extern int add(int, int);

Test(addition_tests, test_addition) {
    int result = add(2, 3);
    cr_assert_eq(result, 5, "Expected 2 + 3 to equal 5");
}
```











