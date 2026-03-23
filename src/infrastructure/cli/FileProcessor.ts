import * as fs from 'fs';
import * as readline from 'readline';
import { CommandProcessor } from '../../application/CommandProcessor';

/**
 * FileProcessor - Processes commands from an input file.
 * 
 * This handles the file-based execution mode where commands are read
 * from a file line by line and executed sequentially.
 * 
 * For file mode, we disable colors to ensure output matches
 * expected format exactly for automated testing.
 */
export class FileProcessor {
  private commandProcessor: CommandProcessor;

  constructor(commandProcessor: CommandProcessor) {
    this.commandProcessor = commandProcessor;
  }

  /**
   * Processes all commands from a file.
   * 
   * Uses streaming (readline) rather than loading the entire file
   * into memory - this handles large input files efficiently.
   * 
   * @param filePath - Path to the input file
   */
  async processFile(filePath: string): Promise<void> {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity, // Handles both \n and \r\n
    });

    // Process each line
    for await (const line of rl) {
      const result = this.commandProcessor.process(line);

      // null means exit command - stop processing
      if (result === null) {
        break;
      }

      // Print output if not empty
      // Empty results (like blank lines or unknown commands) are skipped
      if (result) {
        console.log(result);
      }
    }
  }
}
