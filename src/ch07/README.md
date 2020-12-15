# Inspecting Packets

Install Wireshark. [On Ubuntu][1],

```sh
# during installation, recommended to select "YES"
sudo apt install wireshark 

# add my user to wireshark group
sudo usermod -aG wireshark $(whoami)

# reboot for all changes to take effect
sudo reboot
```

# Inspecting Chapter 4 example

Can see all data, and Wireshark can unmask masked payloads.

# Inspecting Chapter 6 example (TLS)

All data is encrypted: page HTML, JS, and all data going through websocket.

[1]: https://linuxhint.com/install_wireshark_ubuntu/