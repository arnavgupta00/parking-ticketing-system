/**
 * ANSI Color Utilities
 * 
 * These are escape codes for terminal colors. No external library needed - 
 * just raw escape sequences that work on any ANSI-compatible terminal.
 * 
 * The format is: \x1b[<code>m
 * Where <code> is the color/style code.
 */

// Color codes for terminal output
export const Colors = {
  // Reset all styles
  reset: '\x1b[0m',
  
  // Regular colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Bright/bold variants
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightCyan: '\x1b[96m',
  
  // Text styles
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
} as const;

/**
 * Wraps text with a color code and reset.
 * This ensures the color doesn't "leak" into subsequent output.
 */
export function colorize(text: string, color: string): string {
  return `${color}${text}${Colors.reset}`;
}

/**
 * Convenience functions for common colorization.
 * These read more naturally in code than colorize(text, Colors.green).
 */
export const success = (text: string): string => colorize(text, Colors.green);
export const error = (text: string): string => colorize(text, Colors.red);
export const warning = (text: string): string => colorize(text, Colors.yellow);
export const info = (text: string): string => colorize(text, Colors.cyan);
export const highlight = (text: string): string => colorize(text, Colors.brightCyan);
export const bold = (text: string): string => colorize(text, Colors.bold);
export const dim = (text: string): string => colorize(text, Colors.dim);
