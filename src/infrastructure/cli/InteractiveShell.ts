import * as readline from 'readline';
import { CommandProcessor } from '../../application/CommandProcessor';
import { OutputFormatter } from './OutputFormatter';

/**
 * InteractiveShell - Provides a REPL interface for the parking lot system.
 * 
 * This creates a nice interactive experience with:
 * - Welcome banner
 * - Color-coded prompts and outputs
 * - Help command
 * - Graceful exit handling
 * 
 * We use Node's readline module for cross-platform terminal input handling.
 */
export class InteractiveShell {
  private commandProcessor: CommandProcessor;
  private formatter: OutputFormatter;
  private rl: readline.Interface | null = null;

  constructor(commandProcessor: CommandProcessor, formatter: OutputFormatter) {
    this.commandProcessor = commandProcessor;
    this.formatter = formatter;
  }

  /**
   * Starts the interactive shell.
   * 
   * This method returns a Promise that resolves when the user exits.
   * The shell will keep running, processing commands one at a time,
   * until the user types 'exit' or sends EOF (Ctrl+D).
   */
  async start(): Promise<void> {
    // Create readline interface for terminal input
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Show the welcome banner
    console.log(this.formatter.formatWelcomeBanner());

    // Main REPL loop
    return new Promise((resolve) => {
      this.promptAndProcess(resolve);
    });
  }

  /**
   * Prompts for input, processes the command, and loops.
   * 
   * This recursive approach keeps the code clean and handles
   * async operations nicely.
   */
  private promptAndProcess(onExit: () => void): void {
    if (!this.rl) {
      onExit();
      return;
    }

    this.rl.question(this.formatter.formatPrompt(), (input) => {
      const result = this.commandProcessor.process(input);

      // null result means exit
      if (result === null) {
        console.log('\nGoodbye! Drive safely. 🚗\n');
        this.rl?.close();
        onExit();
        return;
      }

      // Print output if not empty
      if (result) {
        console.log(result);
      }

      // Continue the loop
      this.promptAndProcess(onExit);
    });

    // Handle Ctrl+C gracefully
    this.rl.on('SIGINT', () => {
      console.log('\n\nInterrupted. Goodbye!\n');
      this.rl?.close();
      onExit();
    });
  }
}
