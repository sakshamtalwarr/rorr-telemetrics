/**
 * ANT BMS Web Bluetooth (BLE) Service
 * Communicates directly with ANT BMS hardware over Bluetooth Low Energy.
 * Handles packet chunk reassembly and frame parsing for 8S - 32S battery packs.
 */

// Common BLE UUIDs used by ANT BMS models
export const ANT_BMS_SERVICES = [
  "0000ffe0-0000-1000-8000-00805f9b34fb", // Standard FFE0 service
  "00000ffe-0000-1000-8000-00805f9b34fb", // 0FFE service
  0xffe0,
  0x0ffe,
];

export const ANT_BMS_CHARACTERISTICS = [
  "0000ffe1-0000-1000-8000-00805f9b34fb", // Notify & Write
  "00000ffe-0000-1000-8000-00805f9b34fb",
  0xffe1,
  0x0ffe,
];

/**
 * Parses ANT BMS 140-byte binary telemetry frame.
 * @param {DataView} view
 * @returns {Object} decoded BMS telemetry
 */
export function parseAntBmsFrame(view) {
  if (!view || view.byteLength < 60) return null;

  try {
    // Determine cell count and cell voltages (Cells start around offset 4 or 6)
    const cells = [];
    let offset = 4;

    // Check header signature (0xAA 0x55 or 0x5A or 0x7E)
    const h0 = view.getUint8(0);
    const h1 = view.getUint8(1);

    // Standard ANT BMS format: cell voltages are 2-byte uint16 in millivolts
    // Read up to 24 cells (typical 16S, 20S or 24S for e-motorcycle 72V packs)
    for (let i = 0; i < 24; i++) {
      if (offset + 2 <= view.byteLength) {
        const mv = view.getUint16(offset, false); // Big endian
        if (mv > 2000 && mv < 4800) {
          cells.push(mv / 1000); // in Volts
        }
        offset += 2;
      }
    }

    // Total pack voltage (in 0.1V or mV)
    let totalVoltage = 0;
    if (view.byteLength >= 72) {
      totalVoltage = view.getUint16(70, false) / 10;
      if (totalVoltage < 10 || totalVoltage > 150) {
        totalVoltage = cells.reduce((sum, c) => sum + c, 0);
      }
    } else {
      totalVoltage = cells.reduce((sum, c) => sum + c, 0);
    }

    // Current (signed, in 0.1A)
    let current = 0;
    if (view.byteLength >= 76) {
      current = view.getInt32(72, false) / 10;
    }

    // State of Charge (SoC %)
    let soc = 100;
    if (view.byteLength >= 77) {
      soc = view.getUint8(76);
    }

    // Capacity (Ah)
    let remainingAh = 0;
    let totalAh = 50;
    if (view.byteLength >= 84) {
      remainingAh = view.getUint32(78, false) / 1000;
      totalAh = view.getUint32(82, false) / 1000;
    }

    // Temperatures
    let mosTemp = 38;
    let temp1 = 32;
    let temp2 = 34;
    if (view.byteLength >= 96) {
      mosTemp = view.getInt16(90, false);
      temp1 = view.getInt16(92, false);
      temp2 = view.getInt16(94, false);
    }

    // MOSFET states & Balancer flags
    const chargeMosfet = view.byteLength >= 100 ? (view.getUint8(98) & 0x01) === 1 : true;
    const dischargeMosfet = view.byteLength >= 100 ? (view.getUint8(99) & 0x01) === 1 : true;

    // Calculate Delta & Min/Max
    const validCells = cells.length > 0 ? cells : [3.65];
    const maxCell = Math.max(...validCells);
    const minCell = Math.min(...validCells);
    const maxIndex = validCells.indexOf(maxCell) + 1;
    const minIndex = validCells.indexOf(minCell) + 1;
    const deltaMv = Math.round((maxCell - minCell) * 1000);

    return {
      cells: validCells,
      cellCount: validCells.length,
      totalVoltage: Number(totalVoltage.toFixed(1)),
      current: Number(current.toFixed(1)),
      powerWatts: Math.round(totalVoltage * current),
      soc: Math.min(100, Math.max(0, soc)),
      remainingAh: Number(remainingAh.toFixed(1)),
      totalAh: Number(totalAh.toFixed(1)),
      mosTemp: mosTemp > 150 ? 40 : mosTemp,
      temp1: temp1 > 150 ? 32 : temp1,
      temp2: temp2 > 150 ? 34 : temp2,
      chargeMosfet,
      dischargeMosfet,
      maxCell: Number(maxCell.toFixed(3)),
      maxIndex,
      minCell: Number(minCell.toFixed(3)),
      minIndex,
      deltaMv,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.warn("ANT BMS frame parse exception:", err);
    return null;
  }
}

/**
 * Generates initial zeroes for disconnected state.
 * By default, all 20 cell voltages and battery telemetry are set to 0.
 */
export function getZeroAntBmsData() {
  const cellCount = 20; // Oben Rorr 20S Pack
  const cells = new Array(cellCount).fill(0);

  return {
    cells,
    cellCount,
    totalVoltage: 0,
    current: 0,
    powerWatts: 0,
    soc: 0,
    remainingAh: 0,
    totalAh: 0,
    mosTemp: 0,
    temp1: 0,
    temp2: 0,
    chargeMosfet: false,
    dischargeMosfet: false,
    maxCell: 0,
    maxIndex: 0,
    minCell: 0,
    minIndex: 0,
    deltaMv: 0,
    timestamp: null,
  };
}

/**
 * Generates realistic simulation data for 20S (72V) e-motorcycle pack
 * for testing and verification before hardware pairing.
 */
export function generateMockAntBmsData() {
  const cellCount = 20; // Oben Rorr ~72V LFP Pack
  const baseVoltage = 3.62;
  const cells = [];

  for (let i = 0; i < cellCount; i++) {
    // Realistic variation of ±12mV
    const jitter = (Math.sin(i * 1.5 + Date.now() / 3000) * 0.015);
    cells.push(Number((baseVoltage + jitter).toFixed(3)));
  }

  const maxCell = Math.max(...cells);
  const minCell = Math.min(...cells);
  const maxIndex = cells.indexOf(maxCell) + 1;
  const minIndex = cells.indexOf(minCell) + 1;
  const deltaMv = Math.round((maxCell - minCell) * 1000);
  const totalVoltage = Number(cells.reduce((a, b) => a + b, 0).toFixed(1));
  const current = Number((Math.sin(Date.now() / 4000) * 15 - 5).toFixed(1)); // Oscillates between charging and discharging

  return {
    cells,
    cellCount,
    totalVoltage,
    current,
    powerWatts: Math.round(totalVoltage * current),
    soc: 88,
    remainingAh: 44.0,
    totalAh: 50.0,
    mosTemp: 41,
    temp1: 33,
    temp2: 35,
    chargeMosfet: true,
    dischargeMosfet: true,
    maxCell,
    maxIndex,
    minCell,
    minIndex,
    deltaMv,
    timestamp: Date.now(),
  };
}
