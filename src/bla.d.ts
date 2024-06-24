declare global {
  interface String {
    splice(start: number, delCount: number, newSubStr = ""): string;
    stripDollarSign(): string;
    stripDecimalSign(): string;
    addDollarBack(): string;
    addSeparators(): string;
    addDecimalBack(): string;
    pop(): string;
    padZeroes(): string;
    padZero(length: number): string;
    removeNonDigits(): string;
  }
}

export {};
