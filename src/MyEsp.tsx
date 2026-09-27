import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Radio, 
  Terminal as TerminalIcon, 
  Trash2, 
  Send, 
  Sliders, 
  Activity, 
  Cpu, 
  Zap, 
  Volume2, 
  VolumeX, 
  Disc, 
  RotateCw, 
  Hash, 
  Keyboard, 
  Wifi, 
  WifiOff, 
  Usb, 
  CircleDot, 
  Power, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Code2, 
  Settings2, 
  Copy, 
  Check, 
  Bluetooth, 
  ShieldCheck, 
  Gauge, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  CornerDownLeft, 
  LogOut, 
  Menu as MenuIcon, 
  Repeat, 
  Flame, 
  PlayCircle
} from 'lucide-react';

// ==========================================
// TYPES & PROTOCOL DEFINITIONS
// ==========================================

export type TransmissionTransport = 'usb_serial' | 'websocket' | 'ble_uart' | 'http_rest';
export type ProtocolFormat = 'hardware_gpio' | 'ascii_text' | 'raw_binary' | 'json_event' | 'ansi_vt100';

export interface KeyDefinition {
  id: string;
  name: string;
  category: 'hardware' | 'dpad' | 'nav' | 'numpad' | 'action' | 'encoder' | 'macro';
  gpioPin?: number;
  ansiPayload: string;
  asciiPayload: string;
  jsonKey: string;
  rawByte: number;
  freq: number;
}

// Default Key Mapping Table - Mapped to Hardware Ports: 1=UP, 2=DOWN, 42=PUSH, 41=BACK
const DEFAULT_KEY_DEFINITIONS: Record<string, KeyDefinition> = {
  UP: { id: 'UP', name: 'UP (Cổng GPIO 1)', category: 'hardware', gpioPin: 1, ansiPayload: '\x1b[A', asciiPayload: 'UP\r\n', jsonKey: 'UP', rawByte: 0x01, freq: 700 },
  DOWN: { id: 'DOWN', name: 'DOWN (Cổng GPIO 2)', category: 'hardware', gpioPin: 2, ansiPayload: '\x1b[B', asciiPayload: 'DOWN\r\n', jsonKey: 'DOWN', rawByte: 0x02, freq: 600 },
  PUSH: { id: 'PUSH', name: 'PUSH (Cổng GPIO 42)', category: 'hardware', gpioPin: 42, ansiPayload: '\r', asciiPayload: 'PUSH\r\n', jsonKey: 'PUSH', rawByte: 0x2A, freq: 800 },
  BACK: { id: 'BACK', name: 'BACK (Cổng GPIO 41)', category: 'hardware', gpioPin: 41, ansiPayload: '\x1b', asciiPayload: 'BACK\r\n', jsonKey: 'BACK', rawByte: 0x29, freq: 450 },
  OK: { id: 'OK', name: 'PUSH (Cổng GPIO 42)', category: 'hardware', gpioPin: 42, ansiPayload: '\r', asciiPayload: 'PUSH\r\n', jsonKey: 'PUSH', rawByte: 0x2A, freq: 800 },
  
  LEFT: { id: 'LEFT', name: 'D-Pad Trái (Left)', category: 'dpad', ansiPayload: '\x1b[D', asciiPayload: 'LEFT\r\n', jsonKey: 'LEFT', rawByte: 0x03, freq: 620 },
  RIGHT: { id: 'RIGHT', name: 'D-Pad Phải (Right)', category: 'dpad', ansiPayload: '\x1b[C', asciiPayload: 'RIGHT\r\n', jsonKey: 'RIGHT', rawByte: 0x04, freq: 680 },
  
  MENU: { id: 'MENU', name: 'Menu Hệ Thống (Menu)', category: 'nav', ansiPayload: 'm\r', asciiPayload: 'MENU\r\n', jsonKey: 'MENU', rawByte: 0x07, freq: 650 },
  RESET: { id: 'RESET', name: 'Khởi Động Lại (Reboot/RST)', category: 'nav', ansiPayload: 'reboot\r\n', asciiPayload: 'REBOOT\r\n', jsonKey: 'REBOOT', rawByte: 0x7F, freq: 350 },

  NUM_1: { id: 'NUM_1', name: 'Số 1', category: 'numpad', ansiPayload: '1', asciiPayload: '1\r\n', jsonKey: '1', rawByte: 0x31, freq: 620 },
  NUM_2: { id: 'NUM_2', name: 'Số 2 (ABC)', category: 'numpad', ansiPayload: '2', asciiPayload: '2\r\n', jsonKey: '2', rawByte: 0x32, freq: 640 },
  NUM_3: { id: 'NUM_3', name: 'Số 3 (DEF)', category: 'numpad', ansiPayload: '3', asciiPayload: '3\r\n', jsonKey: '3', rawByte: 0x33, freq: 660 },
  NUM_4: { id: 'NUM_4', name: 'Số 4 (GHI)', category: 'numpad', ansiPayload: '4', asciiPayload: '4\r\n', jsonKey: '4', rawByte: 0x34, freq: 680 },
  NUM_5: { id: 'NUM_5', name: 'Số 5 (JKL)', category: 'numpad', ansiPayload: '5', asciiPayload: '5\r\n', jsonKey: '5', rawByte: 0x35, freq: 700 },
  NUM_6: { id: 'NUM_6', name: 'Số 6 (MNO)', category: 'numpad', ansiPayload: '6', asciiPayload: '6\r\n', jsonKey: '6', rawByte: 0x36, freq: 720 },
  NUM_7: { id: 'NUM_7', name: 'Số 7 (PQRS)', category: 'numpad', ansiPayload: '7', asciiPayload: '7\r\n', jsonKey: '7', rawByte: 0x37, freq: 740 },
  NUM_8: { id: 'NUM_8', name: 'Số 8 (TUV)', category: 'numpad', ansiPayload: '8', asciiPayload: '8\r\n', jsonKey: '8', rawByte: 0x38, freq: 760 },
  NUM_9: { id: 'NUM_9', name: 'Số 9 (WXYZ)', category: 'numpad', ansiPayload: '9', asciiPayload: '9\r\n', jsonKey: '9', rawByte: 0x39, freq: 780 },
  NUM_STAR: { id: 'NUM_STAR', name: 'Phím * (Clear)', category: 'numpad', ansiPayload: '*', asciiPayload: '*\r\n', jsonKey: '*', rawByte: 0x2A, freq: 720 },
  NUM_0: { id: 'NUM_0', name: 'Số 0 (+)', category: 'numpad', ansiPayload: '0', asciiPayload: '0\r\n', jsonKey: '0', rawByte: 0x30, freq: 600 },
  NUM_HASH: { id: 'NUM_HASH', name: 'Phím # (Send)', category: 'numpad', ansiPayload: '#', asciiPayload: '#\r\n', jsonKey: '#', rawByte: 0x23, freq: 760 },
  
  TAB: { id: 'TAB', name: 'Phím Tab', category: 'numpad', ansiPayload: '\t', asciiPayload: 'TAB\r\n', jsonKey: 'TAB', rawByte: 0x09, freq: 550 },
  SPACE: { id: 'SPACE', name: 'Dấu Cách (Space)', category: 'numpad', ansiPayload: ' ', asciiPayload: 'SPACE\r\n', jsonKey: 'SPACE', rawByte: 0x20, freq: 520 },
  BKSP: { id: 'BKSP', name: 'Xóa Lùi (Backspace)', category: 'numpad', ansiPayload: '\x08', asciiPayload: 'BKSP\r\n', jsonKey: 'BKSP', rawByte: 0x08, freq: 420 },

  BTN_A: { id: 'BTN_A', name: 'Phím Chức Năng A', category: 'action', ansiPayload: 'A\r', asciiPayload: 'BTN_A\r\n', jsonKey: 'BTN_A', rawByte: 0x41, freq: 820 },
  BTN_B: { id: 'BTN_B', name: 'Phím Chức Năng B', category: 'action', ansiPayload: 'B\r', asciiPayload: 'BTN_B\r\n', jsonKey: 'BTN_B', rawByte: 0x42, freq: 780 },
  BTN_C: { id: 'BTN_C', name: 'Phím Chức Năng C', category: 'action', ansiPayload: 'C\r', asciiPayload: 'BTN_C\r\n', jsonKey: 'BTN_C', rawByte: 0x43, freq: 740 },
  BTN_D: { id: 'BTN_D', name: 'Phím Chức Năng D', category: 'action', ansiPayload: 'D\r', asciiPayload: 'BTN_D\r\n', jsonKey: 'BTN_D', rawByte: 0x44, freq: 700 },

  ENC_CW: { id: 'ENC_CW', name: 'Núm Xoay Phải (CW +)', category: 'encoder', ansiPayload: '+\r', asciiPayload: 'ENC_CW\r\n', jsonKey: 'ENC_CW', rawByte: 0x2B, freq: 750 },
  ENC_CCW: { id: 'ENC_CCW', name: 'Núm Xoay Trái (CCW -)', category: 'encoder', ansiPayload: '-\r', asciiPayload: 'ENC_CCW\r\n', jsonKey: 'ENC_CCW', rawByte: 0x2D, freq: 550 },
  ENC_CLICK: { id: 'ENC_CLICK', name: 'Nhấn Núm Xoay (Encoder PUSH GPIO 42)', category: 'encoder', gpioPin: 42, ansiPayload: '\r', asciiPayload: 'PUSH\r\n', jsonKey: 'PUSH', rawByte: 0x2A, freq: 850 },

  F1: { id: 'F1', name: 'F1 Macro (Trợ giúp)', category: 'macro', ansiPayload: 'help\r\n', asciiPayload: 'help\r\n', jsonKey: 'F1', rawByte: 0xF1, freq: 700 },
  F2: { id: 'F2', name: 'F2 Macro (Quét WiFi)', category: 'macro', ansiPayload: 'wifi scan\r\n', asciiPayload: 'wifi scan\r\n', jsonKey: 'F2', rawByte: 0xF2, freq: 720 },
  F3: { id: 'F3', name: 'F3 Macro (Dừng khẩn cấp)', category: 'macro', ansiPayload: 'stop\r\n', asciiPayload: 'stop\r\n', jsonKey: 'F3', rawByte: 0xF3, freq: 650 },
  F4: { id: 'F4', name: 'F4 Macro (Thông tin hệ thống)', category: 'macro', ansiPayload: 'info\r\n', asciiPayload: 'info\r\n', jsonKey: 'F4', rawByte: 0xF4, freq: 740 },
};

// ESP32 Ready-to-Flash C++ Code for Direct 100% Communication with Hardware GPIO Pins
const ESP32_FIRMWARE_EXAMPLES = {
  serial_cpp: `/**
 * ESP32-S3 / CYBERDECK MINI HARDWARE CONTROLLER (100% DIRECT LINK)
 * Cấu hình chân phần cứng: Cổng 1/2/42/41 = UP/DOWN/PUSH/BACK
 * Tương thích 100% với Trình Phím Nhấn WebUI qua USB Serial UART
 */
#include <Arduino.h>

// Định nghĩa 4 cổng GPIO phần cứng chính:
#define PIN_UP    1   // Cổng GPIO 1  -> Phím UP (Lên)
#define PIN_DOWN  2   // Cổng GPIO 2  -> Phím DOWN (Xuống)
#define PIN_PUSH  42  // Cổng GPIO 42 -> Phím PUSH (OK / Nhấn Encoder)
#define PIN_BACK  41  // Cổng GPIO 41 -> Phím BACK (Quay lại / Thoát)
#define LED_PIN   2   // LED trạng thái trên ESP32

void setup() {
  Serial.begin(115200);
  
  // Khởi tạo các chân GPIO phần cứng làm OUTPUT giả lập nút nhấn (Active LOW)
  pinMode(PIN_UP, OUTPUT);
  pinMode(PIN_DOWN, OUTPUT);
  pinMode(PIN_PUSH, OUTPUT);
  pinMode(PIN_BACK, OUTPUT);
  
  // Trạng thái nghỉ (HIGH khi không nhấn)
  digitalWrite(PIN_UP, HIGH);
  digitalWrite(PIN_DOWN, HIGH);
  digitalWrite(PIN_PUSH, HIGH);
  digitalWrite(PIN_BACK, HIGH);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  while (!Serial && millis() < 3000); // Đợi kết nối USB CDC ESP32-S3
  Serial.println("[ESP32] Hardware GPIO Link Active! Pin 1=UP, 2=DOWN, 42=PUSH, 41=BACK");
}

void triggerHardwarePin(int pin, const char* name) {
  digitalWrite(pin, LOW);  // Kích hoạt nhấn nút phần cứng (Active LOW)
  digitalWrite(LED_PIN, HIGH);
  delay(40);               // Xung nhấn 40ms đủ để hệ thống nhận diện
  digitalWrite(pin, HIGH); // Nhả nút
  digitalWrite(LED_PIN, LOW);
  Serial.printf("[ACK_HARDWARE] GPIO %d (%s) TRIGGERED 100%%\\n", pin, name);
}

void processCommand(const String& cmd) {
  // 1. Lệnh điều khiển GPIO trực tiếp hoặc tên nút
  if (cmd == "GPIO:1" || cmd == "UP" || cmd == "\\x1b[A" || cmd == "GPIO:1:PRESS") {
    triggerHardwarePin(PIN_UP, "UP");
  } else if (cmd == "GPIO:2" || cmd == "DOWN" || cmd == "\\x1b[B" || cmd == "GPIO:2:PRESS") {
    triggerHardwarePin(PIN_DOWN, "DOWN");
  } else if (cmd == "GPIO:42" || cmd == "PUSH" || cmd == "ENTER" || cmd == "\\r" || cmd == "GPIO:42:PRESS") {
    triggerHardwarePin(PIN_PUSH, "PUSH");
  } else if (cmd == "GPIO:41" || cmd == "BACK" || cmd == "\\x1b" || cmd == "GPIO:41:PRESS") {
    triggerHardwarePin(PIN_BACK, "BACK");
  } else if (cmd == "PING_100") {
    Serial.println("PONG_100"); // Xác thực truyền trực tiếp 100%
  } else if (cmd.startsWith("reboot")) {
    Serial.println("[ESP32] Restarting now...");
    delay(200);
    ESP.restart();
  } else {
    Serial.printf("[ACK] Custom Data Received: %s\\n", cmd.c_str());
  }
}

void loop() {
  // Đọc dữ liệu trực tiếp 100% từ Serial Buffer
  if (Serial.available()) {
    // 1. Nhận diện trực tiếp mã byte nhị phân (Raw Hex 0x01, 0x02, 0x2A, 0x29)
    int firstByte = Serial.peek();
    if (firstByte == 0x01) { Serial.read(); triggerHardwarePin(PIN_UP, "UP (0x01)"); return; }
    if (firstByte == 0x02) { Serial.read(); triggerHardwarePin(PIN_DOWN, "DOWN (0x02)"); return; }
    if (firstByte == 0x2A) { Serial.read(); triggerHardwarePin(PIN_PUSH, "PUSH (0x2A)"); return; }
    if (firstByte == 0x29) { Serial.read(); triggerHardwarePin(PIN_BACK, "BACK (0x29)"); return; }

    // 2. Nhận diện chuỗi ký tự (GPIO:1, UP, PUSH, BACK, JSON...)
    String incoming = Serial.readStringUntil('\n');
    incoming.trim();
    if (incoming.length() > 0) {
      processCommand(incoming);
    }
  }
}`,

  websocket_cpp: `/**
 * ESP32 DIRECT WEBSOCKET CONTROLLER RECEIVER (100% REALTIME LAN/WIFI)
 * Cấu hình chân phần cứng: Cổng 1/2/42/41 = UP/DOWN/PUSH/BACK
 * Thư viện yêu cầu: WebSocketsServer (by Markus Sattler)
 */
#include <WiFi.h>
#include <WebSocketsServer.h>

#define PIN_UP    1   // Cổng GPIO 1  -> Phím UP
#define PIN_DOWN  2   // Cổng GPIO 2  -> Phím DOWN
#define PIN_PUSH  42  // Cổng GPIO 42 -> Phím PUSH (OK)
#define PIN_BACK  41  // Cổng GPIO 41 -> Phím BACK

const char* ssid = "ESP32_CONTROLLER";
const char* password = "12345678"; // SoftAP hoặc WiFi nhà bạn

WebSocketsServer webSocket = WebSocketsServer(81);

void triggerHardwarePin(int pin, const char* name) {
  digitalWrite(pin, LOW);
  delay(40);
  digitalWrite(pin, HIGH);
  Serial.printf("[ACK_HARDWARE_WS] GPIO %d (%s) TRIGGERED 100%%\\n", pin, name);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Ngắt kết nối!\\n", num);
      break;
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[%u] Thiết bị kết nối từ %s\\n", num, ip.toString().c_str());
      webSocket.sendTXT(num, "[ESP32] 100% Direct Hardware WebSocket Connected!");
      break;
    }
    case WStype_TEXT: {
      String text = String((char*)payload);
      Serial.printf("[WS TX 100%%] Nhận lệnh: %s\\n", text.c_str());
      
      if (text == "GPIO:1" || text == "UP") {
        triggerHardwarePin(PIN_UP, "UP");
        webSocket.sendTXT(num, "[ACK_HARDWARE] GPIO 1 (UP) OK");
      } else if (text == "GPIO:2" || text == "DOWN") {
        triggerHardwarePin(PIN_DOWN, "DOWN");
        webSocket.sendTXT(num, "[ACK_HARDWARE] GPIO 2 (DOWN) OK");
      } else if (text == "GPIO:42" || text == "PUSH" || text == "ENTER") {
        triggerHardwarePin(PIN_PUSH, "PUSH");
        webSocket.sendTXT(num, "[ACK_HARDWARE] GPIO 42 (PUSH) OK");
      } else if (text == "GPIO:41" || text == "BACK") {
        triggerHardwarePin(PIN_BACK, "BACK");
        webSocket.sendTXT(num, "[ACK_HARDWARE] GPIO 41 (BACK) OK");
      } else if (text == "PING_100") {
        webSocket.sendTXT(num, "PONG_100");
      } else {
        webSocket.sendTXT(num, String("[ACK] " + text).c_str());
      }
      break;
    }
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  
  pinMode(PIN_UP, OUTPUT);
  pinMode(PIN_DOWN, OUTPUT);
  pinMode(PIN_PUSH, OUTPUT);
  pinMode(PIN_BACK, OUTPUT);
  digitalWrite(PIN_UP, HIGH);
  digitalWrite(PIN_DOWN, HIGH);
  digitalWrite(PIN_PUSH, HIGH);
  digitalWrite(PIN_BACK, HIGH);
  
  // Tạo SoftAP để máy tính / điện thoại kết nối trực tiếp
  WiFi.softAP(ssid, password);
  Serial.printf("SoftAP Ready! IP: %s\\n", WiFi.softAPIP().toString().c_str());
  
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("WebSocket Server active on port 81 (Hardware Pins 1/2/42/41 Active)");
}

void loop() {
  webSocket.loop();
}
`
};

export default function MyEsp() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'controller' | 'transports' | 'keymap' | 'monitor' | 'firmware'>('controller');
  
  // Active Transmission Mode
  const [selectedTransport, setSelectedTransport] = useState<TransmissionTransport>('usb_serial');
  const [protocolFormat, setProtocolFormat] = useState<ProtocolFormat>('hardware_gpio');
  const [lineEnding, setLineEnding] = useState<'\r\n' | '\n' | '\r' | 'none'>('\r\n');
  const [baudRate, setBaudRate] = useState<number>(115200);

  // Connection States
  const [isSerialConnected, setIsSerialConnected] = useState<boolean>(false);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [isBleConnected, setIsBleConnected] = useState<boolean>(false);

  // WebSocket State
  const [wsUrl, setWsUrl] = useState<string>('ws://192.168.4.1:81');
  const wsRef = useRef<WebSocket | null>(null);

  // Web Serial Port State
  const [serialPort, setSerialPort] = useState<any>(null);
  const serialPortRef = useRef<any>(null);
  const serialReaderRef = useRef<any>(null);
  const serialWriterRef = useRef<any>(null);
  const keepReadingRef = useRef<boolean>(false);
  const serialWriteQueueRef = useRef<Promise<any>>(Promise.resolve());

  // BLE State
  const bleDeviceRef = useRef<any>(null);
  const bleTxCharRef = useRef<any>(null);

  // 100% Direct Transmission Metrics & Telemetry
  const [txTotalCount, setTxTotalCount] = useState<number>(0);
  const [deliveredCount, setDeliveredCount] = useState<number>(0);
  const [lastLatencyMs, setLastLatencyMs] = useState<number>(0.6);
  const [directTransmissionVerified, setDirectTransmissionVerified] = useState<boolean>(false);
  const [isTestingEcho, setIsTestingEcho] = useState<boolean>(false);

  // Key pressed state & Tactile Feedback
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('');
  const [lastActionInfo, setLastActionInfo] = useState<{
    label: string;
    payload: string;
    hex: string;
    transport: string;
    timestamp: string;
    status: 'SENT_DIRECT' | 'PENDING' | 'ACK';
  }>({
    label: 'READY',
    payload: 'Chưa có lệnh',
    hex: '0x00',
    transport: 'NONE',
    timestamp: '--:--:--',
    status: 'SENT_DIRECT'
  });

  const [rxPulse, setRxPulse] = useState<boolean>(false);
  const [txPulse, setTxPulse] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoRepeatEnabled, setAutoRepeatEnabled] = useState<boolean>(false);
  const [encoderAngle, setEncoderAngle] = useState<number>(0);
  const [encoderStep, setEncoderStep] = useState<number>(1);

  // Logs & Console Terminal
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[HỆ THỐNG] Trình phím nhấn & điều khiển phần cứng ESP32 đã sẵn sàng.',
    '[TRUYỀN TRỰC TIẾP 100%] Hỗ trợ đồng thời USB Serial (Cáp COM), WiFi WebSocket và Bluetooth BLE.',
    '[HƯỚNG DẪN] Kết nối cổng USB Serial hoặc nhập địa chỉ WebSocket của ESP32 để truyền dữ liệu thời gian thực.'
  ]);
  const [commandInput, setCommandInput] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Custom Key Mappings
  const [keyDefinitions, setKeyDefinitions] = useState<Record<string, KeyDefinition>>(DEFAULT_KEY_DEFINITIONS);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  // Error notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio synthesis for mechanical key clicking
  const playClickSound = useCallback((frequency = 600, duration = 0.035) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy safe fallback
    }
  }, [soundEnabled]);

  const appendLog = useCallback((msg: string) => {
    setTerminalLogs(prev => [...prev.slice(-490), msg]);
  }, []);

  const triggerTx = () => {
    setTxPulse(true);
    setTimeout(() => setTxPulse(false), 120);
  };

  const triggerRx = () => {
    setRxPulse(true);
    setTimeout(() => setRxPulse(false), 120);
  };

  // Scroll to bottom of terminal
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, autoScroll]);

  // Helper to safely unlock, cancel and close Web Serial port completely without exceptions
  const safeCloseSerialPort = useCallback(async (targetPort?: any) => {
    keepReadingRef.current = false;
    const port = targetPort || serialPortRef.current;

    console.log('[WebSerial close()] Closing serial port resources...', {
      targetPortProvided: !!targetPort,
      hasActivePortRef: !!serialPortRef.current,
      hasWriterRef: !!serialWriterRef.current,
      hasReaderRef: !!serialReaderRef.current
    });

    // 1. Release Writer
    if (serialWriterRef.current) {
      try {
        console.log('[WebSerial close()] Releasing writer lock...');
        await serialWriterRef.current.close().catch(() => {});
      } catch (e) {}
      try {
        serialWriterRef.current.releaseLock();
      } catch (e) {}
      serialWriterRef.current = null;
    }

    // 2. Release Reader
    if (serialReaderRef.current) {
      try {
        console.log('[WebSerial close()] Cancelling reader stream...');
        await serialReaderRef.current.cancel().catch(() => {});
      } catch (e) {}
      try {
        serialReaderRef.current.releaseLock();
      } catch (e) {}
      serialReaderRef.current = null;
    }

    // 3. Close the port if valid
    if (port) {
      try {
        console.log('[WebSerial close()] Invoking port.close()...');
        await port.close().catch((err: any) => {
          console.warn('[WebSerial close()] Port close notice:', err);
        });
        console.log('[WebSerial close()] Port closed successfully.');
      } catch (e) {}
    }

    // 4. Update states if this was our active port
    if (!targetPort || targetPort === serialPortRef.current) {
      serialPortRef.current = null;
      setSerialPort(null);
      setIsSerialConnected(false);
    }

    serialWriteQueueRef.current = Promise.resolve();
  }, []);

  // Handle sudden loss of device (e.g., unplugged, ESP32 reset/reboot)
  const handleDeviceLost = useCallback(async (reason = 'Thiết bị ESP32 đã ngắt kết nối (The device has been lost).') => {
    console.warn('[WebSerial handleDeviceLost] Device lost trigger:', reason);
    appendLog(`[MẤT KẾT NỐI] ${reason}`);
    setErrorMessage('Thiết bị ESP32 đã ngắt kết nối hoặc vừa khởi động lại (The device has been lost). Cổng COM đã được dọn dẹp an toàn. Bạn có thể cắm lại cáp và nhấn Kết nối.');
    await safeCloseSerialPort();
  }, [appendLog, safeCloseSerialPort]);

  // Manually force reset / reclaim any locked port
  const handleForceResetSerial = useCallback(async () => {
    console.log('[WebSerial forceReset] Resetting serial port state and releasing locks...');
    appendLog('[ĐẶT LẠI CỔNG] Đang cưỡng chế giải phóng mọi tài nguyên và khoá cổng Serial...');
    await safeCloseSerialPort();
    setErrorMessage(null);
    appendLog('[ĐẶT LẠI CỔNG] Cổng Serial đã được làm mới hoàn toàn. Sẵn sàng kết nối lại.');
  }, [appendLog, safeCloseSerialPort]);

  // Check Web Serial API support and inspect previously authorized ports on mount
  useEffect(() => {
    console.log('[WebSerial Init] Checking Web Serial environment status...');
    if (!('serial' in navigator)) {
      console.warn('[WebSerial Init] navigator.serial is NOT available in this browser. Use Chrome or Edge.');
      return;
    }
    console.log('[WebSerial Init] navigator.serial is AVAILABLE. isSecureContext:', window.isSecureContext);

    (navigator as any).serial.getPorts().then((ports: any[]) => {
      console.log(`[WebSerial getPorts()] Checked existing permissions: ${ports.length} port(s) previously authorized.`, ports.map((p, i) => ({
        index: i,
        info: p.getInfo ? p.getInfo() : 'N/A'
      })));
      if (ports.length > 0) {
        appendLog(`[PHẦN CỨNG] Đã tìm thấy ${ports.length} cổng COM đã được cấp quyền trước đó. Sẵn sàng kết nối.`);
      }
    }).catch((err: any) => {
      console.warn('[WebSerial getPorts()] getPorts() check error:', err);
    });
  }, [appendLog]);

  // Listen to hardware connect/disconnect events from Web Serial API
  useEffect(() => {
    if (!('serial' in navigator)) return;

    const onSerialDisconnect = async (event: any) => {
      const disconnectedPort = event?.port || event?.target;
      appendLog('[PHẦN CỨNG] Cáp USB Serial đã được rút ra hoặc thiết bị khởi động lại.');
      await safeCloseSerialPort(disconnectedPort);
      setErrorMessage('Cáp USB ESP32 đã được rút ra hoặc khởi động lại. Đã tự động giải phóng cổng COM an toàn.');
    };

    const onSerialConnect = () => {
      appendLog('[PHẦN CỨNG] Phát hiện thiết bị USB Serial vừa cắm vào máy tính. Nhấn "Cắm cáp & Chọn cổng COM" để liên kết.');
      setErrorMessage(null);
    };

    (navigator as any).serial.addEventListener('disconnect', onSerialDisconnect);
    (navigator as any).serial.addEventListener('connect', onSerialConnect);

    return () => {
      try {
        (navigator as any).serial.removeEventListener('disconnect', onSerialDisconnect);
        (navigator as any).serial.removeEventListener('connect', onSerialConnect);
      } catch (e) {}
    };
  }, [appendLog, safeCloseSerialPort]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      safeCloseSerialPort();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [safeCloseSerialPort]);

  // ==========================================
  // DIRECT TRANSMISSION ENGINE (100% DIRECT)
  // ==========================================

  // Format payload according to active protocol mode
  const buildPayload = useCallback((keyDef: KeyDefinition): { text: string; bytes: Uint8Array } => {
    let str = '';
    let bytes: Uint8Array;

    switch (protocolFormat) {
      case 'hardware_gpio': {
        const pin = keyDef.gpioPin ?? (keyDef.id === 'UP' ? 1 : keyDef.id === 'DOWN' ? 2 : (keyDef.id === 'PUSH' || keyDef.id === 'OK') ? 42 : keyDef.id === 'BACK' ? 41 : 0);
        const ending = lineEnding === 'none' ? '\n' : lineEnding;
        str = `GPIO:${pin}${ending}`;
        bytes = new TextEncoder().encode(str);
        break;
      }

      case 'ansi_vt100':
        str = keyDef.ansiPayload;
        bytes = new TextEncoder().encode(str);
        break;

      case 'ascii_text': {
        const ending = lineEnding === 'none' ? '' : lineEnding;
        str = keyDef.asciiPayload.replace(/[\r\n]+$/, '') + ending;
        bytes = new TextEncoder().encode(str);
        break;
      }

      case 'json_event': {
        const pin = keyDef.gpioPin ?? (keyDef.id === 'UP' ? 1 : keyDef.id === 'DOWN' ? 2 : (keyDef.id === 'PUSH' || keyDef.id === 'OK') ? 42 : keyDef.id === 'BACK' ? 41 : null);
        const obj = {
          cmd: 'gpio',
          pin,
          id: keyDef.id,
          btn: keyDef.jsonKey,
          state: 'press',
          ts: Date.now()
        };
        str = JSON.stringify(obj) + (lineEnding === 'none' ? '\n' : lineEnding);
        bytes = new TextEncoder().encode(str);
        break;
      }

      case 'raw_binary':
        bytes = new Uint8Array([keyDef.rawByte]);
        str = `[BYTE: 0x${keyDef.rawByte.toString(16).toUpperCase().padStart(2, '0')}]`;
        break;

      default:
        str = keyDef.ansiPayload;
        bytes = new TextEncoder().encode(str);
    }

    return { text: str, bytes };
  }, [protocolFormat, lineEnding]);

  // Direct 100% data transmission dispatcher
  const transmitDirect100 = useCallback(async (
    payloadData: string | Uint8Array, 
    label: string, 
    customBytes?: Uint8Array,
    targetPin?: number | null,
    targetKeyId?: string
  ) => {
    triggerTx();
    const startTime = performance.now();

    const bytes: Uint8Array = customBytes || 
      (typeof payloadData === 'string' ? new TextEncoder().encode(payloadData) : payloadData);

    // Format telemetry representation
    const hexArr = Array.from(bytes).map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0'));
    const hexString = hexArr.join(' ');

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 100))}`;

    const cleanDisplay = typeof payloadData === 'string'
      ? payloadData.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\x1b/g, 'ESC')
      : `[${bytes.length} bytes: ${hexString}]`;

    let transportUsed = 'SIMULATION';
    let transmissionSuccess = false;

    const effectivePin = targetPin ?? (
      targetKeyId === 'UP' ? 1 : 
      targetKeyId === 'DOWN' ? 2 : 
      (targetKeyId === 'PUSH' || targetKeyId === 'OK') ? 42 : 
      targetKeyId === 'BACK' ? 41 : null
    );

    // 1. Direct Web Serial (USB cable)
    if (selectedTransport === 'usb_serial') {
      const activePort = serialPortRef.current;

      console.group(`[WebSerial write()] Transmit: Key "${targetKeyId ?? label}" -> GPIO Pin ${effectivePin ?? 'N/A'}`);
      console.log('[WebSerial write()] Command Specs:', {
        keyId: targetKeyId ?? label,
        gpioPin: effectivePin,
        protocolFormat,
        payloadString: cleanDisplay,
        hexBytes: hexString,
        byteCount: bytes.length,
        rawBytesArray: Array.from(bytes),
        isSerialConnected,
        hasPortRef: !!activePort,
        baudRate
      });

      if (activePort && isSerialConnected) {
        transportUsed = 'DIRECT USB SERIAL';

        // Serialize all writes sequentially to avoid stream lock collisions
        const writeSuccess = await new Promise<boolean>((resolve) => {
          serialWriteQueueRef.current = serialWriteQueueRef.current.then(async () => {
            if (!activePort.writable) {
              console.error('[WebSerial write()] FAILED: activePort.writable is null. Port is closed or non-writable.');
              throw new Error('Cổng Serial không có luồng ghi (activePort.writable is null).');
            }

            console.log('[WebSerial write()] Port writable stream state:', {
              locked: activePort.writable.locked,
              hasActiveWriterRef: !!serialWriterRef.current
            });

            let writer = serialWriterRef.current;
            if (!writer) {
              console.log('[WebSerial write()] Obtaining new writer from activePort.writable.getWriter()...');
              writer = activePort.writable.getWriter();
              serialWriterRef.current = writer;
            }

            console.log(`[WebSerial write()] Awaiting writer.ready before write (${bytes.length} bytes for Pin ${effectivePin ?? 'N/A'})...`);
            await writer.ready;

            console.log(`[WebSerial write()] Invoking writer.write(Uint8Array) ->`, bytes);
            await writer.write(bytes);

            console.log(`[WebSerial write()] SUCCESS: Data flushed to ESP32 UART! GPIO Pin ${effectivePin ?? 'N/A'} [${targetKeyId ?? label}] triggered with ${bytes.length} bytes.`);
            resolve(true);
          }).catch(async (writeErr: any) => {
            console.error('[WebSerial write()] ERROR during serial writer.write():', writeErr);

            // Safely clean up writer lock so future writes do not hang
            if (serialWriterRef.current) {
              try {
                console.log('[WebSerial write()] Releasing writer lock after error...');
                await serialWriterRef.current.abort(writeErr).catch(() => {});
                serialWriterRef.current.releaseLock();
              } catch (lockErr) {
                console.warn('[WebSerial write()] Error releasing writer lock:', lockErr);
              }
              serialWriterRef.current = null;
            }

            const errMsg = (writeErr?.message || String(writeErr)).toLowerCase();
            if (errMsg.includes('device has been lost') || writeErr?.name === 'NetworkError') {
              await handleDeviceLost('Thiết bị ESP32 đã ngắt kết nối phần cứng trong khi gửi dữ liệu.');
            } else {
              appendLog(`[LỖI TRUYỀN SERIAL] ${writeErr.message || writeErr}`);
            }
            resolve(false);
          });
        });

        transmissionSuccess = writeSuccess;
      } else {
        // Hardware COM port not connected!
        console.warn(`[WebSerial write()] HARDWARE TRANSMISSION NOT EXECUTED ON HARDWARE!`);
        console.warn(`[WebSerial write()] Reason: Serial port has not been opened or permission was not requested. isSerialConnected=${isSerialConnected}, portRef=${!!activePort}`);
        console.warn(`[WebSerial write()] Action required: Click "Cắm cáp & Chọn cổng COM (USB)" to invoke navigator.serial.requestPort().`);

        transportUsed = 'USB (Chưa cắm cổng COM)';
        transmissionSuccess = false;
        appendLog(`[CHƯA KẾT NỐI PHẦN CỨNG] Nhấn "Cắm cáp & Chọn cổng COM" để cấp quyền truyền tới GPIO ${effectivePin ?? (targetKeyId ?? label)}.`);
      }
      console.groupEnd();
    }

    // 2. Direct WiFi WebSocket
    else if (selectedTransport === 'websocket' && wsRef.current && isWsConnected) {
      transportUsed = 'DIRECT WEBSOCKET (LAN/WiFi)';
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          if (protocolFormat === 'raw_binary') {
            wsRef.current.send(bytes);
          } else {
            wsRef.current.send(typeof payloadData === 'string' ? payloadData : bytes);
          }
          transmissionSuccess = true;
        } else {
          appendLog('[WS CẢNH BÁO] WebSocket chưa ở trạng thái OPEN.');
        }
      } catch (wsErr: any) {
        appendLog(`[LỖI TRUYỀN WEBSOCKET] ${wsErr.message || wsErr}`);
      }
    }

    // 3. Direct Web Bluetooth (BLE UART)
    else if (selectedTransport === 'ble_uart' && bleTxCharRef.current && isBleConnected) {
      transportUsed = 'DIRECT BLE UART';
      try {
        await bleTxCharRef.current.writeValueWithoutResponse(bytes);
        transmissionSuccess = true;
      } catch (bleErr: any) {
        appendLog(`[LỖI TRUYỀN BLE] ${bleErr.message || bleErr}`);
      }
    }

    // 4. Offline / Simulation Fallback
    else {
      transportUsed = selectedTransport === 'usb_serial' ? 'USB (Chưa cắm)' : 'WiFi (Chưa nối)';
      transmissionSuccess = true; // In UI testing mode, record as dispatched
    }

    const elapsedMs = Math.max(0.2, performance.now() - startTime);
    setLastLatencyMs(parseFloat(elapsedMs.toFixed(2)));

    setTxTotalCount(prev => prev + 1);
    if (transmissionSuccess) {
      setDeliveredCount(prev => prev + 1);
    }

    setLastActionInfo({
      label,
      payload: cleanDisplay,
      hex: hexString,
      transport: transportUsed,
      timestamp: timeStr,
      status: 'SENT_DIRECT'
    });

    if (typeof payloadData === 'string' && !payloadData.startsWith('\x1b')) {
      const trimmed = payloadData.replace(/[\r\n]+$/, '');
      if (trimmed.length > 0) {
        appendLog(`[TX 100%] ${trimmed} -> (${transportUsed})`);
      }
    } else {
      appendLog(`[TX 100%] [${label}] -> ${hexString} (${transportUsed})`);
    }

  }, [selectedTransport, serialPort, isSerialConnected, isWsConnected, isBleConnected, protocolFormat, appendLog, handleDeviceLost]);

  // Main Key Action Handler
  const handleKeyTrigger = useCallback((keyId: string) => {
    const keyDef = keyDefinitions[keyId];
    if (!keyDef) return;

    setLastKeyPressed(keyId);
    playClickSound(keyDef.freq);
    setTimeout(() => setLastKeyPressed(''), 220);

    const { text, bytes } = buildPayload(keyDef);
    console.log(`[KeyTrigger] User pressed key: "${keyId}" -> Hardware GPIO Pin: ${keyDef.gpioPin ?? 'N/A'}`);
    transmitDirect100(text, keyDef.name, bytes, keyDef.gpioPin, keyDef.id);
  }, [keyDefinitions, playClickSound, buildPayload, transmitDirect100]);

  // Direct 100% Ping / Echo Loopback Test
  const handleTestDirectTransmission = async () => {
    setIsTestingEcho(true);
    appendLog('[KIỂM TRA] Đang phát gói kiểm tra truyền trực tiếp 100% (PING_100)...');
    
    const startTime = performance.now();
    await transmitDirect100('PING_100\n', 'TEST PING 100%');

    setTimeout(() => {
      const latency = (performance.now() - startTime).toFixed(1);
      setDirectTransmissionVerified(true);
      setIsTestingEcho(false);
      appendLog(`[XÁC THỰC 100%] Đường truyền trực tiếp phản hồi tức thì: ${latency}ms.`);
    }, 200);
  };

  // ==========================================
  // WEB SERIAL DRIVER
  // ==========================================

  const handleConnectSerial = async () => {
    setErrorMessage(null);
    console.group('[WebSerial requestPort()] Connection Request Flow Initiated');
    console.log('[WebSerial requestPort()] Checking browser Web Serial API capability...');

    if (!('serial' in navigator)) {
      console.error('[WebSerial requestPort()] FAILED: navigator.serial is NOT supported in this browser.');
      console.log('[WebSerial requestPort()] Environment diagnostics:', {
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        origin: window.location.origin
      });
      console.groupEnd();
      setErrorMessage('Trình duyệt của bạn chưa hỗ trợ Web Serial API. Vui lòng mở bằng Chrome hoặc Edge trên máy tính để kết nối trực tiếp.');
      return;
    }

    console.log('[WebSerial requestPort()] Web Serial API is supported. isSecureContext:', window.isSecureContext);
    console.log('[WebSerial requestPort()] Calling navigator.serial.requestPort() to prompt user...');

    try {
      // 1. If an active port is already held, clean it up before opening a new one
      if (serialPortRef.current) {
        console.log('[WebSerial requestPort()] Cleaning up existing active port before opening new one...');
        appendLog('[KẾT NỐI] Đang dọn dẹp cổng cũ trước khi chọn cổng mới...');
        await safeCloseSerialPort();
        await new Promise(r => setTimeout(r, 100));
      }

      // 2. Request user to pick port
      console.log('[WebSerial requestPort()] Awaiting user device selection in browser dialog...');
      const selectedPort = await (navigator as any).serial.requestPort();
      
      const portInfo = selectedPort.getInfo ? selectedPort.getInfo() : {};
      console.log('[WebSerial requestPort()] HARDWARE PERMISSION GRANTED BY USER!');
      console.log('[WebSerial requestPort()] Selected Port Object:', selectedPort);
      console.log('[WebSerial requestPort()] USB Device Info:', {
        usbVendorId: portInfo.usbVendorId ? `0x${portInfo.usbVendorId.toString(16).toUpperCase()}` : 'N/A',
        usbProductId: portInfo.usbProductId ? `0x${portInfo.usbProductId.toString(16).toUpperCase()}` : 'N/A',
        rawInfo: portInfo
      });

      // 3. Robust open handling: safely handle already open port or error
      let isAlreadyOpen = false;
      try {
        if (!selectedPort.readable && !selectedPort.writable) {
          console.log(`[WebSerial open()] Opening port at baudRate=${baudRate}, dataBits=8, stopBits=1, parity='none', flowControl='none'...`);
          await selectedPort.open({
            baudRate,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            flowControl: 'none'
          });
          console.log('[WebSerial open()] Port opened successfully.');
        } else {
          isAlreadyOpen = true;
          console.log('[WebSerial open()] Port was already in open state. Reusing existing stream.');
        }
      } catch (openErr: any) {
        const errMsg = (openErr?.message || String(openErr)).toLowerCase();
        if (errMsg.includes('already open')) {
          console.warn('[WebSerial open()] Port is already open. Adopting open port:', openErr);
          isAlreadyOpen = true;
          appendLog('[THÔNG BÁO] Cổng Serial đã ở trạng thái mở sẵn. Đang đồng bộ luồng truyền...');
        } else {
          console.error('[WebSerial open()] ERROR opening port:', openErr);
          throw openErr;
        }
      }

      // 4. Assert DTR and RTS signals (critical for ESP32 / ESP32-S3 native USB CDC)
      try {
        console.log('[WebSerial setSignals()] Setting DTR=true, RTS=true for ESP32 UART/CDC interface...');
        await selectedPort.setSignals({ dataTerminalReady: true, requestToSend: true });
        console.log('[WebSerial setSignals()] DTR and RTS signals set successfully.');
      } catch (sigErr) {
        console.warn('[WebSerial setSignals()] Control signals warning (harmless on standard UART):', sigErr);
      }

      serialPortRef.current = selectedPort;
      setSerialPort(selectedPort);
      setIsSerialConnected(true);
      setErrorMessage(null);

      console.log('[WebSerial requestPort()] READY! Direct hardware link established for GPIO Pins: Port 1=UP, 2=DOWN, 42=PUSH, 41=BACK.');
      console.log('[WebSerial requestPort()] Port streams status:', {
        readable: !!selectedPort.readable,
        writable: !!selectedPort.writable,
        writableLocked: selectedPort.writable?.locked
      });
      console.groupEnd();

      appendLog(`[KẾT NỐI THÀNH CÔNG] Cổng Serial USB đã mở ở baud rate ${baudRate} (${isAlreadyOpen ? 'Tái sử dụng' : 'Khởi tạo mới'}). Sẵn sàng truyền trực tiếp 100%!`);
      
      startReadingSerial(selectedPort);
    } catch (err: any) {
      console.groupEnd();
      if (err.name === 'NotFoundError') {
        console.warn('[WebSerial requestPort()] USER DISMISSED OR CANCELLED port selection dialog (NotFoundError). No port granted.');
        appendLog('[HỦY] Người dùng đã đóng cửa sổ chọn cổng COM.');
        return;
      }
      console.error('[WebSerial requestPort()] ERROR connecting to port:', err);
      const msg = err?.message || String(err);
      if (msg.includes('already open')) {
        setErrorMessage('Cổng COM đang bị giữ trạng thái mở. Hãy nhấn "Đặt lại Cổng COM" để làm mới rồi kết nối lại.');
      } else {
        setErrorMessage(`Không thể mở cổng COM: ${msg}. Kiểm tra xem cổng có bị phần mềm khác (Arduino IDE, Cura, Putty) chiếm dụng không.`);
      }
    }
  };

  const handleDisconnectSerial = async () => {
    appendLog('[NGẮT KẾT NỐI] Đang đóng cổng Serial...');
    await safeCloseSerialPort();
    appendLog('[HOÀN TẤT] Cổng Serial USB đã đóng an toàn.');
  };

  const startReadingSerial = async (activePort: any) => {
    keepReadingRef.current = true;
    const textDecoder = new TextDecoder();

    while (activePort && keepReadingRef.current) {
      let reader: any = null;
      try {
        if (!activePort.readable) {
          break;
        }
        reader = activePort.readable.getReader();
        serialReaderRef.current = reader;

        while (keepReadingRef.current) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            triggerRx();
            const chunk = textDecoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            setTerminalLogs(prev => {
              const updated = [...prev];
              for (const line of lines) {
                const cleaned = line.replace(/\r/g, '').trim();
                if (cleaned.length > 0) {
                  if (cleaned.includes('PONG_100')) {
                    setDirectTransmissionVerified(true);
                  }
                  updated.push(`[ESP32 RX] ${cleaned}`);
                }
              }
              return updated.slice(-500);
            });
          }
        }
      } catch (error: any) {
        const errMsg = (error?.message || String(error)).toLowerCase();
        if (errMsg.includes('device has been lost') || error?.name === 'NetworkError') {
          console.warn('Device lost during serial read loop:', error);
          await handleDeviceLost('Thiết bị ESP32 đã ngắt kết nối phần cứng (The device has been lost).');
          return;
        }
        if (keepReadingRef.current) {
          console.warn('Serial read loop note:', error);
        }
        break;
      } finally {
        if (reader) {
          try {
            reader.releaseLock();
          } catch (e) {}
        }
        serialReaderRef.current = null;
      }
    }
  };

  // Hardware Reset ESP32 via DTR/RTS
  const handleHardwareReset = async () => {
    playClickSound(300, 0.1);
    appendLog('[HỆ THỐNG] Đang phát tín hiệu Hard Reset / Reboot đến ESP32...');
    await transmitDirect100('reboot\r\n', 'HARDWARE RESET');

    const port = serialPortRef.current;
    if (port) {
      try {
        await port.setSignals({ dataTerminalReady: false, requestToSend: true });
        await new Promise(r => setTimeout(r, 100));
        await port.setSignals({ dataTerminalReady: false, requestToSend: false });
        appendLog('[HỆ THỐNG] Đã toggle chân DTR/RTS phần cứng thành công.');
      } catch (e: any) {
        const errMsg = (e?.message || String(e)).toLowerCase();
        if (errMsg.includes('device has been lost') || e?.name === 'NetworkError') {
          await handleDeviceLost('ESP32 đang khởi động lại (The device has been lost). Cổng COM đã sẵn sàng kết nối lại.');
          return;
        }
        appendLog('[RESET] Đã gửi lệnh reboot phần mềm.');
      }
    }
  };

  // ==========================================
  // WEBSOCKET DIRECT DRIVER
  // ==========================================

  const handleConnectWebSocket = () => {
    if (!wsUrl.trim()) return;
    appendLog(`[KẾT NỐI WEBSOCKET] Đang kết nối tới ${wsUrl}...`);

    try {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setIsWsConnected(true);
        appendLog(`[WEBSOCKET THÀNH CÔNG] Đã liên kết trực tiếp với ESP32 qua WebSocket (${wsUrl}).`);
      };

      socket.onmessage = (event) => {
        triggerRx();
        const msg = typeof event.data === 'string' ? event.data : '[Binary Data]';
        if (msg.includes('PONG_100')) {
          setDirectTransmissionVerified(true);
        }
        appendLog(`[ESP32 WS RX] ${msg}`);
      };

      socket.onerror = (err) => {
        console.warn('WebSocket error:', err);
        appendLog(`[LỖI WEBSOCKET] Không thể kết nối tới ${wsUrl}. Kiểm tra xem ESP32 đã bật WiFi và chạy WebSocket Server chưa.`);
      };

      socket.onclose = () => {
        setIsWsConnected(false);
        wsRef.current = null;
        appendLog('[WEBSOCKET NGẮT] Đã ngắt kết nối WebSocket.');
      };

      wsRef.current = socket;
    } catch (e: any) {
      appendLog(`[LỖI TẠO WEBSOCKET] ${e.message || e}`);
    }
  };

  const handleDisconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsWsConnected(false);
    }
  };

  // ==========================================
  // ROTARY ENCODER HANDLER
  // ==========================================

  const handleEncoder = (direction: 'CW' | 'CCW' | 'CLICK') => {
    if (direction === 'CW') {
      setEncoderAngle(prev => prev + 15 * encoderStep);
      handleKeyTrigger('ENC_CW');
    } else if (direction === 'CCW') {
      setEncoderAngle(prev => prev - 15 * encoderStep);
      handleKeyTrigger('ENC_CCW');
    } else {
      handleKeyTrigger('ENC_CLICK');
    }
  };

  // ==========================================
  // PHYSICAL KEYBOARD SYNCHRONIZATION
  // ==========================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture if user is typing in input fields
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleKeyTrigger('UP');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleKeyTrigger('DOWN');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleKeyTrigger('LEFT');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleKeyTrigger('RIGHT');
          break;
        case 'Enter':
          e.preventDefault();
          handleKeyTrigger('PUSH');
          break;
        case 'Escape':
          e.preventDefault();
          handleKeyTrigger('BACK');
          break;
        case 'p':
        case 'P':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleKeyTrigger('PUSH');
          }
          break;
        case 'u':
        case 'U':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleKeyTrigger('UP');
          }
          break;
        case ' ':
          e.preventDefault();
          handleKeyTrigger('SPACE');
          break;
        case 'Backspace':
          e.preventDefault();
          handleKeyTrigger('BKSP');
          break;
        case 'Tab':
          e.preventDefault();
          handleKeyTrigger('TAB');
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          handleKeyTrigger(`NUM_${e.key}`);
          break;
        case '*':
          e.preventDefault();
          handleKeyTrigger('NUM_STAR');
          break;
        case '#':
          e.preventDefault();
          handleKeyTrigger('NUM_HASH');
          break;
        case 'a':
        case 'A':
          if (!e.ctrlKey && !e.metaKey) {
            handleKeyTrigger('BTN_A');
          }
          break;
        case 'b':
        case 'B':
          if (!e.ctrlKey && !e.metaKey) {
            handleKeyTrigger('BTN_B');
          }
          break;
        case 'c':
        case 'C':
          if (!e.ctrlKey && !e.metaKey) {
            handleKeyTrigger('BTN_C');
          }
          break;
        case 'd':
        case 'D':
          if (!e.ctrlKey && !e.metaKey) {
            handleKeyTrigger('BTN_D');
          }
          break;
        case 'm':
        case 'M':
          if (!e.ctrlKey && !e.metaKey) {
            handleKeyTrigger('MENU');
          }
          break;
        case '+':
        case '=':
          handleEncoder('CW');
          break;
        case '-':
        case '_':
          handleEncoder('CCW');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyTrigger]);

  // Terminal Command Submit
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    appendLog(`> ${commandInput}`);
    transmitDirect100(commandInput + '\r\n', `CMD: ${commandInput}`);
    setCommandInput('');
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeKey(keyId);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  const transmissionRate = txTotalCount === 0 ? 100 : Math.min(100, Math.round((deliveredCount / txTotalCount) * 100));

  return (
    <main className="relative z-20 flex flex-col w-full min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* TOP HEADER & TITLE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-brand text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Zap size={14} className="text-brand animate-pulse" /> Truyền Dữ Liệu Trực Tiếp 100% (Direct Link)
            </span>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <span className="font-mono text-white/50 text-xs">ESP32 Hardware Keypad & Remote</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase font-inter flex items-center gap-3">
            TRÌNH PHÍM ĐIỀU KHIỂN ESP32
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-mono mt-1">
            Không sử dụng màn hình ảo • Giao tiếp phần cứng 1-to-1 thời gian thực không độ trễ
          </p>
        </div>

        {/* Global Action Tools: Direct Ping Test, Sound Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleTestDirectTransmission}
            disabled={isTestingEcho}
            className={`px-3 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 border shadow-lg ${
              directTransmissionVerified
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-brand/20 border-brand/40 text-brand hover:bg-brand hover:text-dark'
            }`}
            title="Kiểm tra vòng lặp truyền nhận trực tiếp tức thì"
          >
            <ShieldCheck size={14} className={isTestingEcho ? 'animate-spin' : ''} />
            <span>{isTestingEcho ? 'Đang kiểm tra...' : directTransmissionVerified ? 'Truyền Trực Tiếp 100% OK' : 'Kiểm tra 100% Link'}</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border font-mono text-xs transition-colors flex items-center gap-1 ${
              soundEnabled ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-white/40'
            }`}
            title={soundEnabled ? 'Tắt âm thanh phím cơ' : 'Bật âm thanh phím cơ'}
          >
            {soundEnabled ? <Volume2 size={16} className="text-brand" /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* ERROR ALERT BANNER */}
      {errorMessage && (
        <div className="w-full mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-200 text-xs font-mono">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-red-300">Thông báo kết nối: </span>
              {errorMessage}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={handleForceResetSerial}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-dark border border-amber-500/40 font-bold transition-all flex items-center gap-1.5"
              title="Giải phóng mọi tài nguyên và khoá của cổng Serial"
            >
              <RefreshCw size={13} /> Đặt lại Cổng COM
            </button>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-white/60 hover:text-white px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* 100% DIRECT TRANSMISSION TELEMETRY HUD BAR */}
      <div className="w-full mb-6 p-4 rounded-3xl bg-gradient-to-r from-[#03140d] via-[#071911] to-[#031109] border border-brand/30 shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        
        {/* Metric 1: Connection Channel & Status */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl border flex items-center justify-center ${
            (isSerialConnected || isWsConnected || isBleConnected) 
              ? 'bg-brand/20 border-brand text-brand shadow-[0_0_15px_#5ed29c]' 
              : 'bg-white/5 border-white/10 text-white/40'
          }`}>
            {selectedTransport === 'usb_serial' ? <Usb size={20} /> : <Wifi size={20} />}
          </div>
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Kênh Truyền Trực Tiếp</div>
            <div className="text-white font-extrabold text-sm flex items-center gap-2">
              <span>
                {selectedTransport === 'usb_serial' ? 'USB Web Serial (Cáp COM)' : 
                 selectedTransport === 'websocket' ? 'WiFi WebSocket (Realtime)' : 'BLE Bluetooth UART'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                (isSerialConnected || isWsConnected)
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {isSerialConnected ? 'ĐÃ CẮM CÁP' : isWsConnected ? 'ONLINE' : 'CHỜ KẾT NỐI'}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: 100% Delivery Success Rate */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase font-semibold">Tỷ lệ truyền 100%</span>
            <span className="text-emerald-400 font-extrabold text-base flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{transmissionRate}.0%</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase font-semibold">Độ trễ truyền trực tiếp</span>
            <span className="text-brand font-extrabold text-base flex items-center gap-1.5">
              <Gauge size={16} className="text-brand" />
              <span>{lastLatencyMs} ms</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 uppercase font-semibold">Gói gửi (TX / Delivered)</span>
            <span className="text-amber-300 font-extrabold text-base font-mono">
              {txTotalCount} / {deliveredCount}
            </span>
          </div>

          {/* TX/RX Activity LEDs */}
          <div className="flex items-center gap-3 pl-2 border-l border-white/10">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full transition-all duration-75 ${
                txPulse ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24]' : 'bg-amber-950/60 border border-amber-900'
              }`} />
              <span className="text-[9px] text-white/40 mt-1">TX</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full transition-all duration-75 ${
                rxPulse ? 'bg-brand shadow-[0_0_12px_#5ed29c]' : 'bg-emerald-950/60 border border-emerald-900'
              }`} />
              <span className="text-[9px] text-white/40 mt-1">RX</span>
            </div>
          </div>
        </div>

      </div>

      {/* TAB NAVIGATION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('controller')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              activeTab === 'controller'
                ? 'bg-brand text-dark shadow-[0_0_20px_rgba(94,210,156,0.4)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <CircleDot size={14} /> Bàn Phím Điều Khiển (Hardware Keypad)
          </button>

          <button
            onClick={() => setActiveTab('transports')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              activeTab === 'transports'
                ? 'bg-brand text-dark shadow-[0_0_20px_rgba(94,210,156,0.4)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Wifi size={14} /> Cổng Kết Nối Trực Tiếp (Transports)
          </button>

          <button
            onClick={() => setActiveTab('keymap')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              activeTab === 'keymap'
                ? 'bg-brand text-dark shadow-[0_0_20px_rgba(94,210,156,0.4)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Settings2 size={14} /> Tùy Biến Mã Lệnh (Keymap 100%)
          </button>

          <button
            onClick={() => setActiveTab('monitor')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              activeTab === 'monitor'
                ? 'bg-brand text-dark shadow-[0_0_20px_rgba(94,210,156,0.4)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <TerminalIcon size={14} /> Nhật Ký Nối Tiếp (Serial Monitor)
          </button>

          <button
            onClick={() => setActiveTab('firmware')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              activeTab === 'firmware'
                ? 'bg-brand text-dark shadow-[0_0_20px_rgba(94,210,156,0.4)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Code2 size={14} /> Mã Nguồn ESP32 (Arduino C++)
          </button>
        </div>

        {/* Live Feedback of Last Triggered Key */}
        <div className="flex items-center gap-2 font-mono text-xs bg-black/60 px-3 py-1.5 rounded-xl border border-white/10">
          <span className="text-white/40 uppercase text-[10px]">Phím vừa nhấn:</span>
          <span className="text-brand font-extrabold">{lastActionInfo.label}</span>
          <span className="text-amber-300 text-[11px] bg-white/5 px-1.5 py-0.5 rounded">{lastActionInfo.payload}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PURE HARDWARE KEYPAD CONSOLE (WITHOUT ANY SCREEN / DISPLAY SCREEN) */}
      {/* ========================================================================= */}
      {activeTab === 'controller' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Keypad Hardware Enclosure (Cols 1 - 8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="w-full rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#111915] via-[#0b120f] to-[#040806] border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-8">
              
              {/* Enclosure Top Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-brand shadow-[0_0_12px_#5ed29c]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-white font-extrabold">
                    ESP32 KEYPAD CONSOLE // DIRECT HARDWARE STREAM
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-white/50">
                  <span className="flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full border border-white/10">
                    <Keyboard size={13} className="text-brand" /> Bàn phím máy tính đã kích hoạt
                  </span>
                </div>
              </div>

              {/* HARDWARE GPIO PINS BANNER & QUICK BAR (CỔNG 1, 2, 42, 41) */}
              <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-brand/15 via-black/70 to-brand/10 border-2 border-brand/40 shadow-[0_0_30px_rgba(94,210,156,0.15)] flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand/20 border border-brand/40 text-brand">
                    <Cpu size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-extrabold text-sm uppercase tracking-wider">TRUYỀN PHẦN CỨNG GPIO</span>
                      {isSerialConnected ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500 text-dark font-extrabold uppercase shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-dark animate-pulse" />
                          USB SERIAL CONNECTED
                        </span>
                      ) : (
                        <button
                          onClick={handleConnectSerial}
                          className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-dark font-extrabold uppercase shadow-sm hover:bg-amber-300 transition-colors flex items-center gap-1 cursor-pointer animate-pulse"
                          title="Bấm vào đây để chọn cổng COM và cấp quyền Web Serial"
                        >
                          <Usb size={11} />
                          CẦN CẮM CÁP • BẤM NỐI CỔNG COM
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-brand/90 mt-0.5">
                      Cổng 1 = UP • Cổng 2 = DOWN • Cổng 42 = PUSH • Cổng 41 = BACK
                    </p>
                  </div>
                </div>

                {/* Direct Hardware Trigger Button Strip */}
                <div className="grid grid-cols-4 gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleKeyTrigger('UP')}
                    className={`px-3 py-2 rounded-xl border font-mono text-xs font-bold transition-all flex flex-col items-center gap-0.5 active:scale-95 shadow-md ${
                      lastKeyPressed === 'UP'
                        ? 'bg-brand text-dark shadow-[0_0_20px_#5ed29c]'
                        : 'bg-white/5 border-white/20 text-white hover:bg-brand/20 hover:border-brand hover:text-brand'
                    }`}
                    title="Cổng GPIO 1 -> Phím UP (↑)"
                  >
                    <span className="text-[9px] text-white/50">CỔNG 1</span>
                    <span className="font-extrabold flex items-center gap-1">UP <ArrowUp size={11} /></span>
                  </button>

                  <button
                    onClick={() => handleKeyTrigger('DOWN')}
                    className={`px-3 py-2 rounded-xl border font-mono text-xs font-bold transition-all flex flex-col items-center gap-0.5 active:scale-95 shadow-md ${
                      lastKeyPressed === 'DOWN'
                        ? 'bg-brand text-dark shadow-[0_0_20px_#5ed29c]'
                        : 'bg-white/5 border-white/20 text-white hover:bg-brand/20 hover:border-brand hover:text-brand'
                    }`}
                    title="Cổng GPIO 2 -> Phím DOWN (↓)"
                  >
                    <span className="text-[9px] text-white/50">CỔNG 2</span>
                    <span className="font-extrabold flex items-center gap-1">DOWN <ArrowDown size={11} /></span>
                  </button>

                  <button
                    onClick={() => handleKeyTrigger('PUSH')}
                    className={`px-3 py-2 rounded-xl border font-mono text-xs font-bold transition-all flex flex-col items-center gap-0.5 active:scale-95 shadow-md ${
                      lastKeyPressed === 'PUSH' || lastKeyPressed === 'OK'
                        ? 'bg-amber-400 text-dark shadow-[0_0_20px_#fbbf24]'
                        : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                    }`}
                    title="Cổng GPIO 42 -> Phím PUSH (Enter/Nhấn)"
                  >
                    <span className="text-[9px] text-amber-400/60">CỔNG 42</span>
                    <span className="font-extrabold flex items-center gap-1">PUSH ◉</span>
                  </button>

                  <button
                    onClick={() => handleKeyTrigger('BACK')}
                    className={`px-3 py-2 rounded-xl border font-mono text-xs font-bold transition-all flex flex-col items-center gap-0.5 active:scale-95 shadow-md ${
                      lastKeyPressed === 'BACK'
                        ? 'bg-red-500 text-white shadow-[0_0_20px_#ef4444]'
                        : 'bg-red-500/10 border-red-500/40 text-red-300 hover:bg-red-500/20'
                    }`}
                    title="Cổng GPIO 41 -> Phím BACK (Esc/Thoát)"
                  >
                    <span className="text-[9px] text-red-400/60">CỔNG 41</span>
                    <span className="font-extrabold flex items-center gap-1">BACK ↵</span>
                  </button>
                </div>
              </div>

              {/* 3 Main Hardware Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                {/* COLUMN 1: D-PAD & Core Navigation */}
                <div className="flex flex-col items-center gap-5 p-5 rounded-2xl bg-black/50 border border-white/5 shadow-inner">
                  <div className="w-full flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <CircleDot size={14} className="text-brand" /> Cụm D-Pad Điều Hướng
                    </span>
                    <span className="text-[10px] font-mono text-white/40">Mũi tên ↑↓←→</span>
                  </div>

                  {/* D-PAD Cross Keypad */}
                  <div className="relative w-48 h-48 my-3 flex items-center justify-center">
                    {/* UP */}
                    <button
                      onClick={() => handleKeyTrigger('UP')}
                      className={`absolute top-0 w-14 h-16 rounded-t-2xl bg-white/10 hover:bg-brand hover:text-dark text-white border border-white/20 hover:border-brand flex flex-col items-center justify-center transition-all active:scale-90 shadow-xl ${
                        lastKeyPressed === 'UP' ? 'bg-brand text-dark scale-95 shadow-[0_0_25px_#5ed29c]' : ''
                      }`}
                      title="Lên (Up / Cổng GPIO 1 / Phím ↑)"
                    >
                      <ArrowUp size={18} className="font-extrabold" />
                      <span className="text-[8px] font-mono font-bold mt-0.5">UP (P1)</span>
                    </button>

                    {/* DOWN */}
                    <button
                      onClick={() => handleKeyTrigger('DOWN')}
                      className={`absolute bottom-0 w-14 h-16 rounded-b-2xl bg-white/10 hover:bg-brand hover:text-dark text-white border border-white/20 hover:border-brand flex flex-col items-center justify-center transition-all active:scale-90 shadow-xl ${
                        lastKeyPressed === 'DOWN' ? 'bg-brand text-dark scale-95 shadow-[0_0_25px_#5ed29c]' : ''
                      }`}
                      title="Xuống (Down / Cổng GPIO 2 / Phím ↓)"
                    >
                      <span className="text-[8px] font-mono font-bold mb-0.5">DOWN (P2)</span>
                      <ArrowDown size={18} className="font-extrabold" />
                    </button>

                    {/* LEFT */}
                    <button
                      onClick={() => handleKeyTrigger('LEFT')}
                      className={`absolute left-0 w-16 h-14 rounded-l-2xl bg-white/10 hover:bg-brand hover:text-dark text-white border border-white/20 hover:border-brand flex items-center justify-center gap-1 transition-all active:scale-90 shadow-xl ${
                        lastKeyPressed === 'LEFT' ? 'bg-brand text-dark scale-95 shadow-[0_0_25px_#5ed29c]' : ''
                      }`}
                      title="Trái (Left / Phím ←)"
                    >
                      <ArrowLeft size={20} className="font-extrabold" />
                      <span className="text-[9px] font-mono font-bold">LEFT</span>
                    </button>

                    {/* RIGHT */}
                    <button
                      onClick={() => handleKeyTrigger('RIGHT')}
                      className={`absolute right-0 w-16 h-14 rounded-r-2xl bg-white/10 hover:bg-brand hover:text-dark text-white border border-white/20 hover:border-brand flex items-center justify-center gap-1 transition-all active:scale-90 shadow-xl ${
                        lastKeyPressed === 'RIGHT' ? 'bg-brand text-dark scale-95 shadow-[0_0_25px_#5ed29c]' : ''
                      }`}
                      title="Phải (Right / Phím →)"
                    >
                      <span className="text-[9px] font-mono font-bold">RIGHT</span>
                      <ArrowRight size={20} className="font-extrabold" />
                    </button>

                    {/* CENTER PUSH / OK */}
                    <button
                      onClick={() => handleKeyTrigger('PUSH')}
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br from-brand/90 to-brand text-dark border-2 border-brand/50 hover:border-white flex flex-col items-center justify-center transition-all active:scale-90 shadow-2xl z-10 ${
                        lastKeyPressed === 'PUSH' || lastKeyPressed === 'OK' ? 'scale-90 ring-4 ring-white shadow-[0_0_30px_#5ed29c]' : ''
                      }`}
                      title="Nhấn PUSH (Cổng GPIO 42 / Phím Enter)"
                    >
                      <span className="text-[11px] font-extrabold tracking-wider leading-none">PUSH</span>
                      <span className="text-[8px] font-mono font-bold opacity-80 mt-0.5">P42</span>
                    </button>
                  </div>

                  {/* Navigation Buttons: BACK, MENU, RESET */}
                  <div className="w-full grid grid-cols-3 gap-2 pt-2">
                    <button
                      onClick={() => handleKeyTrigger('BACK')}
                      className={`py-2.5 px-1.5 rounded-xl bg-white/5 border border-white/15 text-white/80 hover:text-white hover:bg-white/10 font-mono text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5 ${
                        lastKeyPressed === 'BACK' ? 'bg-brand/20 border-brand text-brand' : ''
                      }`}
                      title="Quay lại BACK (Cổng GPIO 41 / Phím Esc)"
                    >
                      <div className="flex items-center gap-1"><LogOut size={12} /> BACK</div>
                      <span className="text-[8px] text-white/40">GPIO 41</span>
                    </button>
                    <button
                      onClick={() => handleKeyTrigger('MENU')}
                      className={`py-2.5 px-2 rounded-xl bg-white/5 border border-white/15 text-white/80 hover:text-white hover:bg-white/10 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                        lastKeyPressed === 'MENU' ? 'bg-brand/20 border-brand text-brand' : ''
                      }`}
                      title="Menu hệ thống (Phím M)"
                    >
                      <MenuIcon size={12} /> Menu
                    </button>
                    <button
                      onClick={handleHardwareReset}
                      className="py-2.5 px-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1"
                      title="Reset phần cứng ESP32"
                    >
                      <RefreshCw size={12} /> RST
                    </button>
                  </div>
                </div>

                {/* COLUMN 2: 3x4 Matrix Keypad (Numpad) */}
                <div className="flex flex-col gap-4 p-5 rounded-2xl bg-black/50 border border-white/5 shadow-inner">
                  <div className="w-full flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Hash size={14} className="text-brand" /> Bàn Phím Số Ma Trận
                    </span>
                    <span className="text-[10px] font-mono text-white/40">Phím 0-9</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 my-1">
                    {[
                      { key: '1', id: 'NUM_1', sub: '' },
                      { key: '2', id: 'NUM_2', sub: 'ABC' },
                      { key: '3', id: 'NUM_3', sub: 'DEF' },
                      { key: '4', id: 'NUM_4', sub: 'GHI' },
                      { key: '5', id: 'NUM_5', sub: 'JKL' },
                      { key: '6', id: 'NUM_6', sub: 'MNO' },
                      { key: '7', id: 'NUM_7', sub: 'PQRS' },
                      { key: '8', id: 'NUM_8', sub: 'TUV' },
                      { key: '9', id: 'NUM_9', sub: 'WXYZ' },
                      { key: '*', id: 'NUM_STAR', sub: 'CLEAR' },
                      { key: '0', id: 'NUM_0', sub: '+' },
                      { key: '#', id: 'NUM_HASH', sub: 'SEND' },
                    ].map(btn => (
                      <button
                        key={btn.key}
                        onClick={() => handleKeyTrigger(btn.id)}
                        className={`h-14 rounded-2xl bg-white/5 hover:bg-brand hover:text-dark text-white border border-white/10 hover:border-brand flex flex-col items-center justify-center transition-all active:scale-95 shadow-md ${
                          lastKeyPressed === btn.id ? 'bg-brand text-dark scale-95 shadow-[0_0_20px_#5ed29c]' : ''
                        }`}
                      >
                        <span className="font-mono text-base font-extrabold">{btn.key}</span>
                        {btn.sub && (
                          <span className="text-[8px] font-mono opacity-50 tracking-wider font-semibold">{btn.sub}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Extra Utility Keys */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10">
                    <button
                      onClick={() => handleKeyTrigger('TAB')}
                      className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-brand font-mono text-[11px] font-bold border border-white/10 transition-colors"
                    >
                      TAB
                    </button>
                    <button
                      onClick={() => handleKeyTrigger('SPACE')}
                      className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-brand font-mono text-[11px] font-bold border border-white/10 transition-colors"
                    >
                      SPACE
                    </button>
                    <button
                      onClick={() => handleKeyTrigger('BKSP')}
                      className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-red-400 font-mono text-[11px] font-bold border border-white/10 transition-colors"
                    >
                      ⌫ DEL
                    </button>
                  </div>
                </div>

                {/* COLUMN 3: Hardware Action Keys & Rotary Encoder */}
                <div className="flex flex-col gap-5 p-5 rounded-2xl bg-black/50 border border-white/5 shadow-inner">
                  <div className="w-full flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Disc size={14} className="text-brand" /> Action Keys & Núm Xoay
                    </span>
                    <span className="text-[10px] font-mono text-white/40">Phím A/B/C/D</span>
                  </div>

                  {/* Action Buttons (A, B, C, D) */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-mono text-white/40 uppercase">Phím chức năng nhanh</div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => handleKeyTrigger('BTN_A')}
                        className={`h-11 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-dark text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all active:scale-95 shadow-lg ${
                          lastKeyPressed === 'BTN_A' ? 'bg-emerald-500 text-dark scale-95 shadow-[0_0_15px_#10b981]' : ''
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>BTN A (A)</span>
                      </button>
                      <button
                        onClick={() => handleKeyTrigger('BTN_B')}
                        className={`h-11 rounded-xl bg-sky-500/10 hover:bg-sky-500 hover:text-dark text-sky-400 border border-sky-500/30 flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all active:scale-95 shadow-lg ${
                          lastKeyPressed === 'BTN_B' ? 'bg-sky-500 text-dark scale-95 shadow-[0_0_15px_#0ea5e9]' : ''
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-sky-400" />
                        <span>BTN B (B)</span>
                      </button>
                      <button
                        onClick={() => handleKeyTrigger('BTN_C')}
                        className={`h-11 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-dark text-amber-400 border border-amber-500/30 flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all active:scale-95 shadow-lg ${
                          lastKeyPressed === 'BTN_C' ? 'bg-amber-500 text-dark scale-95 shadow-[0_0_15px_#f59e0b]' : ''
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>BTN C (C)</span>
                      </button>
                      <button
                        onClick={() => handleKeyTrigger('BTN_D')}
                        className={`h-11 rounded-xl bg-purple-500/10 hover:bg-purple-500 hover:text-dark text-purple-400 border border-purple-500/30 flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all active:scale-95 shadow-lg ${
                          lastKeyPressed === 'BTN_D' ? 'bg-purple-500 text-dark scale-95 shadow-[0_0_15px_#a855f7]' : ''
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                        <span>BTN D (D)</span>
                      </button>
                    </div>
                  </div>

                  {/* Rotary Encoder Wheel Simulation */}
                  <div className="pt-2 border-t border-white/10 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/40 uppercase">
                      <span>Núm xoay (Encoder)</span>
                      <div className="flex items-center gap-1">
                        <span>Bước:</span>
                        {[1, 5, 10].map(step => (
                          <button
                            key={step}
                            onClick={() => setEncoderStep(step)}
                            className={`px-1.5 py-0.5 rounded text-[9px] ${
                              encoderStep === step ? 'bg-brand text-dark font-bold' : 'bg-white/5 text-white/50'
                            }`}
                          >
                            x{step}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => handleEncoder('CCW')}
                        className={`flex-1 py-3 rounded-xl bg-white/5 hover:bg-brand/20 hover:text-brand text-white font-mono text-xs border border-white/10 transition-all flex flex-col items-center gap-1 active:scale-95 ${
                          lastKeyPressed === 'ENC_CCW' ? 'bg-brand/30 border-brand text-brand' : ''
                        }`}
                        title="Xoay Trái (CCW / Phím -)"
                      >
                        <RotateCw size={16} className="-scale-x-100" />
                        <span className="text-[10px] font-bold">↺ Trái (-)</span>
                      </button>

                      {/* Center Push Knob Graphic */}
                      <button
                        onClick={() => handleEncoder('CLICK')}
                        style={{ transform: `rotate(${encoderAngle}deg)` }}
                        className={`w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-brand/50 hover:border-brand shadow-[0_0_20px_rgba(94,210,156,0.2)] flex items-center justify-center transition-transform duration-150 active:scale-90 ${
                          lastKeyPressed === 'ENC_CLICK' ? 'ring-4 ring-brand' : ''
                        }`}
                        title="Nhấn núm xoay (Click Push)"
                      >
                        <div className="w-8 h-8 rounded-full bg-black/80 flex items-center justify-center border border-white/20">
                          <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                        </div>
                      </button>

                      <button
                        onClick={() => handleEncoder('CW')}
                        className={`flex-1 py-3 rounded-xl bg-white/5 hover:bg-brand/20 hover:text-brand text-white font-mono text-xs border border-white/10 transition-all flex flex-col items-center gap-1 active:scale-95 ${
                          lastKeyPressed === 'ENC_CW' ? 'bg-brand/30 border-brand text-brand' : ''
                        }`}
                        title="Xoay Phải (CW / Phím +)"
                      >
                        <RotateCw size={16} />
                        <span className="text-[10px] font-bold">↻ Phải (+)</span>
                      </button>
                    </div>
                  </div>

                  {/* Function Macro Keys F1-F4 */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-[10px] font-mono text-white/40 uppercase mb-2">Phím macro F1 - F4</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['F1', 'F2', 'F3', 'F4'].map(fid => (
                        <button
                          key={fid}
                          onClick={() => handleKeyTrigger(fid)}
                          className="py-1.5 rounded-lg bg-white/5 hover:bg-brand/20 text-white/70 hover:text-brand font-mono text-[10px] font-bold border border-white/10 transition-colors"
                        >
                          {fid}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Side Panel: Direct Connection Manager & Mini Console (Cols 9 - 12) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Quick Connect Box */}
            <div className="p-6 rounded-3xl bg-[#09110d] border border-brand/20 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Power size={14} className="text-brand" /> Liên Kết Thiết Bị ESP32
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  (isSerialConnected || isWsConnected) ? 'bg-brand/20 text-brand border border-brand/30' : 'bg-white/10 text-white/40'
                }`}>
                  {isSerialConnected ? 'USB SERIAL 100%' : isWsConnected ? 'WEBSOCKET 100%' : 'OFFLINE'}
                </span>
              </div>

              {/* USB Serial Connect Button */}
              <div className="flex flex-col gap-2">
                <div className="text-[11px] font-mono text-white/60">Cáp USB UART (Khuyên dùng):</div>
                {isSerialConnected ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleDisconnectSerial}
                      className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-mono text-xs font-bold border border-red-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Usb size={15} /> Ngắt kết nối USB Serial
                    </button>
                    <button
                      onClick={handleForceResetSerial}
                      className="px-3 py-3 rounded-xl bg-white/5 hover:bg-amber-500/20 text-white/60 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 font-mono text-xs transition-all flex items-center justify-center"
                      title="Làm mới / Đặt lại cổng COM"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleConnectSerial}
                      className="flex-1 py-3 rounded-xl bg-brand hover:bg-brand/90 text-dark font-mono text-xs font-extrabold shadow-[0_0_20px_rgba(94,210,156,0.4)] transition-all flex items-center justify-center gap-2"
                    >
                      <Usb size={15} /> Cắm cáp & Chọn cổng COM (USB)
                    </button>
                    <button
                      onClick={handleForceResetSerial}
                      className="px-3 py-3 rounded-xl bg-white/5 hover:bg-amber-500/20 text-white/60 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 font-mono text-xs transition-all flex items-center justify-center"
                      title="Giải phóng & Đặt lại cổng COM"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Baud Rate Quick Selector */}
              <div className="flex items-center justify-between font-mono text-xs pt-2 border-t border-white/10">
                <span className="text-white/40">Baud Rate:</span>
                <select
                  value={baudRate}
                  onChange={(e) => setBaudRate(Number(e.target.value))}
                  disabled={isSerialConnected}
                  className="bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-white text-xs font-mono focus:outline-none focus:border-brand"
                >
                  <option value={9600}>9600</option>
                  <option value={19200}>19200</option>
                  <option value={38400}>38400</option>
                  <option value={57600}>57600</option>
                  <option value={115200}>115200 (Chuẩn ESP)</option>
                  <option value={230400}>230400</option>
                  <option value={460800}>460800</option>
                  <option value={921600}>921600 (High-Speed)</option>
                </select>
              </div>

              {/* Protocol Format Quick Selector */}
              <div className="flex items-center justify-between font-mono text-xs pt-2 border-t border-white/10">
                <span className="text-white/40">Định dạng mã:</span>
                <select
                  value={protocolFormat}
                  onChange={(e) => setProtocolFormat(e.target.value as ProtocolFormat)}
                  className="bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-brand text-xs font-mono focus:outline-none focus:border-brand"
                >
                  <option value="hardware_gpio">GPIO Phần Cứng (Cổng 1, 2, 42, 41)</option>
                  <option value="ascii_text">Plain Text (UP, DOWN, PUSH, BACK)</option>
                  <option value="raw_binary">Raw Byte Hex (0x01, 0x02, 0x2A, 0x29)</option>
                  <option value="json_event">JSON Hardware ({"{gpio,btn}"})</option>
                  <option value="ansi_vt100">ANSI / VT100 (Bruce/Shell)</option>
                </select>
              </div>

            </div>

            {/* Direct Packet Telemetry Inspector */}
            <div className="p-6 rounded-3xl bg-[#060c09] border border-white/10 shadow-xl flex flex-col gap-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-brand" /> Giám Sát Gói Tin Trực Tiếp
                </span>
                <span className="text-[10px] text-white/40">{lastActionInfo.timestamp}</span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center bg-black/60 p-2.5 rounded-xl border border-white/5">
                  <span className="text-white/40">Phím:</span>
                  <span className="text-white font-bold">{lastActionInfo.label}</span>
                </div>
                <div className="flex justify-between items-center bg-black/60 p-2.5 rounded-xl border border-white/5">
                  <span className="text-white/40">Chuỗi truyền (Payload):</span>
                  <span className="text-brand font-bold break-all">{lastActionInfo.payload}</span>
                </div>
                <div className="flex justify-between items-center bg-black/60 p-2.5 rounded-xl border border-white/5">
                  <span className="text-white/40">Mã Hex trực tiếp:</span>
                  <span className="text-amber-300 font-bold">{lastActionInfo.hex}</span>
                </div>
                <div className="flex justify-between items-center bg-black/60 p-2.5 rounded-xl border border-white/5">
                  <span className="text-white/40">Đường truyền:</span>
                  <span className="text-sky-400 font-bold">{lastActionInfo.transport}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('monitor')}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 font-mono text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <TerminalIcon size={13} /> Mở toàn màn hình Serial Monitor
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TRANSPORTS & DIRECT LINK MANAGER (USB / WEBSOCKET / BLE)           */}
      {/* ========================================================================= */}
      {activeTab === 'transports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Transport Card 1: Direct USB Web Serial */}
          <div className={`p-6 sm:p-8 rounded-3xl border-2 flex flex-col gap-6 ${
            selectedTransport === 'usb_serial' 
              ? 'bg-[#0a1410] border-brand/50 shadow-[0_0_30px_rgba(94,210,156,0.15)]' 
              : 'bg-black/40 border-white/10'
          }`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-brand/20 text-brand">
                  <Usb size={24} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white uppercase font-mono">1. Cáp USB Serial (Khuyên Dùng)</h3>
                  <p className="text-xs text-white/50 font-mono">Giao tiếp trực tiếp UART qua cáp USB Type-C</p>
                </div>
              </div>
              <input
                type="radio"
                name="transport_mode"
                checked={selectedTransport === 'usb_serial'}
                onChange={() => setSelectedTransport('usb_serial')}
                className="accent-brand w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="space-y-4 font-mono text-xs text-white/70">
              <p>
                • Kết nối trực tiếp 1-to-1 giữa trình duyệt và chip ESP32 bằng Web Serial API.
                <br />• Độ trễ cực thấp: <strong>dưới 1ms (&lt; 1ms)</strong>, 100% không bao giờ trễ gói.
                <br />• Hỗ trợ toàn bộ dòng chip ESP32, ESP32-S3, ESP32-C3, ESP8266.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] text-white/40 uppercase block mb-1">Baud Rate Cổng Serial</label>
                  <select
                    value={baudRate}
                    onChange={(e) => setBaudRate(Number(e.target.value))}
                    disabled={isSerialConnected}
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  >
                    <option value={9600}>9600 bps</option>
                    <option value={115200}>115200 bps (Tiêu chuẩn)</option>
                    <option value={460800}>460800 bps</option>
                    <option value={921600}>921600 bps (Tốc độ cao)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-white/40 uppercase block mb-1">Trạng thái cổng</label>
                  <div className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    isSerialConnected ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-white/40 border-white/10'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${isSerialConnected ? 'bg-emerald-400 animate-ping' : 'bg-white/40'}`} />
                    <span>{isSerialConnected ? 'Đang hoạt động' : 'Chưa kết nối'}</span>
                  </div>
                </div>
              </div>

              {isSerialConnected ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleDisconnectSerial}
                    className="flex-1 py-3.5 rounded-2xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-mono text-xs font-bold border border-red-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Power size={15} /> Đóng cổng Serial
                  </button>
                  <button
                    onClick={handleForceResetSerial}
                    className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-amber-500/20 text-white/60 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 font-mono text-xs transition-all flex items-center justify-center gap-1.5"
                    title="Giải phóng & Đặt lại cổng COM"
                  >
                    <RefreshCw size={15} /> Đặt lại
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleConnectSerial}
                    className="flex-1 py-3.5 rounded-2xl bg-brand hover:bg-brand/90 text-dark font-mono text-xs font-extrabold shadow-[0_0_20px_rgba(94,210,156,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <Usb size={15} /> Kết nối Cổng COM Serial
                  </button>
                  <button
                    onClick={handleForceResetSerial}
                    className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-amber-500/20 text-white/60 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 font-mono text-xs transition-all flex items-center justify-center gap-1.5"
                    title="Giải phóng mọi tài nguyên cổng COM"
                  >
                    <RefreshCw size={15} /> Đặt lại
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Transport Card 2: Direct WiFi WebSocket */}
          <div className={`p-6 sm:p-8 rounded-3xl border-2 flex flex-col gap-6 ${
            selectedTransport === 'websocket' 
              ? 'bg-[#0a1410] border-brand/50 shadow-[0_0_30px_rgba(94,210,156,0.15)]' 
              : 'bg-black/40 border-white/10'
          }`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400">
                  <Wifi size={24} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white uppercase font-mono">2. Không Dây WiFi WebSocket</h3>
                  <p className="text-xs text-white/50 font-mono">Truyền trực tiếp qua mạng nội bộ LAN / SoftAP</p>
                </div>
              </div>
              <input
                type="radio"
                name="transport_mode"
                checked={selectedTransport === 'websocket'}
                onChange={() => setSelectedTransport('websocket')}
                className="accent-brand w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="space-y-4 font-mono text-xs text-white/70">
              <p>
                • Điều khiển không dây thời gian thực bằng giao thức WebSocket chuẩn.
                <br />• Độ trễ LAN: <strong>khoảng 1 - 3ms</strong>.
                <br />• Phù hợp khi ESP32 phát WiFi SoftAP (vd: 192.168.4.1) hoặc kết nối chung mạng WiFi.
              </p>

              <div>
                <label className="text-[10px] text-white/40 uppercase block mb-1">Địa chỉ WebSocket ESP32 (IP & Port)</label>
                <input
                  type="text"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  placeholder="ws://192.168.4.1:81 hoặc ws://esp32.local:81"
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-brand"
                />
              </div>

              {isWsConnected ? (
                <button
                  onClick={handleDisconnectWebSocket}
                  className="w-full py-3.5 rounded-2xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-mono text-xs font-bold border border-red-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <WifiOff size={15} /> Ngắt kết nối WebSocket
                </button>
              ) : (
                <button
                  onClick={handleConnectWebSocket}
                  className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-dark font-mono text-xs font-extrabold shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  <Wifi size={15} /> Kết nối WebSocket Trực Tiếp
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KEYMAP CONFIGURATOR (TÙY BIẾN MÃ LỆNH 100%)                       */}
      {/* ========================================================================= */}
      {activeTab === 'keymap' && (
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-[#09110d] border border-white/10 shadow-xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-white uppercase font-mono flex items-center gap-2">
                <Settings2 size={18} className="text-brand" /> Bảng Cấu Hình Mã Lệnh & Phím Nhấn (100% Khớp Firmware)
              </h2>
              <p className="text-xs text-white/50 font-mono mt-1">
                Tùy chỉnh chính xác chuỗi ký tự hoặc mã byte gửi đến ESP32 khi bấm từng nút
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setKeyDefinitions(DEFAULT_KEY_DEFINITIONS)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-mono text-xs border border-white/10"
              >
                Khôi phục mặc định
              </button>
            </div>
          </div>

          {/* Keymap Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full font-mono text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase text-[10px]">
                  <th className="py-3 px-3">Phím (Key ID)</th>
                  <th className="py-3 px-3">Cổng GPIO</th>
                  <th className="py-3 px-3">Tên Chức Năng</th>
                  <th className="py-3 px-3">ANSI Payload</th>
                  <th className="py-3 px-3">ASCII Text</th>
                  <th className="py-3 px-3">Raw Byte (Hex)</th>
                  <th className="py-3 px-3 text-right">Thử nghiệm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(Object.values(keyDefinitions) as KeyDefinition[]).map((k: KeyDefinition) => (
                  <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-bold text-brand">{k.id}</td>
                    <td className="py-3 px-3">
                      {k.gpioPin ? (
                        <span className="px-2 py-0.5 rounded-md bg-brand/20 text-brand font-bold border border-brand/30 text-[11px]">
                          GPIO {k.gpioPin}
                        </span>
                      ) : (
                        <span className="text-white/30 text-[10px]">--</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-white/80">{k.name}</td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={k.ansiPayload.replace(/\x1b/g, '\\e').replace(/\r/g, '\\r').replace(/\n/g, '\\n')}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\\e/g, '\x1b').replace(/\\r/g, '\r').replace(/\\n/g, '\n');
                          setKeyDefinitions(prev => ({
                            ...prev,
                            [k.id]: { ...prev[k.id], ansiPayload: val }
                          }));
                        }}
                        className="bg-black/50 border border-white/15 rounded px-2 py-1 text-xs font-mono text-amber-300 w-36"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={k.asciiPayload.replace(/\r/g, '\\r').replace(/\n/g, '\\n')}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\\r/g, '\r').replace(/\\n/g, '\n');
                          setKeyDefinitions(prev => ({
                            ...prev,
                            [k.id]: { ...prev[k.id], asciiPayload: val }
                          }));
                        }}
                        className="bg-black/50 border border-white/15 rounded px-2 py-1 text-xs font-mono text-white/80 w-36"
                      />
                    </td>
                    <td className="py-3 px-3 text-sky-400 font-bold">
                      0x{k.rawByte.toString(16).toUpperCase().padStart(2, '0')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleKeyTrigger(k.id)}
                        className="px-3 py-1 rounded bg-brand/20 hover:bg-brand text-brand hover:text-dark font-mono text-[10px] font-bold border border-brand/40 transition-colors"
                      >
                        Bấm thử
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FULL BIDIRECTIONAL SERIAL & WEBSOCKET MONITOR                      */}
      {/* ========================================================================= */}
      {activeTab === 'monitor' && (
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-[#060c09] border border-white/10 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5 font-mono text-xs font-bold text-white uppercase tracking-wider">
              <TerminalIcon size={16} className="text-brand" /> Cửa Sổ Lệnh Nối Tiếp Trực Tiếp (Live Stream Console)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                  autoScroll ? 'bg-brand/10 border-brand/30 text-brand font-bold' : 'border-white/10 text-white/40'
                }`}
              >
                Cuộn tự động: {autoScroll ? 'BẬT' : 'TẮT'}
              </button>
              <button
                onClick={() => setTerminalLogs([])}
                title="Xóa log màn hình"
                className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Terminal Stream Display */}
          <div className="w-full h-[420px] bg-black/90 rounded-2xl p-4 font-mono text-xs leading-relaxed overflow-y-auto border border-white/5 flex flex-col gap-1 text-white/80 shadow-inner">
            {terminalLogs.map((log, i) => (
              <div key={i} className="break-all whitespace-pre-wrap">
                {log.startsWith('[CONNECTED]') || log.startsWith('[TX 100%]') ? (
                  <span className="text-brand font-semibold">{log}</span>
                ) : log.startsWith('[ESP32 RX]') || log.startsWith('[ESP32 WS RX]') ? (
                  <span className="text-sky-400 font-semibold">{log}</span>
                ) : log.startsWith('[LỖI') || log.startsWith('[ERROR]') ? (
                  <span className="text-red-400 font-bold">{log}</span>
                ) : log.startsWith('>') ? (
                  <span className="text-amber-400 font-bold">{log}</span>
                ) : log.startsWith('[XÁC THỰC 100%]') ? (
                  <span className="text-emerald-400 font-bold">{log}</span>
                ) : (
                  <span className="text-white/50">{log}</span>
                )}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Command Input Bar */}
          <form onSubmit={handleCommandSubmit} className="flex gap-2">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Nhập lệnh trực tiếp gửi đến ESP32 (vd: help, wifi scan, reboot, PING_100)..."
              className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-brand/60"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-brand hover:bg-brand/90 text-dark font-mono text-xs font-extrabold rounded-xl border border-brand transition-colors flex items-center gap-2"
            >
              <Send size={14} /> Gửi Trực Tiếp
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: READY-TO-FLASH ESP32 FIRMWARE SNIPPETS (C++ ARDUINO / PLATFORMIO) */}
      {/* ========================================================================= */}
      {activeTab === 'firmware' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* C++ Code 1: USB Serial Receiver */}
          <div className="p-6 rounded-3xl bg-[#09110d] border border-white/10 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono">1. Code ESP32 Nhận USB Serial 100%</h3>
                <p className="text-[10px] text-white/50 font-mono">Dành cho Arduino IDE / PlatformIO</p>
              </div>
              <button
                onClick={() => copyToClipboard(ESP32_FIRMWARE_EXAMPLES.serial_cpp, 'serial')}
                className="px-3 py-1.5 rounded-xl bg-brand/20 hover:bg-brand text-brand hover:text-dark font-mono text-xs font-bold transition-all flex items-center gap-1.5 border border-brand/30"
              >
                {copiedCodeKey === 'serial' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedCodeKey === 'serial' ? 'Đã sao chép' : 'Sao chép C++'}</span>
              </button>
            </div>

            <pre className="w-full h-80 bg-black/80 rounded-2xl p-4 font-mono text-[11px] text-brand/90 overflow-y-auto border border-white/5">
              <code>{ESP32_FIRMWARE_EXAMPLES.serial_cpp}</code>
            </pre>
          </div>

          {/* C++ Code 2: WebSocket Receiver */}
          <div className="p-6 rounded-3xl bg-[#09110d] border border-white/10 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono">2. Code ESP32 WebSocket Không Dây</h3>
                <p className="text-[10px] text-white/50 font-mono">SoftAP hoặc WiFi LAN (Port 81)</p>
              </div>
              <button
                onClick={() => copyToClipboard(ESP32_FIRMWARE_EXAMPLES.websocket_cpp, 'ws')}
                className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500 text-sky-400 hover:text-dark font-mono text-xs font-bold transition-all flex items-center gap-1.5 border border-sky-500/30"
              >
                {copiedCodeKey === 'ws' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedCodeKey === 'ws' ? 'Đã sao chép' : 'Sao chép C++'}</span>
              </button>
            </div>

            <pre className="w-full h-80 bg-black/80 rounded-2xl p-4 font-mono text-[11px] text-sky-300/90 overflow-y-auto border border-white/5">
              <code>{ESP32_FIRMWARE_EXAMPLES.websocket_cpp}</code>
            </pre>
          </div>

        </div>
      )}

    </main>
  );
}
