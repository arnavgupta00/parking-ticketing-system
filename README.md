# Parking Lot System

An automated parking lot management system built with TypeScript, supporting **multiple parking lots** with intelligent dispatcher-based allocation.

## Quick Start

```bash
# Install dependencies, compile, and run tests
$ bin/setup

# Run with input file
$ bin/parking_lot file_inputs.txt

# Launch interactive shell
$ bin/parking_lot
```

## Docker Support

```bash
# Build the Docker image
$ docker build -t parking_lot .

# Run interactive mode
$ docker run -it parking_lot

# Run with a file (mount as volume)
$ docker run -v $(pwd)/input.txt:/app/input.txt parking_lot input.txt
```

## Features

- **Multi-Lot Management**: Create and manage multiple parking lots simultaneously
- **Smart Dispatcher**: Two strategies for customer distribution:
  - **Even Distribution**: Balances load by sending to emptiest lot (default)
  - **Fill First**: Fills closest lot before moving to next
- **Automated Slot Allocation**: Always assigns the nearest available slot within each lot
- **O(log n) Slot Allocation**: Uses a min-heap for efficient nearest-slot lookup
- **O(1) Queries**: Secondary indexes (hash maps) for instant lookups across all lots
- **Case-insensitive Color Search**: "White", "white", "WHITE" all match
- **Interactive & File Modes**: Full-featured CLI with colors, or clean file-based processing
- **Comprehensive Test Suite**: 140 tests covering unit, integration, and edge cases

## Commands

| Command | Description |
|---------|-------------|
| `create_parking_lot <n>` | Create a parking lot with n slots (lots numbered sequentially) |
| `dispatch_rule <rule>` | Set dispatcher rule: `even_distribution` or `fill_first` |
| `park <reg_no> <color>` | Park a car (dispatcher selects lot automatically) |
| `leave <lot_no> <slot_no>` | Free a parking slot in specified lot |
| `status` | Show all parked cars across all lots |
| `registration_numbers_for_cars_with_colour <color>` | Find all registrations by color (all lots) |
| `slot_numbers_for_cars_with_colour <color>` | Find all slots by color (returns L1-1, L2-3 format) |
| `slot_number_for_registration_number <reg_no>` | Find slot by registration (returns L2-4 format) |
| `load <filename>` | Execute commands from a file |
| `help` | Show available commands |
| `exit` | Exit the program |

## Example Usage

### Multi-Lot Example

```bash
$ bin/parking_lot
```

```
create_parking_lot 5
create_parking_lot 3
create_parking_lot 6
dispatch_rule even_distribution
park KA-01-HH-1234 White
park KA-01-HH-9999 White
park KA-01-BB-0001 Black
status
slot_numbers_for_cars_with_colour White
```

**Output:**
```
Created a parking lot with 5 slots
Created a parking lot with 3 slots
Created a parking lot with 6 slots
Dispatcher is now using the Even Distribution rule
Allocated slot number: 1 in Lot 1
Allocated slot number: 1 in Lot 2
Allocated slot number: 1 in Lot 3
Lot 1:
Slot No.    Registration No    Colour
1           KA-01-HH-1234      White

Lot 2:
Slot No.    Registration No    Colour
1           KA-01-HH-9999      White

Lot 3:
Slot No.    Registration No    Colour
1           KA-01-BB-0001      Black
L1-1, L2-1
```

### File Mode

```bash
$ bin/parking_lot input.txt
```

**input.txt (single lot example):**
```
create_parking_lot 6
park KA-01-HH-1234 White
park KA-01-HH-9999 White
park KA-01-BB-0001 Black
park KA-01-HH-7777 Red
park KA-01-HH-2701 Blue
park KA-01-HH-3141 Black
leave 1 4
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
Allocated slot number: 1 in Lot 1
Allocated slot number: 2 in Lot 1
Allocated slot number: 3 in Lot 1
Allocated slot number: 4 in Lot 1
Allocated slot number: 5 in Lot 1
Allocated slot number: 6 in Lot 1
Slot number 4 in Lot 1 is free.
Lot 1:
Slot No.    Registration No    Colour
1           KA-01-HH-1234      White
2           KA-01-HH-9999      White
3           KA-01-BB-0001      Black
5           KA-01-HH-2701      Blue
6           KA-01-HH-3141      Black
Allocated slot number: 4 in Lot 1
Sorry, all parking lots are full
KA-01-HH-1234, KA-01-HH-9999, KA-01-P-333
L1-1, L1-2, L1-4
L1-6
Not found
```

### Interactive Mode

```bash
$ bin/parking_lot
╭─────────────────────────────────────────────────────╮
│          🚗  PARKING LOT SYSTEM  🚗                │
│          ─────────────────────────────────────────  │
│          Type 'help' for commands                 │
│          Type 'exit' to quit                      │
╰─────────────────────────────────────────────────────╯

parking_lot> create_parking_lot 6
Created a parking lot with 6 slots

parking_lot> park KA-01-HH-1234 White
Allocated slot number: 1 in Lot 1

parking_lot> exit
Goodbye! Drive safely. 🚗
```

## Dispatcher Strategies

### Even Distribution (Default)
Balances customer load across all lots by sending customers to the lot with the lowest occupancy percentage. When multiple lots have equal occupancy, the closest lot (lowest number) is selected.

**Best for:** Weekends, busy periods, distributing wear-and-tear

**Example:**
```
create_parking_lot 4  # Lot 1: 4 slots
create_parking_lot 6  # Lot 2: 6 slots
dispatch_rule even_distribution
park CAR-1 White  # -> Lot 1 (0% vs 0%, picks closest)
park CAR-2 White  # -> Lot 2 (25% vs 0%, picks emptier)
park CAR-3 Black  # -> Lot 2 (25% vs 17%, picks emptier)
```

### Fill First
Fills the closest lot completely before moving to the next one. Minimizes the number of active lots.

**Best for:** Weekdays, low-traffic periods, minimizing operational costs

**Example:**
```
create_parking_lot 3  # Lot 1
create_parking_lot 3  # Lot 2
dispatch_rule fill_first
park CAR-1 White  # -> Lot 1, slot 1
park CAR-2 White  # -> Lot 1, slot 2
park CAR-3 Black  # -> Lot 1, slot 3
park CAR-4 Red    # -> Lot 2, slot 1 (Lot 1 is full)
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
│   │   ├── services/
│   │   │   ├── ParkingLotService.ts   # Single lot management
│   │   │   ├── ParkingLotManager.ts   # Multi-lot orchestration
│   │   │   └── Dispatcher.ts          # Lot selection logic
│   │   └── strategies/
│   │       ├── DispatchStrategy.ts         # Strategy interface
│   │       ├── EvenDistributionStrategy.ts
│   │       └── FillFirstStrategy.ts
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

The system follows **Domain-Driven Design** principles with a **multi-lot architecture**:

### Domain Layer (`src/domain/`)
The heart of the application:
- **MinHeap**: Custom implementation for O(log n) nearest-slot allocation within each lot
- **Car**: Value object representing a vehicle
- **ParkingSlot**: Entity representing a physical parking space
- **ParkingLotService**: Manages a single parking lot (unchanged from original design)
- **ParkingLotManager**: Orchestrates multiple ParkingLotService instances
- **Dispatcher**: Selects optimal lot for incoming customers
- **DispatchStrategy**: Strategy pattern for different allocation algorithms
  - EvenDistributionStrategy
  - FillFirstStrategy

### Application Layer (`src/application/`)
- **CommandProcessor**: Parses text commands and routes to ParkingLotManager

### Infrastructure Layer (`src/infrastructure/`)
- **InteractiveShell**: REPL with colored prompts and welcome banner
- **FileProcessor**: Streams commands from files
- **OutputFormatter**: Centralizes output formatting (supports lot prefixes)

## Key Design Decisions

### 1. Multi-Lot Architecture
```
Each ParkingLotService manages one lot independently.
ParkingLotManager coordinates multiple lots.
Dispatcher applies strategy to select which lot receives new cars.
Registration numbers are globally unique across all lots.
```

### 2. Strategy Pattern for Dispatch
```
Allows easy switching between allocation strategies.
New strategies can be added without modifying existing code.
Default is EvenDistributionStrategy as specified.
```

### 3. Min-Heap for Slot Allocation (Per Lot)
```
Why? Each lot must allocate its nearest available slot.
A min-heap gives us O(log n) extraction of the smallest slot number.
This is maintained independently within each ParkingLotService.
```

### 4. Secondary Indexes for Queries (Global)
```
ParkingLotManager maintains global registration tracking.
Each ParkingLotService maintains its own color/registration indexes.
Queries aggregate results across all lots.
```

### 5. Output Format with Lot Prefix
```
Slot numbers now include lot prefix: L1-1, L2-3
This makes it clear which lot contains the car.
Status command groups by lot with clear separators.
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

**Test Coverage:**
- **140 tests** across 9 test suites
- Unit tests for MinHeap, Car, ParkingSlot, ParkingLotService, Dispatcher, ParkingLotManager
- Integration tests for multi-lot workflows and dispatch strategies
- Edge case tests for boundary conditions and error handling

**Test Organization:**
- `tests/unit/domain/` - Core business logic tests
- `tests/unit/application/` - Command processor tests
- `tests/integration/` - End-to-end multi-lot scenarios
- `tests/edge-cases/` - Boundary conditions and error cases

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
