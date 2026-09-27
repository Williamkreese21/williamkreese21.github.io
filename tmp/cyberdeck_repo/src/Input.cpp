#include "Input.h"
#include "Pins.h"

static int lastEncClk = HIGH;
static unsigned long lastNavMs = 0;
static NavAction pendingEncoderAction = NAV_NONE;
static unsigned long lastEncoderMs = 0;
static bool upWasDown = false;
static bool downWasDown = false;
static bool enterWasDown = false;
static bool backWasDown = false;

// ── Web Serial Remote Navigation State ─────────────────────────────────────
static NavAction pendingRemoteAction = NAV_NONE;
static unsigned long remoteActionExpiresMs = 0;

static void pollSerialRemote() {
    while (Serial.available()) {
        int peekB = Serial.peek();
        // 1. Raw byte single-character mode (0x01=UP, 0x02=DOWN, 0x2A=PUSH, 0x29=BACK)
        if (peekB == 0x01) {
            Serial.read();
            pendingRemoteAction = NAV_UP;
            remoteActionExpiresMs = millis() + 450;
            Serial.println("[REMOTE_ACK] UP (PIN 1) RECEIVED 100%");
            continue;
        } else if (peekB == 0x02) {
            Serial.read();
            pendingRemoteAction = NAV_DOWN;
            remoteActionExpiresMs = millis() + 450;
            Serial.println("[REMOTE_ACK] DOWN (PIN 2) RECEIVED 100%");
            continue;
        } else if (peekB == 0x2A) {
            Serial.read();
            pendingRemoteAction = NAV_ENTER;
            remoteActionExpiresMs = millis() + 450;
            Serial.println("[REMOTE_ACK] PUSH/ENTER (PIN 42) RECEIVED 100%");
            continue;
        } else if (peekB == 0x29) {
            Serial.read();
            pendingRemoteAction = NAV_BACK;
            remoteActionExpiresMs = millis() + 450;
            Serial.println("[REMOTE_ACK] BACK/ESC (PIN 41) RECEIVED 100%");
            continue;
        }

        // 2. Line string commands
        String cmd = Serial.readStringUntil('\n');
        cmd.trim();
        if (cmd.length() == 0) continue;

        if (cmd == "GPIO:1" || cmd == "UP" || cmd == "\x1b[A" || cmd == "GPIO:1:PRESS" || cmd == "1") {
            pendingRemoteAction = NAV_UP;
            remoteActionExpiresMs = millis() + 450;
            Serial.println("[REMOTE_ACK] UP (GPIO 1) TRIGGERED 100%");
        } else if (cmd == "GPIO:2" || cmd == "DOWN" || cmd == "\x1b[B" || cmd == "GPIO:2:PRESS" || cmd == "2") {
            pendingRemoteAction = NAV_DOWN;
            remoteActionExpiresMs = millis() + 450;
            Serial.println("[REMOTE_ACK] DOWN (GPIO 2) TRIGGERED 100%");
        } else if (cmd == "GPIO:42" || cmd == "PUSH" || cmd == "ENTER" || cmd == "OK" || cmd == "\r" || cmd == "GPIO:42:PRESS" || cmd == "42") {
            pendingRemoteAction = NAV_ENTER;
            remoteActionExpiresMs = millis() + 450;
            Serial.println("[REMOTE_ACK] PUSH/ENTER (GPIO 42) TRIGGERED 100%");
        } else if (cmd == "GPIO:41" || cmd == "BACK" || cmd == "ESC" || cmd == "\x1b" || cmd == "GPIO:41:PRESS" || cmd == "41") {
            pendingRemoteAction = NAV_BACK;
            remoteActionExpiresMs = millis() + 450;
            Serial.println("[REMOTE_ACK] BACK/ESC (GPIO 41) TRIGGERED 100%");
        } else if (cmd == "ENC_CW" || cmd == "+") {
            pendingRemoteAction = NAV_DOWN;
            remoteActionExpiresMs = millis() + 450;
            Serial.println("[REMOTE_ACK] ENCODER CW (DOWN)");
        } else if (cmd == "ENC_CCW" || cmd == "-") {
            pendingRemoteAction = NAV_UP;
            remoteActionExpiresMs = millis() + 450;
            Serial.println("[REMOTE_ACK] ENCODER CCW (UP)");
        } else if (cmd == "PING_100") {
            Serial.println("PONG_100");
        } else if (cmd == "reboot" || cmd == "REBOOT") {
            Serial.println("[ESP32] Rebooting...");
            delay(100);
            ESP.restart();
        } else {
            Serial.printf("[REMOTE_ECHO] %s\n", cmd.c_str());
        }
    }
}

static void pollEncoder() {
    int encClk = digitalRead(ENC_CLK_PIN);
    if (encClk != lastEncClk) {
        lastEncClk = encClk;
        if (encClk == LOW && millis() - lastEncoderMs > 4) {
            pendingEncoderAction = digitalRead(ENC_DT_PIN) == HIGH ? NAV_DOWN : NAV_UP;
            lastEncoderMs = millis();
        }
    }
}

static bool takePendingEncoderAction(NavAction action) {
    pollEncoder();
    if (pendingEncoderAction != action) return false;
    pendingEncoderAction = NAV_NONE;
    lastNavMs = millis();
    return true;
}

void initInput() {
    pinMode(BTN_UP, INPUT_PULLUP);
    pinMode(BTN_DOWN, INPUT_PULLUP);
    pinMode(BTN_OK, INPUT_PULLUP);
    pinMode(BTN_BACK, INPUT_PULLUP);
    pinMode(ENC_CLK_PIN, INPUT_PULLUP);
    pinMode(ENC_DT_PIN, INPUT_PULLUP);
    pinMode(ENC_SW_PIN, INPUT_PULLUP);

    lastEncClk = digitalRead(ENC_CLK_PIN);
    upWasDown = digitalRead(BTN_UP) == LOW;
    downWasDown = digitalRead(BTN_DOWN) == LOW;
    enterWasDown = isEnterPressed();
    backWasDown = digitalRead(BTN_BACK) == LOW;
}

void flushNavInput(unsigned long settleMs) {
    if (settleMs > 0) delay(settleMs);
    pendingEncoderAction = NAV_NONE;
    pendingRemoteAction = NAV_NONE;
    lastEncClk = digitalRead(ENC_CLK_PIN);
    upWasDown = digitalRead(BTN_UP) == LOW;
    downWasDown = digitalRead(BTN_DOWN) == LOW;
    enterWasDown = isEnterPressed();
    backWasDown = digitalRead(BTN_BACK) == LOW;
    lastNavMs = millis();
}

bool isBackPressed() {
    pollSerialRemote();
    if (pendingRemoteAction == NAV_BACK && millis() < remoteActionExpiresMs) {
        pendingRemoteAction = NAV_NONE;
        return true;
    }
    return digitalRead(BTN_BACK) == LOW;
}

bool isEnterPressed() {
    pollSerialRemote();
    if (pendingRemoteAction == NAV_ENTER && millis() < remoteActionExpiresMs) {
        pendingRemoteAction = NAV_NONE;
        return true;
    }
    return digitalRead(BTN_OK) == LOW || digitalRead(ENC_SW_PIN) == LOW;
}

bool navUpPressed() {
    pollSerialRemote();
    if (pendingRemoteAction == NAV_UP && millis() < remoteActionExpiresMs) {
        pendingRemoteAction = NAV_NONE;
        return true;
    }
    if (digitalRead(BTN_UP) == LOW) return true;
    return takePendingEncoderAction(NAV_UP);
}

bool navDownPressed() {
    pollSerialRemote();
    if (pendingRemoteAction == NAV_DOWN && millis() < remoteActionExpiresMs) {
        pendingRemoteAction = NAV_NONE;
        return true;
    }
    if (digitalRead(BTN_DOWN) == LOW) return true;
    return takePendingEncoderAction(NAV_DOWN);
}

bool navEnterPressed() {
    return isEnterPressed();
}

bool navBackPressed() {
    return isBackPressed();
}

NavAction readNavAction(unsigned long repeatMs) {
    unsigned long now = millis();
    pollEncoder();
    pollSerialRemote();

    // 1. Check Web Serial remote action
    if (pendingRemoteAction != NAV_NONE && now < remoteActionExpiresMs) {
        NavAction action = pendingRemoteAction;
        pendingRemoteAction = NAV_NONE;
        lastNavMs = now;
        return action;
    }

    // 2. Check physical hardware buttons
    bool backDown = digitalRead(BTN_BACK) == LOW;
    bool upDown = digitalRead(BTN_UP) == LOW;
    bool downDown = digitalRead(BTN_DOWN) == LOW;
    bool enterDown = isEnterPressed();

    NavAction action = NAV_NONE;
    bool canEmit = (now - lastNavMs) >= repeatMs;

    if (canEmit && backDown && !backWasDown) {
        action = NAV_BACK;
    } else if (canEmit && upDown && !upWasDown) {
        action = NAV_UP;
    } else if (canEmit && downDown && !downWasDown) {
        action = NAV_DOWN;
    } else if (canEmit && enterDown && !enterWasDown) {
        action = NAV_ENTER;
    } else if (canEmit && pendingEncoderAction != NAV_NONE) {
        action = pendingEncoderAction;
        pendingEncoderAction = NAV_NONE;
    }

    backWasDown = backDown;
    upWasDown = upDown;
    downWasDown = downDown;
    enterWasDown = enterDown;

    if (action != NAV_NONE) {
        lastNavMs = now;
    }
    return action;
}
