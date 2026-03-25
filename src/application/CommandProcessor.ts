import { ParkingLotManager } from '../domain/services/ParkingLotManager';
import { OutputFormatter } from '../infrastructure/cli/OutputFormatter';
import { EvenDistributionStrategy } from '../domain/strategies/EvenDistributionStrategy';
import { FillFirstStrategy } from '../domain/strategies/FillFirstStrategy';
import * as fs from 'fs';
import * as readline from 'readline';

/**
 * CommandProcessor - Parses and executes parking lot commands.
 * 
 * This is the bridge between raw text commands and our domain logic.
 * Each command string gets parsed, validated, and routed to the
 * appropriate service method.
 * 
 * Now supports multi-lot operations with dispatcher-based allocation.
 */
export class CommandProcessor {
  private manager: ParkingLotManager;
  private formatter: OutputFormatter;

  constructor(manager: ParkingLotManager, formatter: OutputFormatter) {
    this.manager = manager;
    this.formatter = formatter;
  }

  /**
   * Processes a single command and returns the output string.
   * 
   * Commands are case-sensitive for the command name itself,
   * but arguments (like colors) are handled case-insensitively
   * where appropriate.
   * 
   * @returns The formatted output, null for exit command, or a Promise for async commands like load
   */
  process(commandLine: string): string | null | Promise<string[]> {
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

      case 'dispatch_rule':
        return this.handleDispatchRule(args);

      case 'load':
      case 'run':
        return this.handleLoadFile(args);

      case 'help':
        return this.formatter.formatHelp();

      case 'exit':
        return null; // Signal to exit

      default:
        // For unknown commands, we stay silent per requirements
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

    const lotNumber = this.manager.createParkingLot(capacity);
    return this.formatter.formatParkingLotCreated(capacity);
  }

  /**
   * Handles: park <registration_number> <color>
   * Dispatcher automatically selects the lot based on current rule.
   */
  private handlePark(args: string[]): string {
    if (args.length < 2) {
      return this.formatter.formatError('Usage: park <registration_number> <color>');
    }

    // Check if any parking lots exist
    if (!this.manager.hasLots()) {
      return this.formatter.formatError('Please create a parking lot first');
    }

    const registrationNumber = args[0];
    const color = args[1];

    const result = this.manager.park(registrationNumber, color);

    if (result === null) {
      return this.formatter.formatAllLotsFull();
    }

    if (result === -1) {
      // Duplicate registration - find existing location
      const existingSlot = this.manager.getSlotNumberByRegistration(registrationNumber);
      return this.formatter.formatDuplicateRegistration(registrationNumber, existingSlot!);
    }

    return this.formatter.formatSlotAllocatedWithLot(result.slotNumber, result.lotNumber);
  }

  /**
   * Handles: leave <lot_number> <slot_number>
   */
  private handleLeave(args: string[]): string {
    if (args.length < 2) {
      return this.formatter.formatError('Usage: leave <lot_number> <slot_number>');
    }

    const lotNumber = parseInt(args[0], 10);
    const slotNumber = parseInt(args[1], 10);
    
    if (isNaN(lotNumber) || lotNumber <= 0) {
      return this.formatter.formatError('Lot number must be a positive number');
    }
    
    if (isNaN(slotNumber) || slotNumber <= 0) {
      return this.formatter.formatError('Slot number must be a positive number');
    }

    // Check if parking lots exist
    if (!this.manager.hasLots()) {
      return this.formatter.formatError('Please create a parking lot first');
    }

    const success = this.manager.leave(lotNumber, slotNumber);

    // Always return freed message as per original behavior
    return this.formatter.formatSlotFreedWithLot(slotNumber, lotNumber);
  }

  /**
   * Handles: status
   * Shows all lots with clear separators.
   */
  private handleStatus(): string {
    if (!this.manager.hasLots()) {
      return this.formatter.formatError('Please create a parking lot first');
    }

    const entries = this.manager.getStatus();
    return this.formatter.formatStatusMultiLot(entries);
  }

  /**
   * Handles: registration_numbers_for_cars_with_colour <color>
   * Searches across all parking lots.
   */
  private handleRegistrationsByColor(args: string[]): string {
    if (args.length < 1) {
      return this.formatter.formatError('Usage: registration_numbers_for_cars_with_colour <color>');
    }

    if (!this.manager.hasLots()) {
      return this.formatter.formatNotFound();
    }

    const color = args[0];
    const registrations = this.manager.getRegistrationNumbersByColor(color);
    return this.formatter.formatRegistrationNumbers(registrations);
  }

  /**
   * Handles: slot_numbers_for_cars_with_colour <color>
   * Searches across all lots, returns with lot prefix (L1-1, L2-3).
   */
  private handleSlotsByColor(args: string[]): string {
    if (args.length < 1) {
      return this.formatter.formatError('Usage: slot_numbers_for_cars_with_colour <color>');
    }

    if (!this.manager.hasLots()) {
      return this.formatter.formatNotFound();
    }

    const color = args[0];
    const slots = this.manager.getSlotNumbersByColor(color);
    return this.formatter.formatSlotNumbersWithLot(slots);
  }

  /**
   * Handles: slot_number_for_registration_number <registration>
   * Returns with lot prefix (L2-4).
   */
  private handleSlotByRegistration(args: string[]): string {
    if (args.length < 1) {
      return this.formatter.formatError('Usage: slot_number_for_registration_number <registration>');
    }

    if (!this.manager.hasLots()) {
      return this.formatter.formatNotFound();
    }

    const registration = args[0];
    const slot = this.manager.getSlotNumberByRegistration(registration);
    return this.formatter.formatSlotNumberWithLot(slot);
  }

  /**
   * Handles: dispatch_rule <rule>
   * Sets the dispatcher's allocation strategy.
   */
  private handleDispatchRule(args: string[]): string {
    if (args.length < 1) {
      return this.formatter.formatError('Usage: dispatch_rule <even_distribution|fill_first>');
    }

    const rule = args[0].toLowerCase();
    const dispatcher = this.manager.getDispatcher();

    switch (rule) {
      case 'even_distribution':
        dispatcher.setStrategy(new EvenDistributionStrategy());
        return this.formatter.formatDispatchRuleSet('Even Distribution');

      case 'fill_first':
        dispatcher.setStrategy(new FillFirstStrategy());
        return this.formatter.formatDispatchRuleSet('Fill First');

      default:
        return this.formatter.formatError('Invalid rule. Use: even_distribution or fill_first');
    }
  }

  /**
   * Handles: load <filename> or run <filename>
   * 
   * Loads and executes commands from a file while in interactive mode.
   * This makes it easy to run batch operations without leaving the shell.
   */
  private async handleLoadFile(args: string[]): Promise<string[]> {
    if (args.length < 1) {
      return [this.formatter.formatError('Usage: load <filename>')];
    }

    const filePath = args[0];

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return [this.formatter.formatError(`File not found: ${filePath}`)];
    }

    const results: string[] = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    try {
      // Process each line from the file
      for await (const line of rl) {
        const result = this.process(line);

        // Handle async results (nested load commands)
        if (result instanceof Promise) {
          const nestedResults = await result;
          results.push(...nestedResults);
        } else if (result === null) {
          // Don't exit the shell when file contains 'exit'
          // Just skip it
          continue;
        } else if (result) {
          results.push(result);
        }
      }
    } finally {
      // Ensure readline is properly closed
      rl.close();
    }

    return results;
  }
}
