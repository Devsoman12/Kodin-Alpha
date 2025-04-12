package com.solution;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SolutionTests {

    @Test
    public void testAddTwoNumbers() {
        Solution solution = new Solution();

        // Test case 1: adding 2 and 3
        assertEquals(5, solution.addTwoNumbers(2, 3));

        // Test case 2: adding -1 and 1
        assertEquals(0, solution.addTwoNumbers(-1, 1));

        // Test case 3: adding 0 and 0
        assertEquals(0, solution.addTwoNumbers(0, 0));
    }
}
