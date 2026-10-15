import { useState, useEffect, useRef, useCallback } from "react";
import {
  ANT_BMS_SERVICES,
  ANT_BMS_CHARACTERISTICS,
  parseAntBmsFrame,
  generateMockAntBmsData,
} from "../services/antBmsBle";

export default function useAntBms() {
  const [status, setStatus] = useState("disconnected"); // disconnected, connecting, connected, demo, error
  const [deviceName, setDeviceName] = useState(null);
  const [bmsData, setBmsData] = useState(() => generateMockAntBmsData());
  const [errorMessage, setErrorMessage] = useState("");
  const [isSupported, setIsSupported] = useState(true);

  const deviceRef = useRef(null);
  const serverRef = useRef(null);
  const bufferRef = useRef(new Uint8Array(512));
  const bufferLenRef = useRef(0);
  const demoIntervalRef = useRef(null);

  // Check if Web Bluetooth is supported
  useEffect(() => {
    if (typeof navigator !== "undefined" && !navigator.bluetooth) {
      setIsSupported(false);
    }
  }, []);

  // Demo Mode Loop
  useEffect(() => {
    if (status === "demo") {
      demoIntervalRef.current = setInterval(() => {
        setBmsData(generateMockAntBmsData());
      }, 1000);
    } else {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
    }

    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
    };
  }, [status]);

  // Handle incoming BLE chunk
  const handleCharacteristicValue = useCallback((event) => {
    const value = event.target.value;
    if (!value || value.byteLength === 0) return;

    const chunk = new Uint8Array(value.buffer);

    // If chunk starts with header (0xAA 0x55 or 0x7E or 0xDB), reset buffer
    if ((chunk[0] === 0xaa && chunk[1] === 0x55) || (chunk[0] === 0xdb && chunk[1] === 0xdb)) {
      bufferLenRef.current = 0;
    }

    // Append chunk to buffer
    if (bufferLenRef.current + chunk.length <= bufferRef.current.length) {
      bufferRef.current.set(chunk, bufferLenRef.current);
      bufferLenRef.current += chunk.length;
    }

    // Try parsing if we have enough bytes (standard 140 bytes)
    if (bufferLenRef.current >= 70) {
      const dataView = new DataView(
        bufferRef.current.buffer,
        0,
        bufferLenRef.current
      );
      const parsed = parseAntBmsFrame(dataView);
      if (parsed) {
        setBmsData(parsed);
      }
    }
  }, []);

  // Connect via Web Bluetooth
  const connect = useCallback(async (acceptAll = false) => {
    setErrorMessage("");

    if (!navigator.bluetooth) {
      setStatus("error");
      setErrorMessage("Web Bluetooth is not supported in this browser. Please use Chrome on Android or Edge/Chrome on PC/Mac.");
      return;
    }

    try {
      setStatus("connecting");

      const options = acceptAll
        ? {
            acceptAllDevices: true,
            optionalServices: [
              "0000ffe0-0000-1000-8000-00805f9b34fb",
              "00000ffe-0000-1000-8000-00805f9b34fb",
            ],
          }
        : {
            filters: [
              { namePrefix: "ANT" },
              { namePrefix: "ant" },
              { namePrefix: "BMS" },
              { namePrefix: "bms" },
            ],
            optionalServices: [
              "0000ffe0-0000-1000-8000-00805f9b34fb",
              "00000ffe-0000-1000-8000-00805f9b34fb",
            ],
          };

      const device = await navigator.bluetooth.requestDevice(options);
      deviceRef.current = device;
      setDeviceName(device.name || "ANT BMS Device");

      device.addEventListener("gattserverdisconnected", () => {
        console.warn("ANT BMS Bluetooth disconnected");
        setStatus("disconnected");
        setDeviceName(null);
      });

      const server = await device.gatt.connect();
      serverRef.current = server;

      // Find BMS Service
      let service = null;
      for (const serviceId of [
        "0000ffe0-0000-1000-8000-00805f9b34fb",
        "00000ffe-0000-1000-8000-00805f9b34fb",
      ]) {
        try {
          service = await server.getPrimaryService(serviceId);
          if (service) break;
        } catch {
          // try next
        }
      }

      if (!service) {
        throw new Error("Connected, but could not find ANT BMS BLE service.");
      }

      // Find Characteristic
      let characteristic = null;
      for (const charId of [
        "0000ffe1-0000-1000-8000-00805f9b34fb",
        "00000ffe-0000-1000-8000-00805f9b34fb",
      ]) {
        try {
          characteristic = await service.getCharacteristic(charId);
          if (characteristic) break;
        } catch {
          // try next
        }
      }

      if (!characteristic) {
        throw new Error("Found service, but could not find telemetry characteristic.");
      }

      // Start notifications
      await characteristic.startNotifications();
      characteristic.addEventListener("characteristicvaluechanged", handleCharacteristicValue);

      setStatus("connected");
    } catch (err) {
      console.warn("BLE connect error:", err);
      if (err.name !== "NotFoundError") {
        setStatus("error");
        setErrorMessage(err.message || "Failed to pair with ANT BMS.");
      } else {
        setStatus("disconnected");
      }
    }
  }, [handleCharacteristicValue]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (serverRef.current && serverRef.current.connected) {
      serverRef.current.disconnect();
    }
    setStatus("disconnected");
    setDeviceName(null);
  }, []);

  // Toggle Demo Mode
  const toggleDemo = useCallback(() => {
    if (status === "demo") {
      disconnect();
    } else {
      setStatus("demo");
      setDeviceName("ANT-BMS-20S (Demo Simulation)");
      setBmsData(generateMockAntBmsData());
    }
  }, [status, disconnect]);

  return {
    status,
    deviceName,
    bmsData,
    errorMessage,
    isSupported,
    connect,
    disconnect,
    toggleDemo,
  };
}
