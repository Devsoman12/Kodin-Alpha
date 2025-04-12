DROP TABLE IF EXISTS comment_likes;
DROP TABLE IF EXISTS comment;
DROP TABLE IF EXISTS isin;
DROP TABLE IF EXISTS classroomtask;
DROP TABLE IF EXISTS grouptask;
DROP TABLE IF EXISTS unittest;
DROP TABLE IF EXISTS hasLikedSolution;
DROP TABLE IF EXISTS classroomsolution;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS solution;
DROP TABLE IF EXISTS isInList;
DROP TABLE IF EXISTS taskCode;
DROP TABLE IF EXISTS task_likes;
DROP TABLE IF EXISTS taskBugReport;
DROP TABLE IF EXISTS task;
DROP TABLE IF EXISTS difficulty;
DROP TABLE IF EXISTS ispartof;
DROP TABLE IF EXISTS classroommlistoftasks;
DROP TABLE IF EXISTS listoftask;
DROP TABLE IF EXISTS note;
DROP TABLE IF EXISTS classroom;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS user_badge;
DROP TABLE IF EXISTS userR;
DROP TABLE IF EXISTS badge;
DROP TABLE IF EXISTS rank;

-- Badge Tble
CREATE TABLE badge (
    badge_id SERIAL NOT NULL PRIMARY KEY,
    badge_name VARCHAR(255) NOT NULL,
    badge_picture VARCHAR(255) NOT NULL
);

-- Rank Table
CREATE TABLE rank(
    rank_id SERIAL PRIMARY KEY,
    rank_name VARCHAR(255) NOT NULL,
    honor_cap INT NOT NULL
);

-- User Table
CREATE TABLE userR (
  email VARCHAR(255) NOT NULL,
  nick VARCHAR(50) NOT NULL,
  password VARCHAR(255),
  role VARCHAR(50) NOT NULL,
  registration_date TIMESTAMP NOT NULL,
  last_login_date TIMESTAMP NOT NULL,
  profile_picture TEXT,
  user_id SERIAL PRIMARY KEY,
  honor INT DEFAULT 0,
  verificationCode INT DEFAULT 0,
  expirationTime TIMESTAMP,
  isVerified BOOLEAN NOT NULL DEFAULT false,
  resetTokenExpires TIMESTAMP DEFAULT NULL,
  resetToken VARCHAR(50) DEFAULT NULL,
  selected_badge_id INT NOT NULL,
  rank_id INT NOT NULL,
  visibility BOOLEAN DEFAULT true,
  contributor_flag BOOLEAN DEFAULT false,
  mentor_flag BOOLEAN DEFAULT false,
  verifier_flag BOOLEAN DEFAULT false,
  bug_hunter_flag BOOLEAN DEFAULT false,
  FOREIGN KEY (selected_badge_id) REFERENCES badge(badge_id) ON DELETE CASCADE,
  FOREIGN KEY (rank_id) REFERENCES rank(rank_id) ON DELETE CASCADE
);

CREATE TABLE user_badge (
  user_id INT REFERENCES userR(user_id) ON DELETE CASCADE,
  badge_id INT REFERENCES badge(badge_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, badge_id)
);

-- Classroom Table
CREATE TABLE classroom (
  name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  day_of_week VARCHAR(255),
  end_time TIME NOT NULL,
  subject VARCHAR(255) NOT NULL,
  classroom_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES userR(user_id) ON DELETE CASCADE
);

-- Note Table
CREATE TABLE note (
  note_id BIGSERIAL PRIMARY KEY,
  note_text TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  classroom_id INT NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (classroom_id) REFERENCES classroom(classroom_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES userR(user_id) ON DELETE CASCADE
);

-- Class-User Connection
CREATE TABLE isPartOf (
  user_id INT NOT NULL,
  classroom_id INT NOT NULL,
  classroom_honor INT DEFAULT 0,
  PRIMARY KEY (user_id, classroom_id),
  FOREIGN KEY (user_id) REFERENCES userR(user_id) ON DELETE CASCADE,
  FOREIGN KEY (classroom_id) REFERENCES classroom(classroom_id) ON DELETE CASCADE
);

-- Difficulty Table
CREATE TABLE difficulty (
    difficulty_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    honor_reward INT NOT NULL
);

-- Task Table
CREATE TABLE task (
  author_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  task_id SERIAL PRIMARY KEY,
  creation_date TIMESTAMP NOT NULL,
  is_verified BOOLEAN NOT NULL,
  likes INT DEFAULT 0,
  dislikes INT DEFAULT 0,
  difficulty_id INT NOT NULL,
  problem_type VARCHAR(255) NOT NULL,
  FOREIGN KEY (author_id) REFERENCES  userR(user_id) ON DELETE  CASCADE,
  FOREIGN KEY (difficulty_id) REFERENCES difficulty(difficulty_id) ON DELETE CASCADE
);

CREATE TABLE taskBugReport(
  report_id SERIAL NOT NULL,
  report_message VARCHAR(500),
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  author_nickname VARCHAR(100) NOT NULL,
  FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES userR(user_id) ON DELETE CASCADE
);

-- Code Table (Multiple programming languages)
CREATE TABLE taskCode(
    taskCode_id SERIAL NOT NULL,
    task_id INT NOT NULL,
    initial_code TEXT NOT NULL,
    solution_code TEXT NOT NULL,
    unit_test_code TEXT NOT NULL,
    programming_language VARCHAR(50) NOT NULL,
    PRIMARY KEY (task_id, taskCode_id),
    FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE CASCADE
);

-- Task Likes Table
CREATE TABLE task_likes (
    user_id INT NOT NULL REFERENCES userR(user_id) ON DELETE CASCADE,
    task_id INT NOT NULL REFERENCES task(task_id) ON DELETE CASCADE,
    type VARCHAR(10) CHECK (type IN ('like', 'dislike')),
    PRIMARY KEY (user_id, task_id)
);

-- Task List Table
CREATE TABLE listOfTask (
  list_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES userR(user_id) ON DELETE CASCADE
);

-- Task-List Connection
CREATE TABLE isInList(
    task_id INT NOT NULL,
    list_id INT NOT NULL,
    PRIMARY KEY (task_id, list_id),
    FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE CASCADE,
    FOREIGN KEY (list_id) REFERENCES listOfTask(list_id) ON DELETE CASCADE
);

-- Class-Task Connection
CREATE TABLE classroomtask (
  task_id INT NOT NULL,
  classroom_id INT NOT NULL,
  lock_date TIMESTAMP,
  start_date TIMESTAMP,
  PRIMARY KEY (task_id, classroom_id),
  FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE CASCADE,
  FOREIGN KEY (classroom_id) REFERENCES classroom(classroom_id) ON DELETE CASCADE
);

-- Classroom-Task-List Connection
CREATE TABLE classroommlistoftasks (
    list_id INT NOT NULL,
    classroom_id INT NOT NULL,
    PRIMARY KEY (list_id, classroom_id),
    FOREIGN KEY (list_id) REFERENCES listOfTask(list_id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classroom(classroom_id) ON DELETE CASCADE
);

-- Solution Table
CREATE TABLE solution (
  solution_id SERIAL NOT NULL,
  submission_date TIMESTAMP NOT NULL,
  code TEXT NOT NULL,
  votes INT NOT NULL,
  programming_language VARCHAR(50) NOT NULL,
  user_id INT NOT NULL,
  task_id INT NOT NULL,
  successfultests INT NOT NULL,
  totaltests INT NOT NULL,
  PRIMARY KEY (task_id, solution_id),
  FOREIGN KEY (user_id) REFERENCES userR(user_id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE CASCADE
);

-- Classroom-Solution Table
CREATE TABLE classroomsolution (
    task_id INT NOT NULL,
    solution_id INT NOT NULL,
    classroom_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (task_id, solution_id) REFERENCES solution(task_id, solution_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES userR(user_id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classroom(classroom_id) ON DELETE CASCADE
);

-- Solution Like Table
CREATE TABLE hasLikedSolution (
  user_id INT NOT NULL,
  solution_id INT NOT NULL,
  task_id INT NOT NULL,
  PRIMARY KEY(user_id, solution_id),
  FOREIGN KEY (user_id) REFERENCES userR(user_id) ON DELETE CASCADE,
  FOREIGN KEY (solution_id, task_id) REFERENCES solution(solution_id, task_id) ON DELETE CASCADE
);

-- Solution Comment Table
CREATE TABLE comment (
  comment_id SERIAL NOT NULL,
  parent_id INT DEFAULT NULL,
  text TEXT NOT NULL,
  comment_date TIMESTAMP NOT NULL DEFAULT NOW(),
  likes INT DEFAULT 0,
  dislikes INT DEFAULT 0,
  user_id INT NOT NULL,
  solution_id INT NOT NULL,
  task_id INT NOT NULL,
  PRIMARY KEY (comment_id),
  FOREIGN KEY (task_id, solution_id) REFERENCES solution(task_id, solution_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comment(comment_id) ON DELETE CASCADE
);

-- Comment Likes Table
CREATE TABLE comment_likes (
    user_id INT NOT NULL REFERENCES userR(user_id) ON DELETE CASCADE,
    comment_id INT NOT NULL REFERENCES comment(comment_id) ON DELETE CASCADE,
    type VARCHAR(10) CHECK (type IN ('like', 'dislike')),
    PRIMARY KEY (user_id, comment_id)
);

-- Notification Table
CREATE TABLE notification(
  notification_id SERIAL NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  push_date TIMESTAMP NOT NULL,
  was_read BOOLEAN NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES userR(user_id) ON DELETE CASCADE
);

CREATE TABLE logs (
  log_id SERIAL PRIMARY KEY,
  user_id INT,  -- Allow user_id to be NULL (not required)
  classroom_id INT,
  task_id INT,
  solution_id INT,
  log_message TEXT NOT NULL,
  log_status BOOL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),  -- Timestamp of log creation
  FOREIGN KEY (user_id) REFERENCES userr(user_id) ON DELETE SET NULL,
  FOREIGN KEY (classroom_id) REFERENCES classroom(classroom_id) ON DELETE SET NULL,
  FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE SET NULL,
  FOREIGN KEY (solution_id, task_id) REFERENCES solution(solution_id, task_id) ON DELETE SET NULL
);

-- Insert initial data
INSERT INTO difficulty(name, honor_reward) VALUES ('Easy', 10);
INSERT INTO difficulty(name, honor_reward) VALUES ('Medium', 20);
INSERT INTO difficulty(name, honor_reward) VALUES ('Hard', 30);

-- Inserting badges into the badge table with picture paths
INSERT INTO badge (badge_name, badge_picture) VALUES
    ('None', ''),
    ('Verifier', '/uploads/badges/badge1.png'),
    ('Bug Hunter', '/uploads/badges/badge2.png'),
    ('Mentor', '/uploads/badges/badge3.png'),
    ('Achiever', '/uploads/badges/badge4.png'),
    ('Contributor', '/uploads/badges/badge5.png');

-- Inserting ranks into the rank table with honor_cap values
INSERT INTO rank (rank_name, honor_cap) VALUES
    ('Newbie', 0),
    ('Beginner', 100),
    ('Intermediate', 500),
    ('Advanced', 1000),
    ('Expert', 2000),
    ('Master', 5000),
    ('Grandmaster', 10000);

INSERT INTO userR (
  user_id, email, nick, password, role, registration_date, last_login_date, profile_picture,
  honor, verificationCode, expirationTime, isVerified, resetTokenExpires, resetToken, selected_badge_id, rank_id, visibility
)
VALUES (
  2, 'example@example.com', 'exampleNick', '$2b$10$KpSoNkVJP/MNqotsbK7bnO8kjKuPDTnCKjALiKyIE/8lqpRQ.Bvyu', 'teacher', NOW(), NOW(), '',
  0, 123456, '2025-12-31 23:59:59', true, NULL, NULL, 1, 1, true
);

INSERT INTO public.task (author_id, title, description, task_id, creation_date, is_verified, likes, dislikes, difficulty_id, problem_type) VALUES (2, 'Palindrome Check', e'# Palindrome Check

A **palindrome** is a word, phrase, number, or any sequence of characters that reads the same **forward and backward**, ignoring **spaces**, **punctuation**, and **case**.

The task is to write a function `palindromeCheck` that returns `true` if the given string is a palindrome, and `false` otherwise.

---

## 🧾 Input

- A single **string** `s`, which may contain **letters**, **spaces**, **punctuation**, and **mixed case**.

---

## 📤 Output

- Return `true` if the string is a palindrome, `false` otherwise.

---

## ✅ Constraints

- `1 ≤ len(s) ≤ 10⁵`
- The string may contain **uppercase and lowercase letters**, **digits**, **spaces**, and **punctuation**.
- Only **alphanumeric characters** are considered when checking for palindrome.

---

## 📌 Example

**Input:**
"A man, a plan, a canal: Panama"

**Output:**
true

---

**Input:**
"race a car"

**Output:**
false

---

## 💡 Notes

- The comparison should ignore:
  - **Case** (e.g., "Madam" is the same as "madam")
  - **Spaces** and **punctuation** (e.g., "Was it a car or a cat I saw?" is valid)
- You can use regular expressions or filtering to keep only **alphanumeric characters**.
', 21, '2025-03-13 18:02:43.318000', true, 0, 0, 2, 'Algorithms');
INSERT INTO public.task (author_id, title, description, task_id, creation_date, is_verified, likes, dislikes, difficulty_id, problem_type) VALUES (2, 'Reverse String', e'# String Reversal

Write a program that **reverses** a given string.

---

## 🧾 Input

- A single string `s` where `1 ≤ |s| ≤ 1000`.

---

## 📤 Output

- The **reversed** string.

---

## 📌 Example

**Input:**
"hello"

**Output:**
"olleh"

---

## 💡 Notes

- The string can contain any printable characters, including spaces.
- Reversing the string should maintain the original order of characters in reverse.
', 15, '2025-03-13 15:28:32.098000', true, 0, 0, 1, 'Algorithms');
INSERT INTO public.task (author_id, title, description, task_id, creation_date, is_verified, likes, dislikes, difficulty_id, problem_type) VALUES (2, 'Fibonacci Number', e'# Fibonacci Sequence

The Fibonacci sequence is a series of numbers where each number is the sum of the two preceding ones, starting from 0 and 1. The sequence begins as follows: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ....

Your task is to write a function that returns the **N-th Fibonacci number**, where `N` is a non-negative integer.

The Fibonacci sequence can be defined by the recurrence relation:

- F(0) = 0
- F(1) = 1
- F(n) = F(n-1) + F(n-2) for n > 1

---

## 🧾 Input

- A non-negative integer `N` where `0 ≤ N ≤ 10¹⁸`.

---

## 📤 Output

- The **N-th Fibonacci number** in the sequence.

---

## 📌 Example

**Input:**
5

**Output:**
5

---

## 💡 Notes

- The Fibonacci sequence starts from index 0. The first few numbers are: 0, 1, 1, 2, 3, 5, 8, 13, 21...
- For N = 5, the output is 5 because the Fibonacci sequence starting from 0 is: 0, 1, 1, 2, 3, 5, ...
', 17, '2025-03-13 15:53:10.858000', true, 0, 0, 1, 'Algorithms');
INSERT INTO public.task (author_id, title, description, task_id, creation_date, is_verified, likes, dislikes, difficulty_id, problem_type) VALUES (2, 'Fizz Buzz', e'# FizzBuzz

Write a program that prints numbers from 1 to `N`.

- If a number is divisible by 3, print **"Fizz"** instead of the number.
- If a number is divisible by 5, print **"Buzz"**.
- If a number is divisible by both 3 and 5, print **"FizzBuzz"**.
- Otherwise, print the number itself.

---

## 🧾 Input

- A single integer `N` where `1 ≤ N ≤ 10⁶`.

---

## 📤 Output

- Print numbers from 1 to `N` according to the rules above, each on a new line.

---

## 📌 Example

**Input:**
15

**Output:**
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz

---

## 💡 Notes

- For numbers divisible by both 3 and 5, print **"FizzBuzz"**.
- The output should print each result on a new line.
', 14, '2025-03-13 14:03:06.693000', true, 0, 0, 1, 'Algorithms');
INSERT INTO public.task (author_id, title, description, task_id, creation_date, is_verified, likes, dislikes, difficulty_id, problem_type) VALUES (2, 'Find Maximum in Array', e'# Maximum Value in Array

Implement a function that finds the **maximum value** in an array of integers. The function should return the maximum value in the array.

---

## 🧾 Input

- An array `arr` of integers where the length of the array is `1 ≤ |arr| ≤ 10⁶` and each integer `arr[i]` is between `-10⁶` and `10⁶`.

---

## 📤 Output

- The **maximum value** in the array.

---

## 📌 Example

**Input:**
[1, 2, 3, 4, 5]

**Output:**
5

---

## 💡 Notes

- The array will contain at least one integer.
- You need to return the largest integer present in the array.
', 16, '2025-03-13 15:44:47.932000', true, 0, 0, 1, 'Algorithms');
INSERT INTO public.task (author_id, title, description, task_id, creation_date, is_verified, likes, dislikes, difficulty_id, problem_type) VALUES (2, 'DFS search', e'# Depth-First Search (DFS)

Depth-First Search (DFS) is an algorithm used for traversing or searching tree or graph data structures. Starting from a selected node (usually the root), it explores as far as possible along each branch before backtracking.

In this task, you are given a graph represented as an adjacency list. Your goal is to implement the DFS algorithm to traverse the graph starting from a given node and output the nodes in the order they are visited.

---

## 🧾 Input

- A graph represented as an adjacency list, where each key is a node and its value is a list of adjacent nodes (neighbors).
- The starting node from which the DFS traversal begins.

Example of a graph:

{
  0: [1, 2],
  1: [0, 3, 4],
  2: [0],
  3: [1],
  4: [1]
}

---

## 📤 Output

- A list of nodes in the order they are visited during the DFS traversal.

---

## 📌 Example

**Input:**
Graph:
{
  0: [1, 2],
  1: [0, 3, 4],
  2: [0],
  3: [1],
  4: [1]
}
Start node: `0`

**Output:**
`[0, 1, 3, 4, 2]`

---

## 💡 Notes

- DFS starts at the given node, marks it as visited, and then recursively visits all of its unvisited neighbors.
- The traversal proceeds as deeply as possible before backtracking.
- The graph may not be connected, so you may need to consider all nodes even if they are not connected directly to the starting node.
', 18, '2025-03-13 16:05:53.032000', true, 1, 0, 2, 'Structures');
INSERT INTO public.task (author_id, title, description, task_id, creation_date, is_verified, likes, dislikes, difficulty_id, problem_type) VALUES (2, 'Prime Number Checker', e'# Prime Number Check

A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself. For example, the numbers 2, 3, 5, 7, and 11 are prime, while 4, 6, 8, and 9 are not.

In this task, you need to implement a function `isPrime(N)` that takes an integer `N` as input and returns a boolean indicating whether `N` is a prime number. If `N` is prime, return `True`; otherwise, return `False`.

---

## 🧾 Input

- An integer `N` where `N ≥ 2`.

---

## 📤 Output

- A boolean value: `True` if `N` is a prime number, and `False` otherwise.

---

## 📌 Example

**Input:**
`N = 7`

**Output:**
`True`

---

## 💡 Notes

- A prime number is only divisible by 1 and itself.
- For numbers larger than 1, you can check divisibility from 2 to the square root of the number to determine if it\'s prime.
', 20, '2025-03-13 17:52:22.357000', true, 0, 0, 2, 'Algorithms');
INSERT INTO public.task (author_id, title, description, task_id, creation_date, is_verified, likes, dislikes, difficulty_id, problem_type) VALUES (2, 'Merge Sort', e'# Merge Sort

**Merge Sort** is a divide-and-conquer sorting algorithm that recursively divides an array into smaller subarrays, sorts them, and then merges them back together. It has a time complexity of **O(n log n)** and is **stable** (it preserves the relative order of equal elements).

---

## 🧾 Input

A list/array of `n` integers, where `1 ≤ n ≤ 10^5`.

The numbers can be **positive or negative**.

---

## 📤 Output

A new **sorted** list/array in **ascending order**.

---

## ✅ Constraints

- `1 ≤ n ≤ 100000`
- `-10^9 ≤ arr[i] ≤ 10^9`

---

## 📌 Example

**Input:**
[3, -1, 4, 1, 5, 9, -2]

**Output:**
[-2, -1, 1, 3, 4, 5, 9]
', 23, '2025-03-13 18:58:52.232000', true, 0, 0, 3, 'Algorithms');
INSERT INTO public.task (author_id, title, description, task_id, creation_date, is_verified, likes, dislikes, difficulty_id, problem_type) VALUES (2, 'Knapsack Problem', e'# 0/1 Knapsack Problem

The **0/1 Knapsack** problem is a classic optimization problem where you are given a set of items, each with a **weight** and a **value**, and a knapsack with a limited **weight capacity**. The objective is to determine the **maximum value** of items that can be included in the knapsack **without exceeding** its weight capacity.

The solution must be implemented using **Dynamic Programming**.

---

## 🧾 Input

- `n` (`1 ≤ n ≤ 1000`): Number of items
- `W` (`1 ≤ W ≤ 10⁴`): Capacity of the knapsack
- Two arrays:
  - `weights[i]` (`1 ≤ weights[i] ≤ 100`): The weight of item `i`
  - `values[i]` (`1 ≤ values[i] ≤ 1000`): The value of item `i`

---

## 📤 Output

Returns the **maximum total value** that can be obtained by including items in the knapsack without exceeding its capacity.

---

## ✅ Constraints

- `1 ≤ n ≤ 1000`
- `1 ≤ W ≤ 10000`
- `1 ≤ weights[i] ≤ 100`
- `1 ≤ values[i] ≤ 1000`

---

## 📌 Example

**Input:**
n = 4
W = 8
weights = [2, 3, 4, 5]
values = [3, 4, 5, 6]

**Output:**
10

---

## 💡 Notes

- You can either **include** or **exclude** each item — you can\'t include a fraction of an item.
- The optimal solution uses **Dynamic Programming** to build up solutions to smaller subproblems.
', 25, '2025-03-13 19:19:13.709000', true, 1, 0, 3, 'Algorithms');
INSERT INTO public.task (author_id, title, description, task_id, creation_date, is_verified, likes, dislikes, difficulty_id, problem_type) VALUES (2, 'Matrices Multiplication', e'# Matrix Chain Multiplication

You are given a sequence of matrices, and the goal is to find the most **efficient way** to multiply the matrices together. The problem is to determine the **minimum number of scalar multiplications** needed to multiply a chain of matrices.

Given a sequence of matrices A₁, A₂, ..., Aₙ, where matrix Aᵢ has dimensions `p[i-1] x p[i]`, the task is to find the **optimal parenthesization** of the matrices to minimize the number of scalar multiplications.

---

## 🧾 Input

- A list `p[]` of length `n + 1`, where `p[i-1] x p[i]` is the dimension of matrix Aᵢ for `i = 1` to `n`.
- `n` is the number of matrices in the chain.

---

## 📤 Output

Return the **minimum number of scalar multiplications** needed to multiply the entire matrix chain.

---

## ✅ Constraints

- `2 ≤ n ≤ 500` (number of matrices)
- `1 ≤ p[i] ≤ 1000`

---

## 📌 Example

**Input:**
p = [10, 20, 30, 40, 30]

**Output:**
18000

---

## 🧠 Approach

Use **Dynamic Programming** to solve this problem.

Let `dp[i][j]` represent the minimum number of scalar multiplications needed to compute the matrix product from Aᵢ to Aⱼ.

The recurrence relation is:
`dp[i][j] = min(dp[i][k] + dp[k+1][j] + p[i-1] * p[k] * p[j])`
for all `k` from `i` to `j-1`.

Build up the solution bottom-up using this relation.', 22, '2025-03-13 18:29:15.154000', true, 0, 0, 3, 'Algorithms');
INSERT INTO public.task (author_id, title, description, task_id, creation_date, is_verified, likes, dislikes, difficulty_id, problem_type) VALUES (2, 'BFS Search', e'# Breadth-First Search (BFS) Traversal

You are given a **graph** represented as an **adjacency list**. Your task is to implement the **Breadth-First Search (BFS)** algorithm to traverse the graph.

---

## 🔍 Problem Description

**Breadth-First Search (BFS)** explores the graph **level by level**, starting from a given node and visiting **all its neighbors** before moving on to their neighbors.

BFS uses a **queue** to ensure that nodes are explored in the order they are discovered.

---

## 🧾 Input

- A graph represented as an **adjacency list**, where:
  - Each **key** is a node.
  - The **value** is a list of adjacent nodes (its neighbors).
- A **starting node** from which BFS should begin.

---

## 📤 Output

- A list or printout of nodes in the order they are visited during the BFS traversal.

---

## ✅ Constraints

- The graph is **connected**.
- Node values are **non-negative integers**.
- The number of nodes `n` satisfies `1 ≤ n ≤ 10⁵`.

---

## 📌 Example

**Input:**
graph = {
  0: [1, 2],
  1: [0, 3, 4],
  2: [0],
  3: [1],
  4: [1]
}
start = 0

**Output:**
0 1 2 3 4

---

## 💡 Notes

- Begin BFS from the given `start` node.
- Maintain a **visited set** to avoid visiting the same node multiple times.
- Use a **queue** (FIFO) to keep track of nodes to visit next.
- The BFS traversal ensures **minimum number of edges** are traversed from the start node to reach any other node.
', 19, '2025-03-13 17:16:01.472000', true, 0, 0, 2, 'Structures');
INSERT INTO public.task (author_id, title, description, task_id, creation_date, is_verified, likes, dislikes, difficulty_id, problem_type) VALUES (2, 'Balanced Parentheses Checker', e'# Balanced Parentheses

A string containing only the characters `(`, `)`, `{`, `}`, `[`, `]` is said to have **balanced parentheses** if:

- Each opening bracket has a matching closing bracket of the same type.
- Brackets are closed in the correct order (e.g., `({[]})` is valid but `({[)]}` is not).
- An empty string is considered balanced.

---

## 🧾 Input

- A string `s` containing only `()`, `{}`, `[]`.
- The length of `s` is `1 ≤ len(s) ≤ 10⁵`.

---

## 📤 Output

- Return **True** (or `1` in C) if the parentheses are balanced; otherwise, return **False** (or `0` in C).

---

## 📌 Example

**Input:**
"({[]})"

**Output:**
True

**Input:**
"({[)]}"

**Output:**
False

---

## 💡 Notes

- A string is balanced if each opening bracket has a corresponding and correctly ordered closing bracket.
- The string should only contain characters `()`, `{}`, and `[]`—other characters are not considered.
', 24, '2025-03-13 19:10:56.361000', true, 0, 0, 3, 'Algorithms');

INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (25, 17, e'#include <stdio.h>

int fibonacci(int n) {
    //return nth fib number
}', e'#include <stdio.h>

int fibonacci(int n) {
    if (n == 0) return 0;
    if (n == 1) return 1;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}', e'#include <criterion/criterion.h>
#include <stdio.h>

extern int fibonacci(int n);

Test(fibonacci_tests, test_fibonacci_zero) {
    cr_expect_eq(fibonacci(0), 0);
}

Test(fibonacci_tests, test_fibonacci_one) {
    cr_expect_eq(fibonacci(1), 1);
}

Test(fibonacci_tests, test_fibonacci_small) {
    cr_expect_eq(fibonacci(5), 5);
}

Test(fibonacci_tests, test_fibonacci_medium) {
    cr_expect_eq(fibonacci(10), 55);
}

Test(fibonacci_tests, test_fibonacci_large) {
    cr_expect_eq(fibonacci(20), 6765);
}', 'C');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (14, 14, e'def fizzbuzz(n):
    result = []
    #return resulting numbers in result array
    return result', e'def fizzbuzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 3 == 0 and i % 5 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result', e'import unittest
from solution import fizzbuzz

class TestFizzBuzz(unittest.TestCase):

    def test_fizzbuzz_small_numbers(self):
        self.assertEqual(fizzbuzz(1), ["1"])
        self.assertEqual(fizzbuzz(2), ["1", "2"])
        self.assertEqual(fizzbuzz(3), ["1", "2", "Fizz"])
        self.assertEqual(fizzbuzz(5), ["1", "2", "Fizz", "4", "Buzz"])

    def test_fizzbuzz_medium_numbers(self):
        self.assertEqual(fizzbuzz(10), ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz"])
        self.assertEqual(fizzbuzz(15), [
            "1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz",
            "11", "Fizz", "13", "14", "FizzBuzz"
        ])

    def test_fizzbuzz_large_numbers(self):
        self.assertEqual(fizzbuzz(20), [
            "1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz",
            "11", "Fizz", "13", "14", "FizzBuzz", "16", "17", "Fizz", "19", "Buzz"
        ])
        self.assertEqual(fizzbuzz(30)[-5:], ["26", "Fizz", "28", "29", "FizzBuzz"])  # Last 5 elements

    def test_fizzbuzz_only_fizz(self):
        self.assertEqual(fizzbuzz(6), ["1", "2", "Fizz", "4", "Buzz", "Fizz"])
        self.assertEqual(fizzbuzz(9), ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz"])

    def test_fizzbuzz_only_buzz(self):
        self.assertEqual(fizzbuzz(10), ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz"])
        self.assertEqual(fizzbuzz(20)[-5:], ["16", "17", "Fizz", "19", "Buzz"])  # Last 5 values

    def test_fizzbuzz_only_fizzbuzz(self):
        self.assertEqual(fizzbuzz(15)[-1], "FizzBuzz")  # Last value must be "FizzBuzz"
        self.assertEqual(fizzbuzz(30)[-1], "FizzBuzz")  # Last value at 30 should be "FizzBuzz"

if __name__ == "__main__":
    unittest.main()', 'Python');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (22, 16, e'#include <stdio.h>

int find_max(int arr[], int size) {
    int max = arr[0];
    return max;
}', e'#include <stdio.h>

int find_max(int arr[], int size) {
    int max = arr[0];
    for (int i = 1; i < size; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}', e'#include <criterion/criterion.h>
#include <stdio.h>

extern int find_max(int arr[], int size);

Test(find_max_tests, test_find_max_basic) {
    int arr[] = {1, 2, 3, 4, 5};
    cr_expect_eq(find_max(arr, 5), 5);
}

Test(find_max_tests, test_find_max_negative_numbers) {
    int arr[] = {-1, -2, -3, -4};
    cr_expect_eq(find_max(arr, 4), -1);
}

Test(find_max_tests, test_find_max_with_zero) {
    int arr[] = {0, 2, 3, 5};
    cr_expect_eq(find_max(arr, 4), 5);
}

Test(find_max_tests, test_find_max_single_element) {
    int arr[] = {10};
    cr_expect_eq(find_max(arr, 1), 10);
}

Test(find_max_tests, test_find_max_mixed_numbers) {
    int arr[] = {1, -1, 3, -5, 7};
    cr_expect_eq(find_max(arr, 5), 7);
}', 'C');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (21, 16, e'public class Solution {
    public static int findMax(int[] arr) {
        int max = arr[0];
	//find max and return it
        return max;
    }
}', e'public class Solution {
    public static int findMax(int[] arr) {
        int max = arr[0];
        for (int num : arr) {
            if (num > max) {
                max = num;
            }
        }
        return max;
    }
}', e'import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SolutionTests {

    @Test
    public void testFindMaxBasic() {
        assertEquals(5, Solution.findMax(new int[]{1, 2, 3, 4, 5}));
    }

    @Test
    public void testFindMaxNegativeNumbers() {
        assertEquals(-1, Solution.findMax(new int[]{-1, -2, -3, -4}));
    }

    @Test
    public void testFindMaxWithZero() {
        assertEquals(5, Solution.findMax(new int[]{0, 2, 3, 5}));
    }

    @Test
    public void testFindMaxSingleElement() {
        assertEquals(10, Solution.findMax(new int[]{10}));
    }

    @Test
    public void testFindMaxMixedNumbers() {
        assertEquals(7, Solution.findMax(new int[]{1, -1, 3, -5, 7}));
    }
}', 'Java');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (34, 20, e'#include <math.h>
#include <stdbool.h>

// Function to check if a number is prime
bool isPrime(int N) {
    return true;
}', e'#include <math.h>
#include <stdbool.h>

// Function to check if a number is prime
bool isPrime(int N) {
    if (N <= 1) {
        return false;
    }
    for (int i = 2; i <= sqrt(N); i++) {
        if (N % i == 0) {
            return false;
        }
    }
    return true;
}', e'#include <criterion/criterion.h>
#include <criterion/new/assert.h>

// Extern declaration of the isPrime function (assumed to be defined externally)
extern int isPrime(int n);

// Test cases for isPrime function
Test(PrimeTest, BasicTests) {
    // Test the basic prime numbers and non-prime numbers
    cr_assert_eq(isPrime(1), false, "1 should not be prime");
    cr_assert_eq(isPrime(2), true, "2 is prime");
    cr_assert_eq(isPrime(3), true, "3 is prime");
    cr_assert_eq(isPrime(4), false, "4 should not be prime");
    cr_assert_eq(isPrime(5), true, "5 is prime");
    cr_assert_eq(isPrime(6), false, "6 should not be prime");
}

Test(PrimeTest, NegativeAndZeroCases) {
    // Test negative numbers and zero, which are not prime
    cr_assert_eq(isPrime(0), false, "0 should not be prime");
    cr_assert_eq(isPrime(-1), false, "-1 should not be prime");
    cr_assert_eq(isPrime(-13), false, "-13 should not be prime");
    cr_assert_eq(isPrime(-97), false, "-97 should not be prime");
}

Test(PrimeTest, LargerPrimeNumbers) {
    // Test with large prime numbers
    cr_assert_eq(isPrime(9999991), true, "9999991 should be prime");
    cr_assert_eq(isPrime(104729), true, "104729 should be prime");  // Known large prime number
}

Test(PrimeTest, KnownCompositeNumbers) {
    // Test composite numbers to ensure they return false
    cr_assert_eq(isPrime(25), false, "25 should not be prime");
    cr_assert_eq(isPrime(49), false, "49 should not be prime");
    cr_assert_eq(isPrime(81), false, "81 should not be prime");
    cr_assert_eq(isPrime(100), false, "100 should not be prime");
    cr_assert_eq(isPrime(200), false, "200 should not be prime");
}

Test(PrimeTest, LargerNonPrimeNumbers) {
    // Test larger non-prime numbers
    cr_assert_eq(isPrime(1000000), false, "1000000 should not be prime");
    cr_assert_eq(isPrime(1000001), false, "1000001 should not be prime");
    cr_assert_eq(isPrime(999996), false, "999996 should not be prime");
}

Test(PrimeTest, EdgePrimeTests) {
    // Test known edge primes and numbers around them
    cr_assert_eq(isPrime(17), true, "17 should be prime");
    cr_assert_eq(isPrime(19), true, "19 should be prime");
    cr_assert_eq(isPrime(23), true, "23 should be prime");
    cr_assert_eq(isPrime(29), true, "29 should be prime");
}

Test(PrimeTest, EdgeNonPrimeTests) {
    // Test edge non-prime numbers
    cr_assert_eq(isPrime(18), false, "18 should not be prime");
    cr_assert_eq(isPrime(20), false, "20 should not be prime");
    cr_assert_eq(isPrime(30), false, "30 should not be prime");
    cr_assert_eq(isPrime(50), false, "50 should not be prime");
    cr_assert_eq(isPrime(60), false, "60 should not be prime");
}', 'C');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (23, 17, e'def fibonacci(n):
    return pass', e'def fibonacci(n):
    if n == 0:
        return 0
    elif n == 1:
        return 1
    else:
        a, b = 0, 1
        for _ in range(2, n + 1):
            a, b = b, a + b
        return b', e'import unittest
from solution import fibonacci

class TestFibonacci(unittest.TestCase):

    def test_fibonacci_zero(self):
        self.assertEqual(fibonacci(0), 0)

    def test_fibonacci_one(self):
        self.assertEqual(fibonacci(1), 1)

    def test_fibonacci_small(self):
        self.assertEqual(fibonacci(5), 5)

    def test_fibonacci_medium(self):
        self.assertEqual(fibonacci(10), 55)

    def test_fibonacci_large(self):
        self.assertEqual(fibonacci(20), 6765)

if __name__ == "__main__":
    unittest.main()', 'Python');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (24, 17, e'public class Solution {
    public static int fibonacci(int n) {
	//write a function to return nth fib number
    }
}', e'public class Solution {
    public static int fibonacci(int n) {
        if (n == 0) return 0;
        if (n == 1) return 1;
        int a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            int temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }
}', e'import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SolutionTests {

    @Test
    public void testFibonacciZero() {
        assertEquals(0, Solution.fibonacci(0));
    }

    @Test
    public void testFibonacciOne() {
        assertEquals(1, Solution.fibonacci(1));
    }

    @Test
    public void testFibonacciSmall() {
        assertEquals(5, Solution.fibonacci(5));
    }

    @Test
    public void testFibonacciMedium() {
        assertEquals(55, Solution.fibonacci(10));
    }

    @Test
    public void testFibonacciLarge() {
        assertEquals(6765, Solution.fibonacci(20));
    }
}', 'Java');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (16, 14, e'#include <stdio.h>
#include <stdlib.h>

char** fizzbuzz(int n) {
    char** result = malloc(n * sizeof(char*));
    return result;
}

void free_fizzbuzz(char** result, int n) {
    for (int i = 0; i < n; i++) {
        free(result[i]);
    }
    free(result);
}', e'#include <stdio.h>
#include <stdlib.h>

char** fizzbuzz(int n) {
    char** result = malloc(n * sizeof(char*));
    if(n == 0){
	return NULL;
    }
    for (int i = 0; i < n; i++) {
        result[i] = malloc(10 * sizeof(char));
        if ((i + 1) % 3 == 0 && (i + 1) % 5 == 0) {
            sprintf(result[i], "FizzBuzz");
        } else if ((i + 1) % 3 == 0) {
            sprintf(result[i], "Fizz");
        } else if ((i + 1) % 5 == 0) {
            sprintf(result[i], "Buzz");
        } else {
            sprintf(result[i], "%d", i + 1);
        }
    }
    return result;
}

void free_fizzbuzz(char** result, int n) {
    for (int i = 0; i < n; i++) {
        free(result[i]);
    }
    free(result);
}', e'#include <criterion/criterion.h>
#include <criterion/new/assert.h>

extern char** fizzbuzz(int n);
extern void free_fizzbuzz(char** arr, int n);

Test(fizzbuzz_tests, test_basic_cases) {
    char** result = fizzbuzz(5);
    cr_expect_str_eq(result[0], "1");
    cr_expect_str_eq(result[1], "2");
    cr_expect_str_eq(result[2], "Fizz");
    cr_expect_str_eq(result[3], "4");
    cr_expect_str_eq(result[4], "Buzz");
    free_fizzbuzz(result, 5);
}

Test(fizzbuzz_tests, test_large_number) {
    char** result = fizzbuzz(15);
    cr_expect_str_eq(result[14], "FizzBuzz");
    cr_expect_str_eq(result[9], "Buzz");
    cr_expect_str_eq(result[2], "Fizz");
    free_fizzbuzz(result, 15);
}

Test(fizzbuzz_tests, test_edge_cases) {
    char** result = fizzbuzz(0);
    cr_expect_null(result, "Expected NULL for N=0");

    result = fizzbuzz(1);
    cr_expect_str_eq(result[0], "1");
    free_fizzbuzz(result, 1);

    result = fizzbuzz(2);
    cr_expect_str_eq(result[0], "1");
    cr_expect_str_eq(result[1], "2");
    free_fizzbuzz(result, 2);
}

Test(fizzbuzz_tests, test_only_fizz) {
    char** result = fizzbuzz(9);
    cr_expect_str_eq(result[2], "Fizz");
    cr_expect_str_eq(result[5], "Fizz");
    cr_expect_str_eq(result[8], "Fizz");
    free_fizzbuzz(result, 9);
}

Test(fizzbuzz_tests, test_only_buzz) {
    char** result = fizzbuzz(10);
    cr_expect_str_eq(result[4], "Buzz");
    cr_expect_str_eq(result[9], "Buzz");
    free_fizzbuzz(result, 10);
}

Test(fizzbuzz_tests, test_only_fizzbuzz) {
    char** result = fizzbuzz(30);
    cr_expect_str_eq(result[14], "FizzBuzz");
    cr_expect_str_eq(result[29], "FizzBuzz");
    free_fizzbuzz(result, 30);
}

Test(fizzbuzz_tests, test_large_n) {
    char** result = fizzbuzz(30);
    cr_expect_str_eq(result[2], "Fizz");
    cr_expect_str_eq(result[4], "Buzz");
    cr_expect_str_eq(result[14], "FizzBuzz");
    cr_expect_str_eq(result[29], "FizzBuzz");
    cr_expect_str_eq(result[25], "26");
    free_fizzbuzz(result, 30);
}', 'C');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (20, 16, e'def find_max(arr):
    int maximum;
    #return maximum from given array arr
    return maximum', e'def find_max(arr):
    return max(arr)', e'import unittest
from solution import find_max

class TestFindMax(unittest.TestCase):

    def test_find_max_basic(self):
        self.assertEqual(find_max([1, 2, 3, 4, 5]), 5)

    def test_find_max_negative_numbers(self):
        self.assertEqual(find_max([-1, -2, -3, -4]), -1)

    def test_find_max_with_zero(self):
        self.assertEqual(find_max([0, 2, 3, 5]), 5)

    def test_find_max_single_element(self):
        self.assertEqual(find_max([10]), 10)

    def test_find_max_mixed_numbers(self):
        self.assertEqual(find_max([1, -1, 3, -5, 7]), 7)

if __name__ == "__main__":
    unittest.main()', 'Python');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (26, 18, e'def dfs(graph, start, visited=None, order=None):
    #retunr array with numbers sorted by dfs
    return order', e'def dfs(graph, start, visited=None, order=None):
    if visited is None:
        visited = set()
    if order is None:
        order = []

    visited.add(start)
    order.append(start)

    # Visit each neighbor of the current node
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited, order)

    return order', e'import unittest
from solution import dfs  # Assuming the dfs function is imported from your solution module

class TestDFS(unittest.TestCase):

    def test_dfs_case_1(self):
        graph = {
            0: [1, 2],
            1: [0, 3, 4],
            2: [0],
            3: [1],
            4: [1]
        }
        result = dfs(graph, 0)
        self.assertEqual(result, [0, 1, 3, 4, 2])

    def test_dfs_case_2(self):
        graph = {
            0: [1, 2, 3],
            1: [0],
            2: [0],
            3: [0]
        }
        result = dfs(graph, 0)
        self.assertEqual(result, [0, 1, 2, 3])

    def test_dfs_case_3(self):
        graph = {
            0: [1, 2],
            1: [0, 3],
            2: [0, 4],
            3: [1],
            4: [2]
        }
        result = dfs(graph, 0)
        self.assertEqual(result, [0, 1, 3, 2, 4])

    def test_dfs_case_4(self):
        graph = {
            0: [1],
            1: [0, 2],
            2: [1, 3],
            3: [2, 4],
            4: [3]
        }
        result = dfs(graph, 0)
        self.assertEqual(result, [0, 1, 2, 3, 4])

    def test_dfs_case_5(self):
        graph = {
            0: [1],
            1: [0, 2],
            2: [1, 3],
            3: [2],
            4: [5],
            5: [4]
        }
        result = dfs(graph, 0)
        self.assertEqual(result, [0, 1, 2, 3])

if __name__ == "__main__":
    unittest.main()', 'Python');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (28, 18, e'#include <stdlib.h>
#include <stdio.h>

typedef struct Node {
    int data;
    struct Node* next;
} Node;

typedef struct Graph {
    int numVertices;
    Node** adjLists;
} Graph;

void dfsHelper(Graph* graph, int vertex, int* visited, int* result, int* size) {
    //Your code goes here
}

int* dfs(Graph* graph, int start, int* size) {
    int* visited = (int*)calloc(graph->numVertices, sizeof(int));
    int* result = (int*)malloc(graph->numVertices * sizeof(int));
    *size = 0;

    dfsHelper(graph, start, visited, result, size);

    free(visited);
    return result;
}', e'#include <stdlib.h>
#include <stdio.h>

typedef struct Node {
    int data;
    struct Node* next;
} Node;

typedef struct Graph {
    int numVertices;
    Node** adjLists;
} Graph;

void dfsHelper(Graph* graph, int vertex, int* visited, int* result, int* size) {
    visited[vertex] = 1;
    result[*size] = vertex;
    (*size)++;

    Node* temp = graph->adjLists[vertex];
    while (temp) {
        if (!visited[temp->data]) {
            dfsHelper(graph, temp->data, visited, result, size);
        }
        temp = temp->next;
    }
}

int* dfs(Graph* graph, int start, int* size) {
    int* visited = (int*)calloc(graph->numVertices, sizeof(int));
    int* result = (int*)malloc(graph->numVertices * sizeof(int));
    *size = 0;

    dfsHelper(graph, start, visited, result, size);

    free(visited);
    return result;
}', e'#include <criterion/criterion.h>
#include <stdlib.h>
#include <stdio.h>

// Graph structure and Node definition (so it\'s visible to the test file)
typedef struct Node {
    int data;
    struct Node* next;
} Node;

typedef struct Graph {
    int numVertices;
    Node** adjLists;
} Graph;

extern int* dfs(Graph* graph, int start, int* size);

// Function to create a new graph
Graph* createGraph(int vertices) {
    Graph* graph = (Graph*)malloc(sizeof(Graph));
    graph->numVertices = vertices;
    graph->adjLists = (Node**)malloc(vertices * sizeof(Node*));

    for (int i = 0; i < vertices; i++) {
        graph->adjLists[i] = NULL;
    }

    return graph;
}

// Function to add an edge to the graph (append at the end of the list)
void addEdge(Graph* graph, int src, int dest) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->data = dest;
    newNode->next = NULL;

    if (graph->adjLists[src] == NULL) {
        graph->adjLists[src] = newNode;
    } else {
        Node* temp = graph->adjLists[src];
        while (temp->next != NULL) {
            temp = temp->next;
        }
        temp->next = newNode;
    }
}

// Function to free graph memory
void freeGraph(Graph* graph) {
    for (int i = 0; i < graph->numVertices; i++) {
        Node* temp = graph->adjLists[i];
        while (temp) {
            Node* toDelete = temp;
            temp = temp->next;
            free(toDelete);
        }
    }
    free(graph->adjLists);
    free(graph);
}

// Test case 1
Test(dfs_tests, test_case_1) {
    Graph* graph = createGraph(5);
    addEdge(graph, 0, 1);
    addEdge(graph, 0, 2);
    addEdge(graph, 1, 3);
    addEdge(graph, 1, 4);

    int size = 0;
    int* result = dfs(graph, 0, &size);

    int expected[] = {0, 1, 3, 4, 2};
    if (size != 5) {
        printf("Expected size: 5, Got size: %d\\n", size);
    }

    for (int i = 0; i < size; i++) {
        if (result[i] != expected[i]) {
            printf("Expected: ");
            for (int j = 0; j < size; j++) {
                printf("%d ", expected[j]);
            }
            printf("\\nGot: ");
            for (int j = 0; j < size; j++) {
                printf("%d ", result[j]);
            }
            printf("\\n");
            break;
        }
    }

    for (int i = 0; i < size; i++) {
        cr_expect_eq(result[i], expected[i], "Expected %d but got %d", expected[i], result[i]);
    }

    free(result);
    freeGraph(graph);
}

// Test case 2: Single vertex graph
Test(dfs_tests, test_case_2) {
    Graph* graph = createGraph(1);
    int size = 0;
    int* result = dfs(graph, 0, &size);

    int expected[] = {0};
    for (int i = 0; i < size; i++) {
        cr_expect_eq(result[i], expected[i], "Expected %d but got %d", expected[i], result[i]);
    }

    free(result);
    freeGraph(graph);
}

// Test case 3: Graph with no edges (only vertices)
Test(dfs_tests, test_case_3) {
    Graph* graph = createGraph(4);  // 4 vertices, no edges
    int size = 0;
    int* result = dfs(graph, 0, &size);

    int expected[] = {0};  // DFS should only return the starting vertex
    for (int i = 0; i < size; i++) {
        cr_expect_eq(result[i], expected[i], "Expected %d but got %d", expected[i], result[i]);
    }

    free(result);
    freeGraph(graph);
}

// Test case 4: Fully connected graph
Test(dfs_tests, test_case_4) {
    Graph* graph = createGraph(3);
    addEdge(graph, 0, 1);
    addEdge(graph, 1, 2);
    addEdge(graph, 2, 0);

    int size = 0;
    int* result = dfs(graph, 0, &size);

    int expected[] = {0, 1, 2};  // DFS starting from 0 should visit all vertices
    for (int i = 0; i < size; i++) {
        cr_expect_eq(result[i], expected[i], "Expected %d but got %d", expected[i], result[i]);
    }

    free(result);
    freeGraph(graph);
}

// Test case 5: Disconnected graph
Test(dfs_tests, test_case_5) {
    Graph* graph = createGraph(6);
    addEdge(graph, 0, 1);
    addEdge(graph, 2, 3);
    addEdge(graph, 4, 5);

    int size = 0;
    int* result = dfs(graph, 0, &size);

    int expected[] = {0, 1};  // DFS from vertex 0 should only visit 0 and 1
    for (int i = 0; i < size; i++) {
        cr_expect_eq(result[i], expected[i], "Expected %d but got %d", expected[i], result[i]);
    }

    free(result);
    freeGraph(graph);
}

// Test case 6: Cycle in graph
Test(dfs_tests, test_case_6) {
    Graph* graph = createGraph(4);
    addEdge(graph, 0, 1);
    addEdge(graph, 1, 2);
    addEdge(graph, 2, 3);
    addEdge(graph, 3, 0);  // This creates a cycle

    int size = 0;
    int* result = dfs(graph, 0, &size);

    int expected[] = {0, 1, 2, 3};  // DFS should visit all vertices once
    for (int i = 0; i < size; i++) {
        cr_expect_eq(result[i], expected[i], "Expected %d but got %d", expected[i], result[i]);
    }

    free(result);
    freeGraph(graph);
}', 'C');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (31, 19, e'#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>

typedef struct Node {
    int data;
    struct Node* next;
} Node;

typedef struct Graph {
    int numVertices;
    Node** adjLists;
} Graph;

typedef struct Queue {
    int* items;
    int front;
    int rear;
    int size;
} Queue;

// Function to initialize the queue
Queue* createQueue(int capacity) {
    Queue* queue = (Queue*)malloc(sizeof(Queue));
    queue->items = (int*)malloc(capacity * sizeof(int));
    queue->front = -1;
    queue->rear = -1;
    queue->size = capacity;
    return queue;
}

// Function to check if the queue is empty
bool isEmpty(Queue* queue) {
    return queue->front == -1;
}

// Function to enqueue an element
void enqueue(Queue* queue, int value) {
    if (queue->rear == queue->size - 1) return;  // Queue is full
    if (queue->front == -1) queue->front = 0;
    queue->items[++queue->rear] = value;
}

// Function to dequeue an element
int dequeue(Queue* queue) {
    if (isEmpty(queue)) return -1;  // Queue is empty
    int value = queue->items[queue->front];
    if (queue->front == queue->rear) {
        queue->front = queue->rear = -1;
    } else {
        queue->front++;
    }
    return value;
}

// BFS function
int* bfs(Graph* graph, int start, int* size) {
    int* visited = (int*)calloc(graph->numVertices, sizeof(int));
    int* result = (int*)malloc(graph->numVertices * sizeof(int));
    *size = 0;

    Queue* queue = createQueue(graph->numVertices);
    //your code goes here

    free(visited);
    free(queue->items);
    free(queue);

    return result;
}', e'#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>

typedef struct Node {
    int data;
    struct Node* next;
} Node;

typedef struct Graph {
    int numVertices;
    Node** adjLists;
} Graph;

typedef struct Queue {
    int* items;
    int front;
    int rear;
    int size;
} Queue;

// Function to initialize the queue
Queue* createQueue(int capacity) {
    Queue* queue = (Queue*)malloc(sizeof(Queue));
    queue->items = (int*)malloc(capacity * sizeof(int));
    queue->front = -1;
    queue->rear = -1;
    queue->size = capacity;
    return queue;
}

// Function to check if the queue is empty
bool isEmpty(Queue* queue) {
    return queue->front == -1;
}

// Function to enqueue an element
void enqueue(Queue* queue, int value) {
    if (queue->rear == queue->size - 1) return;  // Queue is full
    if (queue->front == -1) queue->front = 0;
    queue->items[++queue->rear] = value;
}

// Function to dequeue an element
int dequeue(Queue* queue) {
    if (isEmpty(queue)) return -1;  // Queue is empty
    int value = queue->items[queue->front];
    if (queue->front == queue->rear) {
        queue->front = queue->rear = -1;
    } else {
        queue->front++;
    }
    return value;
}

// BFS function
int* bfs(Graph* graph, int start, int* size) {
    int* visited = (int*)calloc(graph->numVertices, sizeof(int));
    int* result = (int*)malloc(graph->numVertices * sizeof(int));
    *size = 0;

    Queue* queue = createQueue(graph->numVertices);
    enqueue(queue, start);
    visited[start] = 1;

    while (!isEmpty(queue)) {
        int vertex = dequeue(queue);
        result[*size] = vertex;
        (*size)++;

        Node* temp = graph->adjLists[vertex];
        while (temp) {
            if (!visited[temp->data]) {
                enqueue(queue, temp->data);
                visited[temp->data] = 1;
            }
            temp = temp->next;
        }
    }

    free(visited);
    free(queue->items);
    free(queue);

    return result;
}', e'#include <criterion/criterion.h>
#include <stdlib.h>
#include <stdio.h>

// Graph structure and Node definition (so it\'s visible to the test file)
typedef struct Node {
    int data;
    struct Node* next;
} Node;

typedef struct Graph {
    int numVertices;
    Node** adjLists;
} Graph;

extern int* bfs(Graph* graph, int start, int* size);

// Function to create a new graph
Graph* createGraph(int vertices) {
    Graph* graph = (Graph*)malloc(sizeof(Graph));
    graph->numVertices = vertices;
    graph->adjLists = (Node**)malloc(vertices * sizeof(Node*));

    for (int i = 0; i < vertices; i++) {
        graph->adjLists[i] = NULL;
    }

    return graph;
}

// Function to add an edge to the graph (append at the end of the list)
void addEdge(Graph* graph, int src, int dest) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->data = dest;
    newNode->next = NULL;

    if (graph->adjLists[src] == NULL) {
        graph->adjLists[src] = newNode;
    } else {
        Node* temp = graph->adjLists[src];
        while (temp->next != NULL) {
            temp = temp->next;
        }
        temp->next = newNode;
    }
}

// Function to free graph memory
void freeGraph(Graph* graph) {
    for (int i = 0; i < graph->numVertices; i++) {
        Node* temp = graph->adjLists[i];
        while (temp) {
            Node* toDelete = temp;
            temp = temp->next;
            free(toDelete);
        }
    }
    free(graph->adjLists);
    free(graph);
}

// Test case 1
Test(bfs_tests, test_case_1) {
    Graph* graph = createGraph(5);
    addEdge(graph, 0, 1);
    addEdge(graph, 0, 2);
    addEdge(graph, 1, 3);
    addEdge(graph, 1, 4);

    int size = 0;
    int* result = bfs(graph, 0, &size);

    int expected[] = {0, 1, 2, 3, 4};
    if (size != 5) {
        printf("Expected size: 5, Got size: %d\\n", size);
    }

    for (int i = 0; i < size; i++) {
        if (result[i] != expected[i]) {
            printf("Expected: ");
            for (int j = 0; j < size; j++) {
                printf("%d ", expected[j]);
            }
            printf("\\nGot: ");
            for (int j = 0; j < size; j++) {
                printf("%d ", result[j]);
            }
            printf("\\n");
            break;
        }
    }

    for (int i = 0; i < size; i++) {
        cr_expect_eq(result[i], expected[i], "Expected %d but got %d", expected[i], result[i]);
    }

    free(result);
    freeGraph(graph);
}

// Test case 2: Single vertex graph
Test(bfs_tests, test_case_2) {
    Graph* graph = createGraph(1);
    int size = 0;
    int* result = bfs(graph, 0, &size);

    int expected[] = {0};
    for (int i = 0; i < size; i++) {
        cr_expect_eq(result[i], expected[i], "Expected %d but got %d", expected[i], result[i]);
    }

    free(result);
    freeGraph(graph);
}

// Test case 3: Graph with no edges (only vertices)
Test(bfs_tests, test_case_3) {
    Graph* graph = createGraph(4);  // 4 vertices, no edges
    int size = 0;
    int* result = bfs(graph, 0, &size);

    int expected[] = {0};  // BFS should only return the starting vertex
    for (int i = 0; i < size; i++) {
        cr_expect_eq(result[i], expected[i], "Expected %d but got %d", expected[i], result[i]);
    }

    free(result);
    freeGraph(graph);
}

// Test case 4: Fully connected graph
Test(bfs_tests, test_case_4) {
    Graph* graph = createGraph(3);
    addEdge(graph, 0, 1);
    addEdge(graph, 1, 2);
    addEdge(graph, 2, 0);

    int size = 0;
    int* result = bfs(graph, 0, &size);

    int expected[] = {0, 1, 2};  // BFS starting from 0 should visit all vertices
    for (int i = 0; i < size; i++) {
        cr_expect_eq(result[i], expected[i], "Expected %d but got %d", expected[i], result[i]);
    }

    free(result);
    freeGraph(graph);
}

// Test case 5: Disconnected graph
Test(bfs_tests, test_case_5) {
    Graph* graph = createGraph(6);
    addEdge(graph, 0, 1);
    addEdge(graph, 2, 3);
    addEdge(graph, 4, 5);

    int size = 0;
    int* result = bfs(graph, 0, &size);

    int expected[] = {0, 1};  // BFS from vertex 0 should only visit 0 and 1
    for (int i = 0; i < size; i++) {
        cr_expect_eq(result[i], expected[i], "Expected %d but got %d", expected[i], result[i]);
    }

    free(result);
    freeGraph(graph);
}

// Test case 6: Cycle in graph
Test(bfs_tests, test_case_6) {
    Graph* graph = createGraph(4);
    addEdge(graph, 0, 1);
    addEdge(graph, 1, 2);
    addEdge(graph, 2, 3);
    addEdge(graph, 3, 0);  // This creates a cycle

    int size = 0;
    int* result = bfs(graph, 0, &size);

    int expected[] = {0, 1, 2, 3};  // BFS should visit all vertices once
    for (int i = 0; i < size; i++) {
        cr_expect_eq(result[i], expected[i], "Expected %d but got %d", expected[i], result[i]);
    }

    free(result);
    freeGraph(graph);
}', 'C');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (32, 20, e'def isPrime(N):
    #return treu if n is prime else return false
    return True', e'def isPrime(N):
    if N <= 1:
        return False

    for i in range(2, int(N ** 0.5) + 1):
        if N % i == 0:
            return False

    return True', e'import unittest
from solution import isPrime

class TestPrime(unittest.TestCase):
    def test_isPrime(self):
        self.assertEqual(isPrime(1), False)
        self.assertEqual(isPrime(2), True)
        self.assertEqual(isPrime(3), True)
        self.assertEqual(isPrime(4), False)
        self.assertEqual(isPrime(5), True)
        self.assertEqual(isPrime(10), False)
        self.assertEqual(isPrime(13), True)
        self.assertEqual(isPrime(17), True)
        self.assertEqual(isPrime(25), False)
        self.assertEqual(isPrime(97), True)

    def test_negative_numbers(self):
        self.assertEqual(isPrime(-1), False)
        self.assertEqual(isPrime(-10), False)

    def test_large_prime(self):
        self.assertEqual(isPrime(104729), True)

    def test_large_non_prime(self):
        self.assertEqual(isPrime(104728), False)

if __name__ == \'__main__\':
    unittest.main()', 'Python');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (33, 20, e'public class Solution {
    // Method to check if a number is prime
    public static boolean isPrime(int N) {
	//your code goes here
        return true;
    }
}', e'// src/main/java/com/example/Prime.java
package com.example;

public class Prime {
    // Method to check if a number is prime
    public static boolean isPrime(int N) {
        if (N <= 1) {
            return false;
        }

        for (int i = 2; i <= Math.sqrt(N); i++) {
            if (N % i == 0) {
                return false;
            }
        }

        return true;
    }
}', e'import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SolutionTests{

    @Test
    public void testIsPrime() {
        // Test cases for the function isPrime
        assertFalse(Solution.isPrime(1), "Test case 1 failed");
        assertTrue(Solution.isPrime(2), "Test case 2 failed");
        assertTrue(Solution.isPrime(3), "Test case 3 failed");
        assertFalse(Solution.isPrime(4), "Test case 4 failed");
        assertTrue(Solution.isPrime(5), "Test case 5 failed");
        assertFalse(Solution.isPrime(10), "Test case 6 failed");
        assertTrue(Solution.isPrime(13), "Test case 7 failed");
        assertTrue(Solution.isPrime(17), "Test case 8 failed");
        assertFalse(Solution.isPrime(25), "Test case 9 failed");
        assertTrue(Solution.isPrime(97), "Test case 10 failed");
    }

    @Test
    public void testNegativeNumbers() {
        // Test case for negative numbers, should return false
        assertFalse(Solution.isPrime(-1), "Negative number test failed");
        assertFalse(Solution.isPrime(-10), "Negative number test failed");
    }

    @Test
    public void testLargePrime() {
        // Test case for large prime number
        assertTrue(Solution.isPrime(104729), "Large prime test failed");
    }

    @Test
    public void testLargeNonPrime() {
        // Test case for large non-prime number
        assertFalse(Solution.isPrime(104728), "Large non-prime test failed");
    }
}', 'Java');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (38, 22, e'# solution.py
class MatrixChainMultiplication:
    @staticmethod
    def matrixChainOrder(p):
        return result  # the result for the full chain', e'# solution.py
class MatrixChainMultiplication:
    @staticmethod
    def matrixChainOrder(p):
        n = len(p) - 1  # number of matrices
        dp = [[0] * n for _ in range(n)]  # dp[i][j] will hold the minimum number of multiplications

        # l is chain length
        for length in range(2, n+1):  # length of subproblem chain (starting from length 2)
            for i in range(n - length + 1):
                j = i + length - 1  # ending matrix index for this subproblem
                dp[i][j] = float(\'inf\')  # initialize with infinity
                for k in range(i, j):  # try all possible positions for the split
                    q = dp[i][k] + dp[k+1][j] + p[i] * p[k+1] * p[j+1]
                    dp[i][j] = min(dp[i][j], q)  # choose the minimum cost

        return dp[0][n-1]  # the result for the full chain', e'# test_solution.py
import unittest
from solution import MatrixChainMultiplication  # Import the class from solution.py

class MatrixChainMultiplicationTests(unittest.TestCase):

    def testExampleCase(self):
        p = [5, 10, 15, 20, 25]
        result = MatrixChainMultiplication.matrixChainOrder(p)
        self.assertEqual(result, 4750, "The minimum multiplication cost should be 18000")

    def testCase1(self):
        p = [5, 10, 3, 12, 20, 7]
        result = MatrixChainMultiplication.matrixChainOrder(p)
        self.assertEqual(result, 1395, "The minimum multiplication cost should be 1510")

    def testCase2(self):
        p = [10, 30, 5, 60]
        result = MatrixChainMultiplication.matrixChainOrder(p)
        self.assertEqual(result, 4500, "The minimum multiplication cost should be 4500")

    def testEdgeCase(self):
        p = [10, 20, 30]
        result = MatrixChainMultiplication.matrixChainOrder(p)
        self.assertEqual(result, 6000, "The minimum multiplication cost should be 6000")

    def testSingleMatrix(self):
        p = [10, 20]
        result = MatrixChainMultiplication.matrixChainOrder(p)
        self.assertEqual(result, 0, "The cost for a single matrix should be 0")

if __name__ == \'__main__\':
    unittest.main()', 'Python');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (37, 21, e'# solution.py
import re

class Solution:
    @staticmethod
    def palindromeCheck(s: str) -> bool:', e'# solution.py
import re

class Solution:
    @staticmethod
    def palindromeCheck(s: str) -> bool:
        # Remove non-alphanumeric characters and convert to lowercase
        s = re.sub(r\'[^a-zA-Z0-9]\', \'\', s).lower()
        return s == s[::-1]', e'# test_solution.py
import unittest
from solution import Solution  # Import the Solution class from solution.py

class SolutionTests(unittest.TestCase):

    def testBasicPalindrome(self):
        self.assertTrue(Solution.palindromeCheck("madam"), \'"madam" should be a palindrome\')
        self.assertTrue(Solution.palindromeCheck("racecar"), \'"racecar" should be a palindrome\')
        self.assertTrue(Solution.palindromeCheck("level"), \'"level" should be a palindrome\')

    def testNonPalindrome(self):
        self.assertFalse(Solution.palindromeCheck("hello"), \'"hello" should not be a palindrome\')
        self.assertFalse(Solution.palindromeCheck("world"), \'"world" should not be a palindrome\')
        self.assertFalse(Solution.palindromeCheck("abcdef"), \'"abcdef" should not be a palindrome\')

    def testEdgeCases(self):
        self.assertTrue(Solution.palindromeCheck(""), "Empty string should be considered a palindrome")
        self.assertTrue(Solution.palindromeCheck("a"), \'"a" should be considered a palindrome\')
        self.assertFalse(Solution.palindromeCheck("ab"), \'"ab" should not be a palindrome\')

    def testCaseSensitivity(self):
        self.assertTrue(Solution.palindromeCheck("Madam"), \'"Madam" should be a palindrome (case insensitive)\')
        self.assertTrue(Solution.palindromeCheck("RaceCar"), \'"RaceCar" should be a palindrome (case insensitive)\')
        self.assertFalse(Solution.palindromeCheck("Hello"), \'"Hello" should not be a palindrome (case sensitive)\')

    def testSpacesAndPunctuation(self):
        self.assertTrue(Solution.palindromeCheck("A man, a plan, a canal, Panama"),
                        \'"A man, a plan, a canal, Panama" should be a palindrome (ignoring punctuation and spaces)\')
        self.assertTrue(Solution.palindromeCheck("Was it a car or a cat I saw?"),
                        \'"Was it a car or a cat I saw?" should be a palindrome (ignoring punctuation and spaces)\')
        self.assertTrue(Solution.palindromeCheck("No \\\'x\\\' in Nixon"),
                        \'"No \\\'x\\\' in Nixon" should be a palindrome (ignoring punctuation and spaces)\')

    def testLongStrings(self):
        self.assertTrue(Solution.palindromeCheck("abcdefghijklmnopqrstuvwxyzzyxwvutsrqponmlkjihgfedcba"),
                        "Long palindrome string should be a palindrome")
        self.assertFalse(Solution.palindromeCheck("thisisaverylongstringthatshouldnotbeapalindrome"),
                         "Long non-palindrome string should not be a palindrome")

    def testSpecialCharacters(self):
        self.assertTrue(Solution.palindromeCheck("!@#$$#@!"),
                        \'"!@#$$#@!" should be a palindrome (ignoring special characters)\')
        self.assertTrue(Solution.palindromeCheck("!!a@a!!"),
                        \'"!!a@a!!" should be a palindrome\')
        self.assertFalse(Solution.palindromeCheck("hello!"),
                         \'"hello!" should not be a palindrome\')

if __name__ == \'__main__\':
    unittest.main()', 'Python');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (49, 25, e'public class Solution {
    public static int knapsack(int n, int W, int[] weights, int[] values) {
        //Your code goes here
    }
}', e'public class Solution {
    public static int knapsack(int n, int W, int[] weights, int[] values) {
        int[][] dp = new int[n + 1][W + 1];

        // Fill the DP table
        for (int i = 1; i <= n; i++) {
            for (int w = 1; w <= W; w++) {
                if (weights[i - 1] <= w) {
                    dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }
        return dp[n][W];
    }
}', e'import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SolutionTests {
    @Test
    public void testKnapsack() {
        assertEquals(9, Solution.knapsack(4, 7, new int[]{2, 3, 4, 5}, new int[]{3, 4, 5, 6}));
        assertEquals(5, Solution.knapsack(3, 4, new int[]{2, 3, 4}, new int[]{3, 4, 5}));
        assertEquals(11, Solution.knapsack(3, 5, new int[]{1, 2, 3}, new int[]{2, 4, 7}));
        assertEquals(0, Solution.knapsack(3, 1, new int[]{5, 3, 4}, new int[]{10, 7, 6}));
        assertEquals(20, Solution.knapsack(2, 10, new int[]{5, 7}, new int[]{10, 20}));
    }
}', 'Java');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (44, 24, e'def is_balanced(s: str) -> bool:
    #Your code goes here', e'def is_balanced(s: str) -> bool:
    stack = []
    pairs = {\')\': \'(\', \'}\': \'{\', \']\': \'[\'}

    for char in s:
        if char in "({[":
            stack.append(char)
        elif char in ")}]":
            if not stack or stack.pop() != pairs[char]:
                return False

    return not stack', e'import unittest
from solution import is_balanced

class TestBalancedParentheses(unittest.TestCase):
    def test_valid_cases(self):
        self.assertTrue(is_balanced("(){}[]"))
        self.assertTrue(is_balanced("({[]})"))
        self.assertTrue(is_balanced(""))

    def test_invalid_cases(self):
        self.assertFalse(is_balanced("(]"))
        self.assertFalse(is_balanced("({[)]}"))
        self.assertFalse(is_balanced("((("))

if __name__ == \'__main__\':
    unittest.main()', 'Python');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (45, 24, e'import java.util.Stack;

public class Solution {
    public static boolean isBalanced(String s) {
        //Your code goes here
    }
}', e'import java.util.Stack;

public class Solution {
    public static boolean isBalanced(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == \'(\' || c == \'{\' || c == \'[\') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) return false;
                char last = stack.pop();
                if ((c == \')\' && last != \'(\') ||
                    (c == \'}\' && last != \'{\') ||
                    (c == \']\' && last != \'[\')) {
                    return false;
                }
            }
        }
        return stack.isEmpty();
    }
}', e'import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SolutionTests {
    @Test
    public void testValidCases() {
        assertTrue(Solution.isBalanced("(){}[]"));
        assertTrue(Solution.isBalanced("({[]})"));
        assertTrue(Solution.isBalanced(""));
    }

    @Test
    public void testInvalidCases() {
        assertFalse(Solution.isBalanced("(]"));
        assertFalse(Solution.isBalanced("({[)]}"));
        assertFalse(Solution.isBalanced("((("));
    }
}', 'Java');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (41, 23, e'def merge_sort(arr):
	#your code goes here', e'def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)

def merge(left, right):
    sorted_arr = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            sorted_arr.append(left[i])
            i += 1
        else:
            sorted_arr.append(right[j])
            j += 1

    sorted_arr.extend(left[i:])
    sorted_arr.extend(right[j:])

    return sorted_arr', e'import unittest
from solution import merge_sort

class TestMergeSort(unittest.TestCase):

    def test_basic_case(self):
        self.assertEqual(merge_sort([38, 27, 43, 3, 9, 82, 10]), [3, 9, 10, 27, 38, 43, 82])

    def test_negative_numbers(self):
        self.assertEqual(merge_sort([-1, -5, -3, -4, 0]), [-5, -4, -3, -1, 0])

    def test_already_sorted(self):
        self.assertEqual(merge_sort([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5])

    def test_reverse_sorted(self):
        self.assertEqual(merge_sort([5, 4, 3, 2, 1]), [1, 2, 3, 4, 5])

    def test_single_element(self):
        self.assertEqual(merge_sort([42]), [42])

if __name__ == \'__main__\':
    unittest.main()', 'Python');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (42, 23, e'import java.util.Arrays;

public class Solution {
    public static void mergeSort(int[] arr) {

    }
}', e'import java.util.Arrays;

public class Solution {
    public static void mergeSort(int[] arr) {
        if (arr.length < 2) return;

        int mid = arr.length / 2;
        int[] left = Arrays.copyOfRange(arr, 0, mid);
        int[] right = Arrays.copyOfRange(arr, mid, arr.length);

        mergeSort(left);
        mergeSort(right);
        merge(arr, left, right);
    }

    private static void merge(int[] arr, int[] left, int[] right) {
        int i = 0, j = 0, k = 0;

        while (i < left.length && j < right.length) {
            arr[k++] = (left[i] <= right[j]) ? left[i++] : right[j++];
        }

        while (i < left.length) arr[k++] = left[i++];
        while (j < right.length) arr[k++] = right[j++];
    }
}', e'import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;

public class SolutionTests {
    @Test
    public void testBasicCase() {
        int[] arr = {38, 27, 43, 3, 9, 82, 10};
        int[] expected = {3, 9, 10, 27, 38, 43, 82};
        Solution.mergeSort(arr);
        assertArrayEquals(expected, arr);
    }

    @Test
    public void testSingleElement() {
        int[] arr = {42};
        int[] expected = {42};
        Solution.mergeSort(arr);
        assertArrayEquals(expected, arr);
    }
}', 'Java');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (43, 23, e'#include <stdio.h>

void merge_sort(int arr[], int left, int right) {
    //Your code goes here
}', e'#include <stdio.h>

void merge(int arr[], int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;

    int L[n1], R[n2];

    for (int i = 0; i < n1; i++) L[i] = arr[left + i];
    for (int j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k++] = L[i++];
        } else {
            arr[k++] = R[j++];
        }
    }

    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void merge_sort(int arr[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;

        merge_sort(arr, left, mid);
        merge_sort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}', e'#include <criterion/criterion.h>
extern void merge_sort(int arr[], int left, int right);

Test(MergeSort, BasicCase) {
    int arr[] = {38, 27, 43, 3, 9, 82, 10};
    int expected[] = {3, 9, 10, 27, 38, 43, 82};
    merge_sort(arr, 0, 6);
    for (int i = 0; i < 7; i++) {
        cr_assert_eq(arr[i], expected[i]);
    }
}

Test(MergeSort, SingleElement) {
    int arr[] = {42};
    int expected[] = {42};
    merge_sort(arr, 0, 0);
    cr_assert_eq(arr[0], expected[0]);
}', 'C');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (47, 25, e'def knapsack(n, W, weights, values):
    #your code goes here', e'def knapsack(n, W, weights, values):
    # Initialize DP table
    dp = [[0 for _ in range(W + 1)] for _ in range(n + 1)]

    # Fill the DP table
    for i in range(1, n + 1):
        for w in range(1, W + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])
            else:
                dp[i][w] = dp[i - 1][w]

    return dp[n][W]', e'import unittest
from solution import knapsack

class TestKnapsack(unittest.TestCase):
    def test_knapsack(self):
        self.assertEqual(knapsack(4, 7, [2, 3, 4, 5], [3, 4, 5, 6]), 9)
        self.assertEqual(knapsack(3, 4, [2, 3, 4], [3, 4, 5]), 5)
        self.assertEqual(knapsack(3, 5, [1, 2, 3], [2, 4, 7]), 11)
        self.assertEqual(knapsack(3, 1, [5, 3, 4], [10, 7, 6]), 0)
        self.assertEqual(knapsack(2, 10, [5, 7], [10, 20]), 20)

if __name__ == \'__main__\':
    unittest.main()', 'Python');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (48, 25, e'#include <stdio.h>

int knapsack(int n, int W, int weights[], int values[]) {
    //Your code goes here
}', e'#include <stdio.h>

int knapsack(int n, int W, int weights[], int values[]) {
    int dp[n + 1][W + 1];

    // Initialize DP table
    for (int i = 0; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            dp[i][w] = 0;
        }
    }

    // Fill the DP table
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (weights[i - 1] <= w) {
                dp[i][w] = (dp[i - 1][w] > dp[i - 1][w - weights[i - 1]] + values[i - 1])
                            ? dp[i - 1][w]
                            : dp[i - 1][w - weights[i - 1]] + values[i - 1];
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    return dp[n][W];
}', e'#include <criterion/criterion.h>

// Declare the knapsack function without including the entire header
extern int knapsack(int n, int w, int weights[], int values[]);

Test(knapsack_tests, test_knapsack) {
    // Test cases with the corrected expected values
    cr_assert_eq(knapsack(4, 7, (int[]){2, 3, 4, 5}, (int[]){3, 4, 5, 6}), 9);
    cr_assert_eq(knapsack(3, 4, (int[]){2, 3, 4}, (int[]){3, 4, 5}), 5);
    cr_assert_eq(knapsack(3, 5, (int[]){1, 2, 3}, (int[]){2, 4, 7}), 11);
    cr_assert_eq(knapsack(3, 1, (int[]){5, 3, 4}, (int[]){10, 7, 6}), 0);
    cr_assert_eq(knapsack(2, 10, (int[]){5, 7}, (int[]){10, 20}), 20);  // Corrected expected result
}', 'C');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (39, 22, e'public class Solution {
    private int[][] dp;

    public int matrixChainOrder(int[] p) {
 	//Your code goes here
    }
}', e'public class Solution {
    private int[][] dp;

    public int matrixChainOrder(int[] p) {
        int n = p.length - 1; // Number of matrices
        dp = new int[n + 1][n + 1];

        // Fill dp array with -1 (indicating uncomputed values)
        for (int i = 0; i <= n; i++) {
            for (int j = 0; j <= n; j++) {
                dp[i][j] = -1;
            }
        }

        return solve(p, 1, n);
    }

    private int solve(int[] p, int i, int j) {
        if (i == j) {
            return 0;
        }
        if (dp[i][j] != -1) {
            return dp[i][j];
        }

        dp[i][j] = Integer.MAX_VALUE;
        for (int k = i; k < j; k++) {
            int cost = solve(p, i, k) + solve(p, k + 1, j) + p[i - 1] * p[k] * p[j];
            dp[i][j] = Math.min(dp[i][j], cost);
        }

        return dp[i][j];
    }
}', e'import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

public class SolutionTests {

    @Test
    public void testExampleCase() {
        Solution mcm = new Solution();
        int[] p = {5, 10, 15, 20, 25};
        assertEquals(4750, mcm.matrixChainOrder(p), "The minimum multiplication cost should be 18000");
    }

    @Test
    public void testCase1() {
        Solution mcm = new Solution();
        int[] p = {5, 10, 3, 12, 20, 7};
        assertEquals(1395, mcm.matrixChainOrder(p), "The minimum multiplication cost should be 1510");
    }

    @Test
    public void testCase2() {
        Solution mcm = new Solution();
        int[] p = {10, 30, 5, 60};
        assertEquals(4500, mcm.matrixChainOrder(p), "The minimum multiplication cost should be 4500");
    }

    @Test
    public void testEdgeCase() {
        Solution mcm = new Solution();
        int[] p = {10, 20, 30};
        assertEquals(6000, mcm.matrixChainOrder(p), "The minimum multiplication cost should be 6000");
    }

    @Test
    public void testSingleMatrix() {
        Solution mcm = new Solution();
        int[] p = {10, 20};
        assertEquals(0, mcm.matrixChainOrder(p), "The cost for a single matrix should be 0");
    }
}', 'Java');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (40, 22, e'#include <limits.h>

#define MAX_N 50  // Maximum number of matrices
int dp[MAX_N][MAX_N]; // Memoization table

// Main function to calculate minimum multiplication cost
int matrixChainOrder(int p[], int n) {

}', e'#include <limits.h>

#define MAX_N 50  // Maximum number of matrices
int dp[MAX_N][MAX_N]; // Memoization table

// Recursive function with memoization
int matrixChainOrderHelper(int p[], int i, int j) {
    if (i == j) {
        return 0;
    }
    if (dp[i][j] != -1) {
        return dp[i][j];
    }

    dp[i][j] = INT_MAX;
    for (int k = i; k < j; k++) {
        int cost = matrixChainOrderHelper(p, i, k) +
                   matrixChainOrderHelper(p, k + 1, j) +
                   p[i - 1] * p[k] * p[j];
        if (cost < dp[i][j]) {
            dp[i][j] = cost;
        }
    }
    return dp[i][j];
}

// Main function to calculate minimum multiplication cost
int matrixChainOrder(int p[], int n) {
    // Initialize DP table with -1
    for (int i = 0; i < MAX_N; i++) {
        for (int j = 0; j < MAX_N; j++) {
            dp[i][j] = -1;
        }
    }
    return matrixChainOrderHelper(p, 1, n - 1);
}', e'#include <criterion/criterion.h>

extern int matrixChainOrder(int p[], int n);  // Use extern to import only the function

Test(matrix_chain, test_example_case) {
    int p[] = {5, 10, 15, 20, 25};
    int n = sizeof(p) / sizeof(p[0]);
    cr_assert_eq(matrixChainOrder(p, n), 4750, "Expected 18000");
}

Test(matrix_chain, test_case1) {
    int p[] = {5, 10, 3, 12, 20, 7};
    int n = sizeof(p) / sizeof(p[0]);
    cr_assert_eq(matrixChainOrder(p, n), 1395, "Expected 1510");
}

Test(matrix_chain, test_case2) {
    int p[] = {10, 30, 5, 60};
    int n = sizeof(p) / sizeof(p[0]);
    cr_assert_eq(matrixChainOrder(p, n), 4500, "Expected 4500");
}

Test(matrix_chain, test_edge_case) {
    int p[] = {10, 20, 30};
    int n = sizeof(p) / sizeof(p[0]);
    cr_assert_eq(matrixChainOrder(p, n), 6000, "Expected 6000");
}

Test(matrix_chain, test_single_matrix) {
    int p[] = {10, 20};
    int n = sizeof(p) / sizeof(p[0]);
    cr_assert_eq(matrixChainOrder(p, n), 0, "Expected 0");
}', 'C');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (35, 21, e'#include <ctype.h>
#include <string.h>

// Function to check if the string is a palindrome
int palindromeCheck(const char* str) {
    return 1;  // 1 if its palindrome 0 if not
}', e'#include <ctype.h>
#include <string.h>

// Helper function to clean up the string
char* cleanString(const char* str) {
    int len = strlen(str);
    char* cleaned = (char*)malloc(len + 1);
    int j = 0;

    // Iterate through the string, ignoring non-alphanumeric characters
    for (int i = 0; i < len; i++) {
        if (isalnum(str[i])) {
            cleaned[j++] = tolower(str[i]);
        }
    }
    cleaned[j] = \'\\0\';  // Null-terminate the cleaned string
    return cleaned;
}

// Function to check if the string is a palindrome
int palindromeCheck(const char* str) {
    // Clean the string
    char* cleaned = cleanString(str);
    int len = strlen(cleaned);

    // Check for palindrome by comparing characters from both ends
    for (int i = 0; i < len / 2; i++) {
        if (cleaned[i] != cleaned[len - i - 1]) {
            free(cleaned);
            return 0;  // Not a palindrome
        }
    }

    free(cleaned);
    return 1;  // It\'s a palindrome
}', e'#include <criterion/criterion.h>
#include <criterion/new/assert.h>

extern int palindromeCheck(const char* str);

Test(PalindromeTest, BasicTests) {
    cr_assert_eq(palindromeCheck("madam"), 1, "\\"madam\\" should be a palindrome");
    cr_assert_eq(palindromeCheck("racecar"), 1, "\\"racecar\\" should be a palindrome");
    cr_assert_eq(palindromeCheck("level"), 1, "\\"level\\" should be a palindrome");
}

Test(PalindromeTest, NonPalindromeTests) {
    cr_assert_eq(palindromeCheck("hello"), 0, "\\"hello\\" should not be a palindrome");
    cr_assert_eq(palindromeCheck("world"), 0, "\\"world\\" should not be a palindrome");
    cr_assert_eq(palindromeCheck("abcdef"), 0, "\\"abcdef\\" should not be a palindrome");
}

Test(PalindromeTest, EdgeCases) {
    cr_assert_eq(palindromeCheck(""), 1, "Empty string should be considered a palindrome");
    cr_assert_eq(palindromeCheck("a"), 1, "\\"a\\" should be considered a palindrome");
    cr_assert_eq(palindromeCheck("ab"), 0, "\\"ab\\" should not be a palindrome");
}

Test(PalindromeTest, CaseSensitivityTests) {
    cr_assert_eq(palindromeCheck("Madam"), 1, "\\"Madam\\" should be a palindrome (if case insensitive)");
    cr_assert_eq(palindromeCheck("RaceCar"), 1, "\\"RaceCar\\" should be a palindrome (if case insensitive)");
    cr_assert_eq(palindromeCheck("Hello"), 0, "\\"Hello\\" should not be a palindrome (case sensitive)");
}

Test(PalindromeTest, SpacesAndPunctuation) {
    cr_assert_eq(palindromeCheck("A man, a plan, a canal, Panama"), 1, "\\"A man, a plan, a canal, Panama\\" should be a palindrome (ignoring punctuation and spaces)");
    cr_assert_eq(palindromeCheck("Was it a car or a cat I saw?"), 1, "\\"Was it a car or a cat I saw?\\" should be a palindrome (ignoring punctuation and spaces)");
    cr_assert_eq(palindromeCheck("No \'x\' in Nixon"), 1, "\\" No \'x\' in Nixon \\" should be a palindrome (ignoring punctuation and spaces)");
}

Test(PalindromeTest, LongStrings) {
    cr_assert_eq(palindromeCheck("abcdefghijklmnopqrstuvwxyzzyxwvutsrqponmlkjihgfedcba"), 1, "Long palindrome string should be a palindrome");
    cr_assert_eq(palindromeCheck("thisisaverylongstringthatshouldnotbeapalindrome"), 0, "Long non-palindrome string should not be a palindrome");
}

Test(PalindromeTest, SpecialCharacters) {
    cr_assert_eq(palindromeCheck("!@#$$#@!"), 1, "\\"!@#$$#@!\\" should be a palindrome (ignoring special characters)");
    cr_assert_eq(palindromeCheck("!!a@a!!"), 1, "\\"!!a@a!!\\" should be a palindrome");
    cr_assert_eq(palindromeCheck("hello!"), 0, "\\"hello!\\" should not be a palindrome");
}', 'C');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (36, 21, e'public class Solution {

    public static boolean palindromeCheck(String str) {
	//your code goes here
        return true;
    }
}', e'public class PalindromeCheck {

    public static boolean palindromeCheck(String str) {
        if (str == null || str.isEmpty()) {
            return true;
        }

        // Clean the string: Remove non-alphanumeric characters and convert to lowercase
        str = str.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();

        int left = 0;
        int right = str.length() - 1;

        while (left < right) {
            if (str.charAt(left) != str.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }

        return true;
    }
}', e'import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SolutionTests {

    @Test
    public void testBasicPalindrome() {
        assertTrue(Solution.palindromeCheck("madam"), "Madam should be a palindrome");
        assertTrue(Solution.palindromeCheck("racecar"), " should be a palindrome");
        assertTrue(Solution.palindromeCheck("level"), " should be a palindrome");
    }

    @Test
    public void testNonPalindrome() {
        assertFalse(Solution.palindromeCheck("hello"), " should not be a palindrome");
        assertFalse(Solution.palindromeCheck("world"), " should not be a palindrome");
        assertFalse(Solution.palindromeCheck("abcdef"), " should not be a palindrome");
    }

    @Test
    public void testEdgeCases() {
        assertTrue(Solution.palindromeCheck(""), " Empty string should be considered a palindrome");
        assertTrue(Solution.palindromeCheck("a"), " should be considered a palindrome");
        assertFalse(Solution.palindromeCheck("ab"), " should not be a palindrome");
    }

    @Test
    public void testCaseSensitivity() {
        assertTrue(Solution.palindromeCheck("Madam"), " should be a palindrome (case insensitive)");
        assertTrue(Solution.palindromeCheck("RaceCar"), " should be a palindrome (case insensitive)");
        assertFalse(Solution.palindromeCheck("Hello"), " should not be a palindrome (case sensitive)");
    }

    @Test
    public void testSpacesAndPunctuation() {
        assertTrue(Solution.palindromeCheck("A man, a plan, a canal, Panama"),
            " should be a palindrome (ignoring punctuation and spaces)");
        assertTrue(Solution.palindromeCheck("Was it a car or a cat I saw?"),
            " should be a palindrome (ignoring punctuation and spaces)");
        assertTrue(Solution.palindromeCheck("No \'x\' in Nixon"),
           " should be a palindrome (ignoring punctuation and spaces)");
    }

    @Test
    public void testLongStrings() {
        assertTrue(Solution.palindromeCheck("abcdefghijklmnopqrstuvwxyzzyxwvutsrqponmlkjihgfedcba"),
            "Long palindrome string should be a palindrome");
        assertFalse(Solution.palindromeCheck("thisisaverylongstringthatshouldnotbeapalindrome"),
            "Long non-palindrome string should not be a palindrome");
    }

    @Test
    public void testSpecialCharacters() {
        assertTrue(Solution.palindromeCheck("!@#$$#@!"),
            " should be a palindrome (ignoring special characters)");
        assertTrue(Solution.palindromeCheck("!!a@a!!"),
           " should be a palindrome");
        assertFalse(Solution.palindromeCheck("hello!"),
            " should not be a palindrome");
    }
}', 'Java');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (30, 19, e'import java.util.*;

public class Solution {

    public static List<Integer> bfs(Map<Integer, List<Integer>> graph, int start) {
        List<Integer> visited = new ArrayList<>();
        Queue<Integer> queue = new LinkedList<>();

	//return visited nodes in order

        return visited;
    }
}', e'import java.util.*;

public class Solution {

    public static List<Integer> bfs(Map<Integer, List<Integer>> graph, int start) {
        List<Integer> visited = new ArrayList<>();
        Queue<Integer> queue = new LinkedList<>();

        queue.add(start);

        while (!queue.isEmpty()) {
            int node = queue.poll();
            if (!visited.contains(node)) {
                visited.add(node);
                for (int neighbor : graph.getOrDefault(node, Collections.emptyList())) {
                    if (!visited.contains(neighbor)) {
                        queue.add(neighbor);
                    }
                }
            }
        }

        return visited;
    }
}', e'import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class SolutionTests {

    @Test
    public void testCase1() {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Arrays.asList(1, 2));
        graph.put(1, Arrays.asList(0, 3, 4));
        graph.put(2, Arrays.asList(0));
        graph.put(3, Arrays.asList(1));
        graph.put(4, Arrays.asList(1));

        List<Integer> expected = Arrays.asList(0, 1, 2, 3, 4);
        List<Integer> result = Solution.bfs(graph, 0);

        assertEquals(expected, result);
    }

    @Test
    public void testCase2() {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Arrays.asList(1));
        graph.put(1, Arrays.asList(0, 2));
        graph.put(2, Arrays.asList(1));
        graph.put(3, Arrays.asList(4));
        graph.put(4, Arrays.asList(3));

        List<Integer> expected = Arrays.asList(0, 1, 2);
        List<Integer> result = Solution.bfs(graph, 0);

        assertEquals(expected, result);
    }

    @Test
    public void testCase3() {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Arrays.asList(1, 2));
        graph.put(1, Arrays.asList(0));
        graph.put(2, Arrays.asList(0));

        List<Integer> expected = Arrays.asList(0, 1, 2);
        List<Integer> result = Solution.bfs(graph, 0);

        assertEquals(expected, result);
    }

    @Test
    public void testCase4() {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Arrays.asList(1, 2));
        graph.put(1, Arrays.asList(0));
        graph.put(2, Arrays.asList(0, 3));
        graph.put(3, Arrays.asList(2));

        List<Integer> expected = Arrays.asList(0, 1, 2, 3);
        List<Integer> result = Solution.bfs(graph, 0);

        assertEquals(expected, result);
    }

    @Test
    public void testCase5() {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Collections.emptyList());

        List<Integer> expected = Arrays.asList(0);
        List<Integer> result = Solution.bfs(graph, 0);

        assertEquals(expected, result);
    }
}', 'Java');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (29, 19, e'from collections import deque

def bfs(graph, start):
    #return list of visited nodes in order
    #Use queue for it', e'from collections import deque

def bfs(graph, start):
    visited = []
    queue = deque([start])

    while queue:
        node = queue.popleft()
        if node not in visited:
            visited.append(node)
            queue.extend(neighbor for neighbor in graph[node] if neighbor not in visited)

    return visited', e'import unittest
from solution import bfs  # Import the bfs function from bfs.py

class TestBFS(unittest.TestCase):

    def test_case_1(self):
        graph = {
            0: [1, 2],
            1: [0, 3, 4],
            2: [0],
            3: [1],
            4: [1]
        }
        expected = [0, 1, 2, 3, 4]
        result = bfs(graph, 0)
        self.assertEqual(result, expected)

    def test_case_2(self):
        graph = {
            0: [1],
            1: [0, 2],
            2: [1],
            3: [4],
            4: [3]
        }
        expected = [0, 1, 2]
        result = bfs(graph, 0)
        self.assertEqual(result, expected)

    def test_case_3(self):
        graph = {
            0: [1, 2],
            1: [0],
            2: [0]
        }
        expected = [0, 1, 2]
        result = bfs(graph, 0)
        self.assertEqual(result, expected)

    def test_case_4(self):
        graph = {
            0: [1, 2],
            1: [0],
            2: [0, 3],
            3: [2]
        }
        expected = [0, 1, 2, 3]
        result = bfs(graph, 0)
        self.assertEqual(result, expected)

    def test_case_5(self):
        graph = {
            0: [],
        }
        expected = [0]
        result = bfs(graph, 0)
        self.assertEqual(result, expected)

if __name__ == \'__main__\':
    unittest.main()', 'Python');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (17, 15, e'#include <stdio.h>
#include <string.h>

void reverse_string(char* s) {
    //function that will reverse string wich is given to it
}', e'#include <stdio.h>
#include <string.h>

void reverse_string(char* s) {
    int length = strlen(s);
    for (int i = 0; i < length / 2; i++) {
        char temp = s[i];
        s[i] = s[length - i - 1];
        s[length - i - 1] = temp;
    }
}', e'#include <criterion/criterion.h>
#include <string.h>

extern void reverse_string(char* s);

Test(reverse_string_tests, test_reverse_hello) {
    char str1[] = "hello";
    reverse_string(str1);
    cr_expect_str_eq(str1, "olleh");
}

Test(reverse_string_tests, test_reverse_world) {
    char str2[] = "world";
    reverse_string(str2);
    cr_expect_str_eq(str2, "dlrow");
}

Test(reverse_string_tests, test_reverse_single_char) {
    char str3[] = "a";
    reverse_string(str3);
    cr_expect_str_eq(str3, "a");
}

Test(reverse_string_tests, test_reverse_abcde) {
    char str4[] = "abcde";
    reverse_string(str4);
    cr_expect_str_eq(str4, "edcba");
}

Test(reverse_string_tests, test_reverse_numbers) {
    char str5[] = "12345";
    reverse_string(str5);
    cr_expect_str_eq(str5, "54321");
}

Test(reverse_string_tests, test_reverse_empty) {
    char str6[] = "";
    reverse_string(str6);
    cr_expect_str_eq(str6, "");  // Empty string
}

Test(reverse_string_tests, test_reverse_palindrome) {
    char str7[] = "racecar";
    reverse_string(str7);
    cr_expect_str_eq(str7, "racecar");  // Palindrome
}

Test(reverse_string_tests, test_reverse_with_spaces) {
    char str8[] = "hello world";
    reverse_string(str8);
    cr_expect_str_eq(str8, "dlrow olleh");
}

Test(reverse_string_tests, test_reverse_leading_space) {
    char str9[] = "  leading space";
    reverse_string(str9);
    cr_expect_str_eq(str9, "ecaps gnidael  ");  // Leading space
}

Test(reverse_string_tests, test_reverse_trailing_space) {
    char str10[] = "trailing space ";
    reverse_string(str10);
    cr_expect_str_eq(str10, " ecaps gniliart");  // Trailing space
}

Test(reverse_string_tests, test_reverse_alphabet) {
    char str12[] = "abcdefghijklmnopqrstuvwxyz";
    reverse_string(str12);
    cr_expect_str_eq(str12, "zyxwvutsrqponmlkjihgfedcba");
}

Test(reverse_string_tests, test_reverse_large_numbers) {
    char str13[] = "12345678901234567890";
    reverse_string(str13);
    cr_expect_str_eq(str13, "09876543210987654321");
}

Test(reverse_string_tests, test_reverse_multiple_words) {
    char str14[] = "test reading";
    reverse_string(str14);
    cr_expect_str_eq(str14, "gnidaer tset");
}

Test(reverse_string_tests, test_reverse_back_reverse) {
    char str15[] = "back reverse";
    reverse_string(str15);
    cr_expect_str_eq(str15, "esrever kcab");
}', 'C');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (19, 15, e'def reverse_string(s):
#return reversed s
    return s', e'def reverse_string(s):
    return s[::-1]', e'import unittest
from solution import reverse_string

class TestReverseString(unittest.TestCase):
    def test_reverse_string_basic(self):
        # Basic test cases
        self.assertEqual(reverse_string("hello"), "olleh")
        self.assertEqual(reverse_string("world"), "dlrow")
        self.assertEqual(reverse_string("a"), "a")
        self.assertEqual(reverse_string("abcde"), "edcba")
        self.assertEqual(reverse_string("12345"), "54321")

    def test_reverse_string_edge_cases(self):
        # Edge cases
        self.assertEqual(reverse_string(""), "")  # Empty string
        self.assertEqual(reverse_string("racecar"), "racecar")  # Palindrome

    def test_reverse_string_long_strings(self):
        # Longer strings
        self.assertEqual(reverse_string("abcdefghijklmnopqrstuvwxyz"), "zyxwvutsrqponmlkjihgfedcba")
        self.assertEqual(reverse_string("12345678901234567890"), "09876543210987654321")

    def test_reverse_string_with_spaces(self):
        # Strings with spaces
        self.assertEqual(reverse_string("hello world"), "dlrow olleh")
        self.assertEqual(reverse_string("  leading space"), "ecaps gnidael  ")
        self.assertEqual(reverse_string("trailing space "), " ecaps gniliart")

if __name__ == "__main__":
    unittest.main()', 'Python');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (18, 15, e'public class Solution {
    public static String reverseString(String s) {
    	return new StringBuilder(s);
    }
}
// return reveresed string via stringbuilder', e'public class Solution {
    public static String reverseString(String s) {
        StringBuilder reversed = new StringBuilder(s);
        return reversed.reverse().toString();
    }
}', e'import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SolutionTests{

    @Test
    public void testReverseString() {
        // Basic test cases
        assertEquals("olleh", Solution.reverseString("hello"));
        assertEquals("dlrow", Solution.reverseString("world"));
        assertEquals("a", Solution.reverseString("a"));
        assertEquals("edcba", Solution.reverseString("abcde"));
        assertEquals("54321", Solution.reverseString("12345"));
    }

    @Test
    public void testEdgeCases() {
        // Edge cases
        assertEquals("", Solution.reverseString(""));  // Empty string
        assertEquals("racecar", Solution.reverseString("racecar"));  // Palindrome
    }

    @Test
    public void testLongStrings() {
        // Longer strings
        assertEquals("zyxwvutsrqponmlkjihgfedcba", Solution.reverseString("abcdefghijklmnopqrstuvwxyz"));
        assertEquals("09876543210987654321", Solution.reverseString("12345678901234567890"));
    }

    @Test
    public void testWithSpaces() {
        // Strings with spaces
        assertEquals("dlrow olleh", Solution.reverseString("hello world"));
        assertEquals("ecaps gnidael  ", Solution.reverseString("  leading space"));
        assertEquals(" ecaps gniliart", Solution.reverseString("trailing space "));
    }

    @Test
    public void testWithMultipleWords() {
        // Multiple words
        assertEquals("gnidaer tset", Solution.reverseString("test reading"));
        assertEquals("esrever kcab", Solution.reverseString("back reverse"));
    }
}', 'Java');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (15, 14, e'import java.util.ArrayList;
import java.util.List;

public class Solution {
    public static List<String> fizzbuzz(int n) {
        List<String> result = new ArrayList<>();
        return result;
    }
}', e'import java.util.ArrayList;
import java.util.List;

public class Solution {
    public static List<String> fizzbuzz(int n) {
        List<String> result = new ArrayList<>();

        for (int i = 1; i <= n; i++) {
            if (i % 3 == 0 && i % 5 == 0) {
                result.add("FizzBuzz");
            } else if (i % 3 == 0) {
                result.add("Fizz");
            } else if (i % 5 == 0) {
                result.add("Buzz");
            } else {
                result.add(Integer.toString(i));
            }
        }

        return result;
    }
}', e'import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.List;
import java.util.Arrays;

public class SolutionTests {

    @Test
    public void testFizzBuzzBasic() {
        assertEquals(Arrays.asList("1", "2", "Fizz", "4", "Buzz"), Solution.fizzbuzz(5));
        assertEquals(Arrays.asList(
            "1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz",
            "11", "Fizz", "13", "14", "FizzBuzz"), Solution.fizzbuzz(15));
        assertEquals(Arrays.asList("1"), Solution.fizzbuzz(1));
        assertEquals(Arrays.asList("1", "2", "Fizz"), Solution.fizzbuzz(3));
    }

    @Test
    public void testFizzBuzzEdgeCases() {
        assertEquals(Arrays.asList(), Solution.fizzbuzz(0)); // Edge case: empty list for 0
        assertEquals(Arrays.asList("1"), Solution.fizzbuzz(1)); // Edge case: only one number
        assertEquals(Arrays.asList("1", "2"), Solution.fizzbuzz(2)); // Edge case: two numbers
    }

    @Test
    public void testFizzBuzzOnlyFizz() {
        assertEquals(Arrays.asList("1", "2", "Fizz"), Solution.fizzbuzz(3));
        assertEquals(Arrays.asList("1", "2", "Fizz", "4", "Buzz", "Fizz"), Solution.fizzbuzz(6));
        assertEquals(Arrays.asList("1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz"), Solution.fizzbuzz(12));
    }

    @Test
    public void testFizzBuzzOnlyBuzz() {
        assertEquals(Arrays.asList("1", "2", "Fizz", "4", "Buzz"), Solution.fizzbuzz(5));
        assertEquals(Arrays.asList("1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz"), Solution.fizzbuzz(10));
    }

    @Test
    public void testFizzBuzzOnlyFizzBuzz() {
        assertEquals(Arrays.asList("1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz",
                                   "11", "Fizz", "13", "14", "FizzBuzz"), Solution.fizzbuzz(15));
        assertEquals(Arrays.asList("1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz",
                                   "11", "Fizz", "13", "14", "FizzBuzz", "16", "17", "Fizz", "19", "Buzz"), Solution.fizzbuzz(20));
    }

    @Test
    public void testFizzBuzzLargeN() {
        List<String> output = Solution.fizzbuzz(30);
        assertEquals("FizzBuzz", output.get(29));  // Checking last element at 30
        assertEquals("Fizz", output.get(2));  // Checking "Fizz" at 3
        assertEquals("Buzz", output.get(4));  // Checking "Buzz" at 5
        assertEquals("FizzBuzz", output.get(14));  // Checking "FizzBuzz" at 15
        assertEquals("26", output.get(25));  // Checking normal number at 26
    }
}', 'Java');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (46, 24, e'#include <stdbool.h>
#include <string.h>

bool is_balanced(const char *s) {
    //your code goes here
}', e'#include <stdbool.h>
#include <string.h>

bool is_balanced(const char *s) {
    char stack[100000];
    int top = -1;

    for (int i = 0; s[i] != \'\\0\'; i++) {
        char c = s[i];

        if (c == \'(\' || c == \'{\' || c == \'[\') {
            stack[++top] = c;
        } else {
            if (top == -1) return false;

            char last = stack[top--];
            if ((c == \')\' && last != \'(\') ||
                (c == \'}\' && last != \'{\') ||
                (c == \']\' && last != \'[\')) {
                return false;
            }
        }
    }

    return top == -1;
}', e'#include <criterion/criterion.h>
extern bool is_balanced(const char *s);

Test(BalancedParentheses, ValidCases) {
    cr_assert(is_balanced("(){}[]"));
    cr_assert(is_balanced("({[]})"));
    cr_assert(is_balanced(""));
}

Test(BalancedParentheses, InvalidCases) {
    cr_assert_not(is_balanced("(]"));
    cr_assert_not(is_balanced("({[)]}"));
    cr_assert_not(is_balanced("((("));
}', 'C');
INSERT INTO public.taskcode (taskcode_id, task_id, initial_code, solution_code, unit_test_code, programming_language) VALUES (27, 18, e'import java.util.*;

public class Solution{

    public static List<Integer> dfs(Map<Integer, List<Integer>> graph, int start) {
        Set<Integer> visited = new HashSet<>();
        List<Integer> order = new ArrayList<>();
        dfsHelper(graph, start, visited, order);
        return order;
    }

    private static void dfsHelper(Map<Integer, List<Integer>> graph, int node, Set<Integer> visited, List<Integer> order) {
       //Your code goes here
    }
}', e'import java.util.*;

public class Solution {

    public static List<Integer> dfs(Map<Integer, List<Integer>> graph, int start) {
        Set<Integer> visited = new HashSet<>();
        List<Integer> order = new ArrayList<>();
        dfsHelper(graph, start, visited, order);
        return order;
    }

    private static void dfsHelper(Map<Integer, List<Integer>> graph, int node, Set<Integer> visited, List<Integer> order) {
        visited.add(node);
        order.add(node);

        // Visit each neighbor of the current node
        for (int neighbor : graph.get(node)) {
            if (!visited.contains(neighbor)) {
                dfsHelper(graph, neighbor, visited, order);
            }
        }
    }
}', e'import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.*;

public class SolutionTests {

    @Test
    public void testDFSCase1() {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Arrays.asList(1, 2));
        graph.put(1, Arrays.asList(0, 3, 4));
        graph.put(2, Arrays.asList(0));
        graph.put(3, Arrays.asList(1));
        graph.put(4, Arrays.asList(1));

        List<Integer> result = Solution.dfs(graph, 0);
        List<Integer> expected = Arrays.asList(0, 1, 3, 4, 2);
        assertEquals(expected, result);
    }

    @Test
    public void testDFSCase2() {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Arrays.asList(1, 2, 3));
        graph.put(1, Arrays.asList(0));
        graph.put(2, Arrays.asList(0));
        graph.put(3, Arrays.asList(0));

        List<Integer> result = Solution.dfs(graph, 0);
        List<Integer> expected = Arrays.asList(0, 1, 2, 3);
        assertEquals(expected, result);
    }

    @Test
    public void testDFSCase3() {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Arrays.asList(1, 2));
        graph.put(1, Arrays.asList(0, 3));
        graph.put(2, Arrays.asList(0, 4));
        graph.put(3, Arrays.asList(1));
        graph.put(4, Arrays.asList(2));

        List<Integer> result = Solution.dfs(graph, 0);
        List<Integer> expected = Arrays.asList(0, 1, 3, 2, 4);
        assertEquals(expected, result);
    }

    @Test
    public void testDFSCase4() {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Arrays.asList(1));
        graph.put(1, Arrays.asList(0, 2));
        graph.put(2, Arrays.asList(1, 3));
        graph.put(3, Arrays.asList(2, 4));
        graph.put(4, Arrays.asList(3));

        List<Integer> result = Solution.dfs(graph, 0);
        List<Integer> expected = Arrays.asList(0, 1, 2, 3, 4);
        assertEquals(expected, result);
    }

    @Test
    public void testDFSCase5() {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, Arrays.asList(1));
        graph.put(1, Arrays.asList(0, 2));
        graph.put(2, Arrays.asList(1, 3));
        graph.put(3, Arrays.asList(2));
        graph.put(4, Arrays.asList(5));
        graph.put(5, Arrays.asList(4));

        List<Integer> result = Solution.dfs(graph, 0);
        List<Integer> expected = Arrays.asList(0, 1, 2, 3);
        assertEquals(expected, result);
    }
}', 'Java');


DO $$
    DECLARE
        new_user_id INT;
    BEGIN
        FOR i IN 1..1000 LOOP
            -- Vytvorenie nového ID, ak ešte neexistuje
            -- Získame najvyššie možné ID z databázy a priradíme k tomu nové
                SELECT COALESCE(MAX(user_id), 0) + 1 INTO new_user_id FROM userR;

                -- Vloženie nového užívateľa
                INSERT INTO userR (
                    user_id,
                    email,
                    nick,
                    password,
                    role,
                    registration_date,
                    last_login_date,
                    profile_picture,
                    selected_badge_id,
                    rank_id,
                    isVerified,
                    honor,
                    verificationCode,
                    expirationTime,
                    resetTokenExpires,
                    resetToken,
                    visibility
                )
                VALUES (
                           new_user_id,  -- generované ID
                           'student' || i || '@example.com',  -- email
                           'student' || i,  -- nickname
                           'password' || i,  -- password
                           'student',  -- role
                           NOW() - INTERVAL '1 day' * (i % 365),  -- registration date
                           NOW(),  -- last login date
                           '',  -- profile picture path (can be set to an empty string or NULL)
                           (i % 6) + 1,  -- selected badge (randomly choosing between 6 badges)
                           (i % 7) + 1,   -- rank (randomly assigning a rank from 7 ranks)
                           true,  -- isVerified (set to true or false based on your needs)
                           (i % 10) + 1,  -- honor (random value between 1 and 10)
                           (i % 100) + 1, -- verificationCode (random value between 1 and 100)
                           NOW() + INTERVAL '1 week', -- expirationTime (set to 1 week from now for example)
                           NOW() + INTERVAL '1 day', -- resetTokenExpires (set to 1 day from now for example)
                           'resetTokenExample' || i, -- resetToken (example token)
                           true  -- visibility (set to true or false as needed)
                       );
            END LOOP;
    END $$;


SELECT * FROM classroomtask WHERE task_id = 1;
SELECT * FROM task WHERE task_id = 1;

SELECT
    cst.start_date AS startDate,
    cst.lock_date AS lockDate,
    cst.classroom_id
FROM classroomtask cst
WHERE cst.task_id = 1;