The original PhotoPizza Remote interface runs in the browser and connects directly to the turntable controller over WebSocket. It exposes the capture parameters used by the device: frame count, speed, pause, delay, rotation direction, shooting mode, total steps, and Wi-Fi settings.

Operators can connect to a controller on the local network, start or stop a capture sequence, select continuous rotation, and follow the remaining frames in the UI. The hardware executes the motion and capture state; the browser provides configuration and control.
