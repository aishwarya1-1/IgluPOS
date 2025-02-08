// rawBtPrinterService.ts
export class RawBTPrinterService {
  // ESC/POS Commands
  private ESC = "\x1B";
  private GS = "\x1D";
  private INIT = "\x1B\x40"; // Initialize printer
  private CENTER = "\x1B\x61\x01"; // Center alignment
  private LEFT = "\x1B\x61\x00"; // Left alignment
  private RIGHT = "\x1B\x61\x02"; // Right alignment
  private BOLD_ON = "\x1B\x45\x01"; // Bold on
  private BOLD_OFF = "\x1B\x45\x00"; // Bold off
  private DOUBLE_ON = "\x1B\x21\x30"; // Double height & width
  private DOUBLE_OFF = "\x1B\x21\x00"; // Normal text
  private NEW_LINE = "\x0A"; // Line feed
  private CUT = "\x1D\x56\x41"; // Paper cut

  formatText(
    text: string,
    options: {
      bold?: boolean;
      center?: boolean;
      double?: boolean;
    } = {}
  ): string {
    let formattedText = "";

    if (options.center) formattedText += this.CENTER;
    if (options.bold) formattedText += this.BOLD_ON;
    if (options.double) formattedText += this.DOUBLE_ON;

    formattedText += text + this.NEW_LINE;

    if (options.double) formattedText += this.DOUBLE_OFF;
    if (options.bold) formattedText += this.BOLD_OFF;
    if (options.center) formattedText += this.LEFT;

    return formattedText;
  }

  async print(content: string): Promise<void> {
    try {
      // Format content with printer initialization
      const printData =
        this.INIT + content + this.NEW_LINE + this.NEW_LINE + this.CUT;

      // Convert to hex for RawBT
      const hexString = this.convertToHex(printData);

      // Create RawBT URL
      const rawBtUrl = `rawbt:base64,${btoa(hexString)}`;

      // Open URL which will be handled by RawBT app
      window.location.href = rawBtUrl;
    } catch (error) {
      console.error("Printing error:", error);
      throw new Error("Failed to print");
    }
  }

  private convertToHex(str: string): string {
    let hex = "";
    for (let i = 0; i < str.length; i++) {
      hex += str.charCodeAt(i).toString(16).padStart(2, "0");
    }
    return hex;
  }

  // Utility function to format price items
  formatPriceItem(item: string, price: string, width: number = 32): string {
    const itemLength = item.length;
    const priceLength = price.length;
    const spacesNeeded = width - itemLength - priceLength;

    if (spacesNeeded < 1) return `${item}\n${price}`;

    return `${item}${" ".repeat(spacesNeeded)}${price}`;
  }
}
