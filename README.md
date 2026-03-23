# Parking Lot System

An automated parking lot ticketing system built with TypeScript, designed for clarity, efficiency, and extensibility.

## Quick Start

```bash
# Install dependencies, compile, and run tests
$ bin/setup

# Run with input file
$ bin/parking_lot file_inputs.txt

# Launch interactive shell
$ bin/parking_lot
```

## Features

- **Automated Slot Allocation**: Always assigns the nearest available slot to the entrance
- **O(log n) Slot Allocation**: Uses a min-heap for efficient nearest-slot lookup
- **O(1) Queries**: Secondary indexes (hash maps) for instant lookups by color or registration
- **Case-insensitive Color Search**: "White", "white", "WHITE" all match
- **Interactive & File Modes**: Full-featured CLI with colors, or clean file-based processing
- **Comprehensive Test Suite**: 104 tests covering unit, integration, and edge cases

## Commands

| Command | Description |
|---------|-------------|
| `create_parking_lot <n>` | Create a parking lot with n slots |
| `park <reg_no> <color>` | Park a car and get assigned slot |
| `leave <slot_no>` | Free a parking slot |
| `status` | Show all parked cars |
| `registration_numbers_for_cars_with_colour <color>` | Find all registrations by color |
| `slot_numbers_for_cars_with_colour <color>` | Find all slots by color |
| `slot_number_for_registration_number <reg_no>` | Find slot by registration |
| `help` | Show available commands |
| `exit` | Exit the program |

## Example Usage

### File Mode

```bash
$ bin/parking_lot input.txt
```

**input.txt:**
```
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
```

**Output:**
```
Created a parking lot with 6 slots
Allocated slot number: 1
Allocated slot number: 2
Allocated slot number: 3
Allocated slot number: 4
Allocated slot number: 5
Allocated slot number: 6
Slot number 4 is free
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
```

### Interactive Mode

```bash
$ bin/parking_lot
╭─────────────────────────────────────────────────────╮
│          🚗  PARKING LOT SYSTEM  🚗                │
│          ─────────────────────────                 │
│          Type 'help' for commands                 │
│          Type 'exit' to quit                      │
╰─────────────────────────────────────────────────────╯

parking_lot> create_parking_lot 6
Created a parking lot with 6 slots

parking_lot> park KA-01-HH-1234 White
Allocated slot number: 1

parking_lot> exit
Goodbye! Drive safely. 🚗
```

## Project Structure

```
parking_lot/
├── bin/
│   ├── setup              # Install, compile, run tests
│   └── parking_lot        # Main executable
├── src/
│   ├── domain/            # Core business logic
│   │   ├── data-structures/
│   │   │   └── MinHeap.ts        # Min-heap for slot allocation
│   │   ├── entities/
│   │   │   ├── Car.ts            # Car value object
│   │   │   └── ParkingSlot.ts    # Slot entity
│   │   └── services/
│   │       └── ParkingLotService.ts  # Main business logic
│   ├── application/
│   │   └── CommandProcessor.ts   # Command parsing & routing
│   └── infrastructure/
│       ├── cli/
│       │   ├── InteractiveShell.ts
│       │   ├── FileProcessor.ts
│       │   └── OutputFormatter.ts
│       └── colors/
│           └── AnsiColors.ts
├── tests/
│   ├── unit/              # Unit tests for each component
│   ├── integration/       # End-to-end workflow tests
│   └── edge-cases/        # Boundary condition tests
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Architecture

The system follows **Domain-Driven Design** principles:

### Domain Layer (`src/domain/`)
The heart of the application, containing:
- **MinHeap**: Custom implementation for O(log n) nearest-slot allocation
- **Car**: Value object representing a vehicle
- **ParkingSlot**: Entity representing a physical parking space
- **ParkingLotService**: Orchestrates all parking operations

### Application Layer (`src/application/`)
- **CommandProcessor**: Parses text commands and delegates to domain services

### Infrastructure Layer (`src/infrastructure/`)
- **InteractiveShell**: REPL with colored prompts and welcome banner
- **FileProcessor**: Streams commands from files
- **OutputFormatter**: Centralizes all output formatting

## Key Design Decisions

### 1. Min-Heap for Slot Allocation
```
Why? The requirement states "allocate nearest available slot."
A min-heap gives us O(log n) extraction of the smallest slot number,
compared to O(n) for scanning an array each time.
```

### 2. Secondary Indexes for Queries
```
We maintain two hash maps:
- colorIndex: color -> Set<slotNumber>
- registrationIndex: registration -> slotNumber

This enables O(1) lookups for all query commands instead of O(n) scans.
```

### 3. Case-Insensitive Colors
```
Colors are stored lowercase internally but preserved as-is for display.
This makes the system user-friendly: "White" == "white" == "WHITE"
```

### 4. Silent Failure for Edge Cases
```
Invalid operations (leave from empty slot, query non-existent car)
return graceful messages rather than throwing errors.
This matches expected output format for automated testing.
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

**Test Coverage:**
- 104 tests across 7 test suites
- Unit tests for MinHeap, Car, ParkingSlot, ParkingLotService
- Integration tests for command processor and full workflows
- Edge case tests for boundary conditions

## Requirements

- Node.js 16+
- npm 7+

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Run tests
npm test

# Run in development mode
npm run dev
```

## License

ISC
