# ($) Coding Guidelines

Writing clean, readable, and maintainable code is essential for ensuring the long-term success of a software project. When writing code for collaborative platforms like ours, it's important to consider not only its correctness but also how well other users will be able to understand, modify, and extend it.

---

## ($) General Principles

- **Maintainability Over Cleverness**: Focus on writing clear and understandable code. Avoid making things overly complex or using shortcuts that could confuse others. Write code for people, not just for machines.

- **Adherence to Language Standards**: Use widely accepted practices and conventions for the programming language you're working in. Stick to naming conventions, style guides, and community best practices. Also, make sure to check our specific requirements for every programming language.

- **Write Comments Where Necessary**: Write comments where you think someone would need them. Focus on explaining the *why* behind complex or non-obvious parts of your code to help future developers (including yourself) understand the reasoning.

## ($) Class or Function Names

For most languages like Python or C implemented on our platform, you don't need to worry too much about naming classes or functions. However, it is generally best practice to create a class that contains a function which serves as the solution for the task.

- **Solution Class**: Always create a class named **Solution** for the solution code. This class should contain the function that implements the core logic for the task.

- **SolutionTests Class**: For the unit tests, create a separate class named **SolutionTests**. This class should contain the test cases that validate the correctness of your solution.

By following this convention, the code will be easier to understand and maintain, and it will align with the platform's expected structure for task submissions.

---

## ($) Writing Readable Code

- **Descriptive Naming**: Use clear, descriptive names for variables, functions, and classes. Avoid short, ambiguous names unless they're universally understood (like **i** for an index in a loop).

- **Consistent Formatting**: Follow consistent formatting rules for indentation, line breaks, and bracket placement. This makes your code more readable and avoids confusion.

- **Avoid Unnecessary Complexity**: Don't over-engineer solutions. Write simple, effective code that accomplishes the task at hand without unnecessary complications.

---

## ($) Importing Libraries

Always ensure that you import all the libraries you work with. Additionally, make sure to review which libraries are supported for the specific languages you are using.
