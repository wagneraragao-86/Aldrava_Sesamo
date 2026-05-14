# ESP32 - Controlador do portao

Firmware Arduino para ESP32 com endpoint HTTP protegido.

## Configuracao

Edite no arquivo `portaria_virtual_esp32.ino`:

- `WIFI_SSID`
- `WIFI_PASSWORD`
- `API_TOKEN`
- `RELAY_PIN`
- niveis `RELAY_ACTIVE_LEVEL` e `RELAY_IDLE_LEVEL`

O backend chama:

```http
POST http://IP_DO_ESP32/open
Authorization: Bearer change_me_esp32_token
```

O rele fica acionado por 1 segundo.
