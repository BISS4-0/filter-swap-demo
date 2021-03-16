# Filter Demo mit QR Codes

## Infrastruktur
Die benötigte Infrastruktur besteht aus:
- PC oder idealerweise Laptop mit Linux Installation sowie Wifi Adapter
- Die Software create_ap zu Erstellung eines Wifi Hotspots [1]
- Die Software Virtualbox, idealerweise Version 6.1.18 oder neuer
- Das Virtualbox Image “Filter-Demonstrator”

## Die benötigten Schritte sind wie folgt:
1. Importieren des Virtualbox Image, beschrieben in [2], Alternativ: Ubuntu 18.04, VSCode mit IBM Blockchain Plugin, Docker, Docker Compose 
2. Einrichten von Port Forwarding
3. Port 3000 von Guest an Port 3000 von Host
4. Starten der VM
5. Starten der Blockchain mit den Befehlen:
    - /home/ubuntu/filter-swap/startFabric.sh
    - /home/ubuntu/filter-swap/copy-connection-profile.sh
    - /home/ubuntu/filter-swap/javascript rm -r wallet_admin_Org1 wallet_user1_Org1
    - /home/ubuntu/filter-swap/javascript/enrollAdmin.sh
    - /home/ubuntu/filter-swap/javascript/registerUser1.sh
    - node /home/ubuntu/filter-swap/javascript/invoke.js
6. Starten des Wifi Hotspots auf dem Host PC oder Laptop
    - Interface Name des Wifi Adapters bestimmen:
    - ifconfig oder ip a
    - Wifi Hotstop (Interface Name: wlp3s0, SSID: FilterDemo, Passwort: FilterDemo) starten mit: sudo create_ap -n wlp3s0 FilterDemo FilterDemo

## Zu erzeugende QR-Codes
Nachfolgend werden die zu erzeugenden QR-Codes beschrieben. QR-Codes mit Bild können unter [3] erzeugt werden. Es existieren viele weitere kostenlose Webseiten, die QR-Code erzeugen können. Die angegebene IP Adresse sollte korrekt sein für Ihren Aufbau.
- 192.168.12.1:3000/deleteall Löscht den bestehenden Blockchain Inhalt, dient zum schnellen Neustart des Aufbaus
- 192.168.12.1:3000/init Initialisierung Teil 1; Muss beim ersten Start der Blockchain ausgeführt werden sowie nach Löschen des bestehenden Blockchain Inhalts
 192.168.12.1:3000/initblockchain Initialisierung Teil 2; Muss beim ersten Start der Blockchain ausgeführt werden sowie nach Löschen des bestehenden Blockchain Inhalts
- 192.168.12.1:3000/login?user=user1 Wartungstechniker QR-Code: Authentifizieren des Wartungstechnikers
- 192.168.12.1:3000/registermachine?machine=machine1 Wartungstechniker QR-Code: Anmelden des Wartungstechnikers an Maschine
- 192.168.12.1:3000/replacefilter?filter=ec17296a Wartungstechniker QR-Code: Beispiel für Filter QR-Code
- 192.168.12.1:3000/replacefilter?filter=c59f87ab Wartungstechniker QR-Code: Beispiel für Filter QR-Code
- 192.168.12.1:3000/replacefilter?filter=032332c4 Wartungstechniker QR-Code: Beispiel für Filter QR-Code
- 192.168.12.1:3000/queryall Wartungstechniker QR-Code: Für Audit durch

---

[1] https://github.com/LinuxLearnorg/create_ap
[2] https://www.virtualbox.org/manual/UserManual.html#ovf-import-appliance
[3] https://www.qrcode-monkey.com/
