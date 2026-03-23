import { ParkingLotService } from '../domain/services/ParkingLotService';
import { OutputFormatter } from '../infrastructure/cli/OutputFormatter';

/**
 * CommandProcessor - Parses and executes parking lot commands.
 * 
 * This is the bridge between raw text commands and our domain logic.
 * Each command string gets parsed, validated, and routed to the
 * appropriate service method.
 * 
 * The processor is stateless regarding command history - it just
 * processes whatever you give it. State lives in ParkingLotService.
 */
export class CommandProcessor {
  private parkingService: ParkingLotService;
  private formatter: OutputFormatter;

  constructor(parkingService: ParkingLotService, formatter: OutputFormatter) {
    this.parkingService = parkingService;
    this.formatter = formatter;
  }

  /**
   * Processes a single command and returns the output string.
   * 
   * Commands are case-sensitive for the command name itself,
   * but arguments (like colors) are handled case-insensitively
   * where appropriate.
   * 
   * @returns The formatted output, or null for exit command
   */
  process(commandLine: string): string | null {
    // Trim and skip empty lines
    const trimmed = commandLine.trim();
    if (!trimmed) {
      return '';
    }

    // Split command and arguments
    const parts = trimmed.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    // Route to appropriate handler
    switch (command) {
      case 'create_parking_lot':
        return this.handleCreateParkingLot(args);

      case 'park':
        return this.handlePark(args);

      case 'leave':
        return this.handleLeave(args);

      case 'status':
        return this.handleStatus();

      case 'registration_numbers_for_cars_with_colour':
        return this.handleRegistrationsByColor(args);

      case 'slot_numbers_for_cars_with_colour':
        return this.handleSlotsByColor(args);

      case 'slot_number_for_registration_number':
        return this.handleSlotByRegistration(args);

      case 'help':
        return this.formatter.formatHelp();

      case 'exit':
        return null; // Signal to exit

      default:
        // For unknown commands, we stay silent per requirements
        // But in a real system, you might want to show an error
        return '';
    }
  }

  /**
   * Handles: create_parking_lot <capacity>
   */
  private handleCreateParkingLot(args: string[]): string {
    if (args.length < 1) {
      return this.formatter.formatError('Usage: create_parking_lot <capacity>');
    }

    const capacity = parseInt(args[0], 10);
    if (isNaN(capacity) || capacity <= 0) {
      return this.formatter.formatError('Capacity must be a positive number');
    }

    this.parkingService.createParkingLot(capacity);
    return this.formatter.formatParkingLotCreated(capacity);
  }

  /**
   * Handles: park <registration_number> <color>
   */
  private handlePark(args: string[]): string {
    if (args.length < 2) {
      return this.formatter.formatError('Usage: park <registration_number> <color>');
    }

    // Check if parking lot exists
    if (!this.parkingService.isInitialized()) {
      return this.formatter.formatError('Please create a parking lot first');
    }

    const registrationNumber = args[0];
    const color = args[1];

    const slotNumber = this.parkingService.park(registrationNumber, color);

    if (slotNumber === null) {
      return this.formatter.formatParkingLotFull();
    }

    if (slotNumber === -1) {
      // Duplicate registration - find existing slot
      const existingSlot = this.parkingService.getSlotNumberByRegistration(registrationNumber);
      return this.formatter.formatDuplicateRegistration(registrationNumber, existingSlot!);
    }

    return this.formatter.formatSlotAllocated(slotNumber);
  }

  /**
   * Handles: leave <slot_number>
   */
  private handleLeave(args: string[]): string {
    if (args.length < 1) {
      return this.formatter.formatError('Usage: leave <slot_number>');
    }

    const slotNumber = parseInt(args[0], 10);
    if (isNaN(slotNumber) || slotNumber <= 0) {
      return this.formatter.formatError('Slot number must be a positive number');
    }

    // Check if parking lot exists
    if (!this.parkingService.isInitialized()) {
      return this.formatter.formatError('Please create a parking lot first');
    }

    const success = this.parkingService.leave(slotNumber);

    if (success) {
      return this.formatter.formatSlotFreed(slotNumber);
    }

    // Silent failure for invalid/empty slots as per requirements
    return this.formatter.formatSlotFreed(slotNumber);
  }

  /**
   * Handles: status
   */
  private handleStatus(): string {
    if (!this.parkingService.isInitialized()) {
      return this.formatter.formatError('Please create a parking lot first');
    }

    const entries = this.parkingService.getStatus();
    return this.formatter.formatStatus(entries);
  }

  /**
   * Handles: registration_numbers_for_cars_with_colour <color>
   */
  private handleRegistrationsByColor(args: string[]): string {
    if (args.length < 1) {
      return this.formatter.formatError('Usage: registration_numbers_for_cars_with_colour <color>');
    }

    if (!this.parkingService.isInitialized()) {
      return this.formatter.formatNotFound();
    }

    const color = args[0];
    const registrations = this.parkingService.getRegistrationNumbersByColor(color);
    return this.formatter.formatRegistrationNumbers(registrations);
  }

  /**
   * Handles: slot_numbers_for_cars_with_colour <color>
   */
  private handleSlotsByColor(args: string[]): string {
    if (args.length < 1) {
      return this.formatter.formatError('Usage: slot_numbers_for_cars_with_colour <color>');
    }

    if (!this.parkingService.isInitialized()) {
      return this.formatter.formatNotFound();
    }

    const color = args[0];
    const slots = this.parkingService.getSlotNumbersByColor(color);
    return this.formatter.formatSlotNumbers(slots);
  }

  /**
   * Handles: slot_number_for_registration_number <registration>
   */
  private handleSlotByRegistration(args: string[]): string {
    if (args.length < 1) {
      return this.formatter.formatError('Usage: slot_number_for_registration_number <registration>');
    }

    if (!this.parkingService.isInitialized()) {
      return this.formatter.formatNotFound();
    }

    const registration = args[0];
    const slot = this.parkingService.getSlotNumberByRegistration(registration);
    return this.formatter.formatSlotNumber(slot);
  }
}
