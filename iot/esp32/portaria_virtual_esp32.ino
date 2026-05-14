#include <WiFi.h>
#include <WebServer.h>
#include <esp_task_wdt.h>

const char* WIFI_SSID = "SEU_WIFI";
const char* WIFI_PASSWORD = "SUA_SENHA";
const char* API_TOKEN = "change_me_esp32_token";

const int RELAY_PIN = 26;
const int RELAY_ACTIVE_LEVEL = HIGH;
const int RELAY_IDLE_LEVEL = LOW;
const unsigned long RELAY_PULSE_MS = 1000;

WebServer server(80);

bool isAuthorized() {
  String auth = server.header("Authorization");
  String expected = "Bearer " + String(API_TOKEN);
  return auth == expected;
}

void pulseRelay() {
  digitalWrite(RELAY_PIN, RELAY_ACTIVE_LEVEL);
  delay(RELAY_PULSE_MS);
  digitalWrite(RELAY_PIN, RELAY_IDLE_LEVEL);
}

void handleOpen() {
  if (!isAuthorized()) {
    Serial.println("[WARN] Unauthorized /open request");
    server.send(401, "application/json", "{\"ok\":false,\"message\":\"unauthorized\"}");
    return;
  }

  Serial.println("[INFO] Opening gate relay for 1 second");
  pulseRelay();
  server.send(200, "application/json", "{\"ok\":true}");
}

void handleHealth() {
  server.send(200, "application/json", "{\"ok\":true,\"device\":\"esp32-gate\"}");
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.printf("[INFO] Connecting to WiFi SSID=%s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < 20000) {
    delay(500);
    Serial.print(".");
    esp_task_wdt_reset();
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("[INFO] WiFi connected. IP=%s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("[ERROR] WiFi connection timeout");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, RELAY_IDLE_LEVEL);

  esp_task_wdt_init(10, true);
  esp_task_wdt_add(NULL);

  connectWiFi();

  server.on("/health", HTTP_GET, handleHealth);
  server.on("/open", HTTP_POST, handleOpen);
  server.begin();
  Serial.println("[INFO] HTTP server started");
}

void loop() {
  esp_task_wdt_reset();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WARN] WiFi disconnected, reconnecting");
    connectWiFi();
  }
  server.handleClient();
}
