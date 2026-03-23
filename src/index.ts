/**
 * Parking Lot System - Main Entry Point
 * 
 * This is where everything comes together. Based on command line args,
 * we either launch the interactive shell or process a file.
 * 
 * Usage:
 *   node dist/index.js              - Interactive mode
 *   node dist/index.js <file>       - File mode
 */

import { ParkingLotService } from './domain/services/ParkingLotService';
import { CommandProcessor } from './application/CommandProcessor';
import { OutputFormatter } from './infrastructure/cli/OutputFormatter';
import { InteractiveShell } from './infrastructure/cli/InteractiveShell';
import { FileProcessor } from './infrastructure/cli/FileProcessor';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  // Create the parking lot service - this holds all our state
  const parkingService = new ParkingLotService();

  if (args.length === 0) {
    // Interactive mode - with colors!
    const formatter = new OutputFormatter(true);
    const processor = new CommandProcessor(parkingService, formatter);
    const shell = new InteractiveShell(processor, formatter);
    
    await shell.start();
  } else {
    // File mode - no colors for clean output
    const filePath = args[0];
    const formatter = new OutputFormatter(false);
    const processor = new CommandProcessor(parkingService, formatter);
    const fileProcessor = new FileProcessor(processor);
    
    await fileProcessor.processFile(filePath);
  }
}

// Run the main function and handle any top-level errors
main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
