class Logger {
  info(message: string): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  }

  error(message: string, error?: any): void {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`,
      error || "",
    );
  }
}

export const logger = new Logger();
