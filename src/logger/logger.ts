export interface Logger {
  debug(...data: any[]): void;
  error(...data: any[]): void;
  info(...data: any[]): void;
  log(...data: any[]): void;
  trace(...data: any[]): void;
  warn(...data: any[]): void;
}

export class ConsoleLogger implements Logger {
  debug(...data: any[]): void {
    console.debug(data);
  }
  error(...data: any[]): void {
    console.error(data);
  }
  info(...data: any[]): void {
    console.info(data);
  }
  log(...data: any[]): void {
    console.log(data);
  }
  trace(...data: any[]): void {
    console.trace(data);
  }
  warn(...data: any[]): void {
    console.warn(data);
  }
}

export class BitBucketLogger implements Logger {
  debug(...data: any[]): void {}
  error(...data: any[]): void {}
  info(...data: any[]): void {}
  log(...data: any[]): void {}
  trace(...data: any[]): void {}
  warn(...data: any[]): void {}
}
