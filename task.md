# Parking Lot Problem Statement

## 1. Nature of the Game
The goal of this assignment is to evaluate your development approach and your expertise in building software. Because a real-world problem at scale is not practical within a limited timeframe, this is a simpler scenario that you should treat and solve as if it were a real-world problem. 

**Important:** Failure to adhere to the instructions will result in automated rejection, and taking longer than the specified time limit will negatively impact your evaluation.

---

## 2. Rules of the Game

### Coding Style
* Focus on strong object-oriented or functional design principles to write elegant, high-quality code.
* When you encounter undefined workflows or boundary conditions, use your best judgment and clearly demonstrate your decision-making process.

### Language and Environment
* **Language:** Use an object-oriented or functional programming language.
* **Libraries:** External libraries are strictly forbidden, except for testing frameworks.
* **Environment:** Your code must build and run on a Linux environment. You may use Docker if necessary.
* **Version Control:** You must use Git. Submit your final solution as a zip or tarball that includes the Git metadata for review.
* **Exclusions:** Do not check in compiled binaries, class files, `.jar` files, libraries, or any build output.

### Testing
* You must write comprehensive unit tests or specs.
* Test-Driven Development (TDD) is highly encouraged for object-oriented solutions.

### Project Structure
* Place all your code inside a root directory named `parking_lot`.
* Structure and organize your code following the conventions of mature open-source projects.
* Include a comprehensive `README.md` file with clear instructions.

### Executable Scripts
You must provide and update specific Unix executable scripts inside a `bin` directory to allow for automated testing:
* `bin/setup`: This script should install all necessary dependencies, compile the code, and run your unit tests.
* `bin/parking_lot`: This script runs the main program. It must be able to accept input commands from a file and print the corresponding output to `STDOUT`.

### Input, Output, and Validation
* Strictly adhere to the provided syntax and formatting guidelines for both inputs and outputs.
* Use the provided automated functional test suite (located at `bin/run_functional_tests`) to validate your solution.
* Refer to the `functional_spec/README.md` file for instructions on setting up the functional tests.

### Confidentiality
* **Do not** publish this problem statement or your solution on any public platforms like GitHub, Bitbucket, personal blogs, or forums.

---

## 3. Core Problem Statement

You own a parking lot capable of holding up to `n` cars at any given time. Each parking slot is assigned a number starting from `1`, with the numbers increasing the further away the slot is from the entry point.

You are required to build an automated ticketing system that allows customers to use the parking lot without any human intervention.

### System Requirements:
1.  **Entry (Parking):** When a car enters, issue a parking ticket containing the car's registration number and color, and allocate the nearest available slot.
2.  **Exit (Leaving):** Upon exit, mark the slot as available.
3.  **Query Capabilities:** Provide the ability to find:
    * Registration numbers of cars of a particular color.
    * Slot number for a given registration number.
    * Slot numbers for all cars of a specific color.

### Interaction Modes
Interact with the system via commands in two ways:
1.  Interactive command prompt-based shell.
2.  Accept commands from a file.

---

## 4. Execution Examples

### Example 1: File-Based Execution

**1. Setup and compile:**
To install dependencies, compile, and run tests:
$ bin/setup

**2. Run with a file:**
To run the code with input from a file:
$ bin/parking_lot file_inputs.txt

**Input File Content (`file_inputs.txt`):**
create_parking_lot 6
park KA-01-HH-1234 White
park KA-01-HH-9999 White
park KA-01-BB-0001 Black
park KA-01-HH-7777 Red
park KA-01-HH-2701 Blue
park KA-01-HH-3141 Black
leave 4
status
park KA-01-P-333 White
park DL-12-AA-9999 White
registration_numbers_for_cars_with_colour White
slot_numbers_for_cars_with_colour White
slot_number_for_registration_number KA-01-HH-3141
slot_number_for_registration_number MH-04-AY-1111

**Expected Output (STDOUT):**
Created a parking lot with 6 slots
Allocated slot number: 1
Allocated slot number: 2
Allocated slot number: 3
Allocated slot number: 4
Allocated slot number: 5
Allocated slot number: 6
Slot number 4 is free.
Slot No.    Registration No    Colour
1           KA-01-HH-1234      White
2           KA-01-HH-9999      White
3           KA-01-BB-0001      Black
5           KA-01-HH-2701      Blue
6           KA-01-HH-3141      Black
Allocated slot number: 4
Sorry, parking lot is full
KA-01-HH-1234, KA-01-HH-9999, KA-01-P-333
1, 2, 4
6
Not found

---

### Example 2: Interactive Shell Execution

**1. Setup and compile:**
To install dependencies, compile, and run tests:
$ bin/setup

**2. Launch interactive shell:**
To run the program and launch the shell:
$ bin/parking_lot

Assuming a parking lot with 6 slots, run the following commands in sequence, producing output as described below each command. Note: exit terminates the process and returns control to the shell.

$ create_parking_lot 6
Created a parking lot with 6 slots

$ park KA-01-HH-1234 White
Allocated slot number: 1

$ park KA-01-HH-9999 White
Allocated slot number: 2

$ park KA-01-BB-0001 Black
Allocated slot number: 3

$ park KA-01-HH-7777 Red
Allocated slot number: 4

$ park KA-01-HH-2701 Blue
Allocated slot number: 5

$ park KA-01-HH-3141 Black
Allocated slot number: 6

$ leave 4
Slot number 4 is free

$ status
Slot No.    Registration No
1           KA-01-HH-1234
2           KA-01-HH-9999
3           KA-01-BB-0001
5           KA-01-HH-2701
6           KA-01-HH-3141

$ park KA-01-P-333 White
Allocated slot number: 4

$ park DL-12-AA-9999 White
Sorry, parking lot is full

$ registration_numbers_for_cars_with_colour White
KA-01-HH-1234, KA-01-HH-9999, KA-01-P-333

$ slot_numbers_for_cars_with_colour White
1, 2, 4

$ slot_number_for_registration_number KA-01-HH-3141
6

$ slot_number_for_registration_number MH-04-AY-1111
Not found

$ exit
