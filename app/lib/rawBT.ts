// lib/utils/rawBT.ts
import { CartItem } from "@/context/CartContext";
type PrintOptions = {
  bold?: boolean;
  center?: boolean;
  double?: boolean;
};

export class RawBTPrinter {
  // Commands for 58mm printer
  private static readonly COMMANDS = {
    LF: "\x0A", // Line Feed
    ESC: "\x1B", // ESC
    CENTER: [0x1b, 0x61, 0x01], // Center alignment
    LEFT: [0x1b, 0x61, 0x00], // Left alignment
    RIGHT: [0x1b, 0x61, 0x02], // Right alignment
    BOLD_ON: [0x1b, 0x45, 0x01], // Bold font ON
    BOLD_OFF: [0x1b, 0x45, 0x00], // Bold font OFF
    NORMAL: [0x1b, 0x21, 0x00], // Normal size text
    DOUBLE: [0x1b, 0x21, 0x30], // Double size text
    INIT: [0x1b, 0x40], // Initialize printer
    // Full cut with feed
    CUT: [0x1d, 0x56, 0x41], // GS V A - Full cut
    // Paper feed and cut
  };
  private static createBuffer(commands: number[]): string {
    return String.fromCharCode.apply(null, commands);
  }

  private static formatText(
    text: string,
    options: PrintOptions = {}
  ): number[] {
    let commands: number[] = [];

    if (options.center) {
      commands = [...commands, ...this.COMMANDS.CENTER];
    }
    if (options.bold) {
      commands = [...commands, ...this.COMMANDS.BOLD_ON];
    }
    if (options.double) {
      commands = [...commands, ...this.COMMANDS.DOUBLE];
    }

    // Add text
    const textBytes = Array.from(text).map((char) => char.charCodeAt(0));
    commands = [...commands, ...textBytes, 0x0a]; // Add text and line feed

    // Reset formatting
    if (options.double) {
      commands = [...commands, ...this.COMMANDS.NORMAL];
    }
    if (options.bold) {
      commands = [...commands, ...this.COMMANDS.BOLD_OFF];
    }
    if (options.center) {
      commands = [...commands, ...this.COMMANDS.LEFT];
    }

    return commands;
  }

  private static formatPriceItem(
    item: string,
    price: string,
    width: number = 32
  ): string {
    const itemLength = item.length;
    const priceLength = price.length;
    const spacesNeeded = width - itemLength - priceLength;

    if (spacesNeeded < 1) return `${item}\n${price}`;

    return `${item}${" ".repeat(spacesNeeded)}${price}`;
  }

  static async printCustomerBill(
    items: CartItem[],
    totalCost: number,
    billNo: string | null,
    branchId: string,
    shopName: string = "IGLU ICE CREAM SHOP"
  ): Promise<void> {
    try {
      let commands: number[] = [...this.COMMANDS.INIT];

      // Header
      commands = [
        ...commands,
        ...this.formatText(shopName, {
          center: true,
          bold: true,
          double: true,
        }),
      ];
      commands = [
        ...commands,
        ...this.formatText(`Branch ID: ${branchId}`, { center: true }),
      ];
      commands = [
        ...commands,
        ...this.formatText(`Date: ${new Date().toLocaleDateString()}`, {
          center: true,
        }),
      ];
      commands = [
        ...commands,
        ...this.formatText("CUSTOMER COPY", { center: true, bold: true }),
      ];
      if (billNo) {
        commands = [
          ...commands,
          ...this.formatText(`Bill Number: ${billNo}`, { center: true }),
        ];
      }
      commands = [...commands, ...this.formatText("-".repeat(32))];

      // Items
      for (const item of items) {
        commands = [
          ...commands,
          ...this.formatText(
            this.formatPriceItem(
              `${item.name} x ${item.quantity}`,
              `Rs.${(item.cost! * item.quantity).toFixed(2)}`
            )
          ),
        ];

        if (item.addons?.length) {
          for (const addon of item.addons) {
            commands = [
              ...commands,
              ...this.formatText(
                this.formatPriceItem(
                  `  ${addon.addonName} x ${addon.addonQuantity}`,
                  `Rs.${(addon.addonPrice! * addon.addonQuantity).toFixed(2)}`
                )
              ),
            ];
          }
        }
      }

      // Total
      commands = [...commands, ...this.formatText("-".repeat(32))];
      commands = [
        ...commands,
        ...this.formatText(
          this.formatPriceItem("Total:", `Rs.${totalCost.toFixed(2)}`),
          { bold: true }
        ),
      ];

      // Feed and cut
      commands = [...commands, 0x0a, 0x0a, 0x0a, ...this.COMMANDS.CUT];

      // Convert to base64
      const buffer = this.createBuffer(commands);
      const rawBtUrl = `rawbt:base64,${btoa(buffer)}`;

      window.location.href = rawBtUrl;
    } catch (error) {
      console.error("Failed to print customer bill:", error);
      throw new Error("Failed to print customer bill");
    }
  }

  static async printKitchenOrder(
    items: CartItem[],
    kotNumber: number | undefined,
    branchId: string,
    shopName: string = "IGLU ICE CREAM SHOP"
  ): Promise<void> {
    try {
      let commands: number[] = [...this.COMMANDS.INIT];

      // Header
      commands = [
        ...commands,
        ...this.formatText(shopName, {
          center: true,
          bold: true,
          double: true,
        }),
      ];
      commands = [
        ...commands,
        ...this.formatText(`Branch ID: ${branchId}`, { center: true }),
      ];
      commands = [
        ...commands,
        ...this.formatText(`Date: ${new Date().toLocaleDateString()}`, {
          center: true,
        }),
      ];
      commands = [
        ...commands,
        ...this.formatText(`Time: ${new Date().toLocaleTimeString()}`, {
          center: true,
        }),
      ];
      commands = [
        ...commands,
        ...this.formatText("KITCHEN COPY", { center: true, bold: true }),
      ];
      if (kotNumber) {
        commands = [
          ...commands,
          ...this.formatText(`KOT Number: ${kotNumber}`, { center: true }),
        ];
      }
      commands = [...commands, ...this.formatText("-".repeat(32))];

      // Items
      for (const item of items) {
        commands = [
          ...commands,
          ...this.formatText(`${item.quantity}x ${item.name}`, { bold: true }),
        ];

        if (item.addons?.length) {
          for (const addon of item.addons) {
            commands = [
              ...commands,
              ...this.formatText(
                `  ${addon.addonName} x ${addon.addonQuantity}`
              ),
            ];
          }
        }
      }

      // Feed and cut
      commands = [...commands, 0x0a, 0x0a, 0x0a, ...this.COMMANDS.CUT];

      // Convert to base64
      const buffer = this.createBuffer(commands);
      const rawBtUrl = `rawbt:base64,${btoa(buffer)}`;

      window.location.href = rawBtUrl;
    } catch (error) {
      console.error("Failed to print kitchen order:", error);
      throw new Error("Failed to print kitchen order");
    }
  }
  private static generateCustomerBillCommands(
    items: CartItem[],
    totalCost: number,
    billNo: string | null,
    branchId: string,
    shopName: string = "IGLU ICE CREAM SHOP"
  ): number[] {
    let commands: number[] = [...this.COMMANDS.INIT];

    // Header
    commands = [
      ...commands,
      ...this.formatText(shopName, {
        center: true,
        bold: true,
        double: true,
      }),
    ];
    commands = [
      ...commands,
      ...this.formatText(`Branch ID: ${branchId}`, { center: true }),
    ];
    commands = [
      ...commands,
      ...this.formatText(`Date: ${new Date().toLocaleDateString()}`, {
        center: true,
      }),
    ];
    commands = [
      ...commands,
      ...this.formatText("CUSTOMER COPY", { center: true, bold: true }),
    ];
    if (billNo) {
      commands = [
        ...commands,
        ...this.formatText(`Bill Number: ${billNo}`, { center: true }),
      ];
    }
    commands = [...commands, ...this.formatText("-".repeat(32))];

    // Items
    for (const item of items) {
      commands = [
        ...commands,
        ...this.formatText(
          this.formatPriceItem(
            `${item.name} x ${item.quantity}`,
            `Rs.${(item.cost! * item.quantity).toFixed(2)}`
          )
        ),
      ];

      if (item.addons?.length) {
        for (const addon of item.addons) {
          commands = [
            ...commands,
            ...this.formatText(
              this.formatPriceItem(
                `  ${addon.addonName} x ${addon.addonQuantity}`,
                `Rs.${(addon.addonPrice! * addon.addonQuantity).toFixed(2)}`
              )
            ),
          ];
        }
      }
    }

    // Total
    commands = [...commands, ...this.formatText("-".repeat(32))];
    commands = [
      ...commands,
      ...this.formatText(
        this.formatPriceItem("Total:", `Rs.${totalCost.toFixed(2)}`),
        { bold: true }
      ),
    ];

    return [...commands, 0x0a, 0x0a];
  }

  // New method to generate kitchen order commands without printing
  private static generateKitchenOrderCommands(
    items: CartItem[],
    kotNumber: number | undefined,
    branchId: string,
    shopName: string = "IGLU ICE CREAM SHOP"
  ): number[] {
    let commands: number[] = [...this.COMMANDS.INIT];

    // Header
    commands = [
      ...commands,
      ...this.formatText(shopName, {
        center: true,
        bold: true,
        double: true,
      }),
    ];
    commands = [
      ...commands,
      ...this.formatText(`Branch ID: ${branchId}`, { center: true }),
    ];
    commands = [
      ...commands,
      ...this.formatText(`Date: ${new Date().toLocaleDateString()}`, {
        center: true,
      }),
    ];
    commands = [
      ...commands,
      ...this.formatText(`Time: ${new Date().toLocaleTimeString()}`, {
        center: true,
      }),
    ];
    commands = [
      ...commands,
      ...this.formatText("KITCHEN COPY", { center: true, bold: true }),
    ];
    if (kotNumber) {
      commands = [
        ...commands,
        ...this.formatText(`KOT Number: ${kotNumber}`, { center: true }),
      ];
    }
    commands = [...commands, ...this.formatText("-".repeat(32))];

    // Items
    for (const item of items) {
      commands = [
        ...commands,
        ...this.formatText(`${item.quantity}x ${item.name}`, { bold: true }),
      ];

      if (item.addons?.length) {
        for (const addon of item.addons) {
          commands = [
            ...commands,
            ...this.formatText(`  ${addon.addonName} x ${addon.addonQuantity}`),
          ];
        }
      }
    }

    return [...commands, 0x0a, 0x0a];
  }

  // New method to print both copies together
  static async printCombinedOrder(
    items: CartItem[],
    totalCost: number,
    billNo: string | null,
    kotNumber: number | undefined,
    branchId: string,
    shopName: string = "IGLU ICE CREAM SHOP"
  ): Promise<void> {
    try {
      // Generate commands for both copies
      const customerCommands = this.generateCustomerBillCommands(
        items,
        totalCost,
        billNo,
        branchId,
        shopName
      );

      const separatorCommands = this.formatText("-".repeat(48), {
        center: true,
      });
      // Add kitchen copy commands
      const kitchenCommands = this.generateKitchenOrderCommands(
        items,
        kotNumber,
        branchId,
        shopName
      );

      const allCommands = [
        ...this.COMMANDS.INIT, // Initialize printer
        ...customerCommands, // Customer copy
        0x0a, // Extra line feed
        ...separatorCommands, // Separator line
        0x0a, // Extra line feed
        ...kitchenCommands, // Kitchen copy
      ];

      // Convert to base64
      const buffer = this.createBuffer(allCommands);
      const rawBtUrl = `rawbt:base64,${btoa(buffer)}`;

      window.location.href = rawBtUrl;
    } catch (error) {
      console.error("Failed to print combined order:", error);
      throw new Error("Failed to print combined order");
    }
  }
}
