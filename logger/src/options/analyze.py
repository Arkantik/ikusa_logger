import os
import re
from scapy.all import sniff, rdpcap, get_if_list
from scapy.arch.windows import get_windows_if_list
from time import localtime, strftime
from .. import config


def dec(bytes):
    message = str(bytes, "utf-16-le", errors="replace")
    message = message.replace("\x00", "")
    return message


def extract_string(hex, offset, length):
    # check whether the string begins with a null terminator (0x0000 in UTF-16-LE)
    if hex[offset : offset + 4] == "0000":
        return -1

    # Find end of UTF-16-LE string by looking for null terminator (0x0000)
    actual_length = length
    for i in range(offset, min(offset + length, len(hex) - 2), 4):
        # Check for double null (UTF-16-LE null terminator)
        if hex[i : i + 4] == "0000":
            actual_length = i - offset
            break

    try:
        actual_length = min(len(hex) - offset, actual_length)
        if actual_length < 0:
            raise ValueError("Package too short")

        return dec(bytes.fromhex(hex[offset : offset + actual_length]))
    except ValueError as e:
        # print(e, flush=True)
        return -1


last_payload = ""
current_position = 0

identifier_regex = r"[56][0-9a-f]0100[0-9a-f]{4}"
name_regex = r"^[\w]{3,16}$"  # \w matches Unicode letters, digits, and underscores


def package_handler(package, output, ip_filter=True):
    global last_payload

    if "IP" not in package:
        return

    package_src = package["IP"].src


    # checks if the package derives from bdo
    is_bdo_ip = (not ip_filter) or (
        len(
            (
                [
                    ip
                    for ip in ["20.76.13", "20.76.14", "13.64.17", "13.93.181", "52.137.41", "52.137.42", "44.228.191", "54.150.104"]
                    if ip in package_src
                ]
            )
        )
        > 0
    )
    
    # checkes if the packages comes from a tcp stream
    uses_tcp = "TCP" in package and hasattr(package["TCP"].payload, "load")
    if is_bdo_ip and uses_tcp:
        # loads the payload as raw hex
        payload = bytes(package["TCP"].payload).hex()

        # iterate through the payload and try to find the identifier + player names + guild name + kill
        payload = last_payload + payload
        position = 0
        while len(payload[position:]) >= 600:
            payload = payload[position:]
            position = 0
            match_location = 0
            matches = list(re.finditer(identifier_regex, payload))

            if len(matches) == 0:
                return  # no match found, return - could cause issue if the identifier is split between two packages
            elif len(matches) == 1:
                match_location = matches[0].start()
            else:
                while len(matches) > 1:
                    if matches[0].start() + 600 < matches[1].start():
                        match_location = matches[0].start()
                        break
                    elif len(matches) > 2:
                        matches.pop(0)
                    else:
                        match_location = matches[1].start()
                        break

            payload = payload[match_location:]

            if len(payload) >= 600:
                possible_log = payload[0:600]
                i = 0
                names = []
                while i < 600:
                    name = extract_string(possible_log, i, 64)
                    if name == -1:
                        i += 1
                        continue
                    is_valid = re.match(name_regex, name)
                    if is_valid:
                        names.append(name + " " + str(i))
                        i += 64
                    else:
                        i += 1
                if len(names) == 5:
                    time = strftime("%I:%M:%S", localtime(int(package.time)))
                    print(
                        payload[0:10]
                        + ","
                        + time
                        + ","
                        + ",".join(names)
                        + ","
                        + possible_log,
                        flush=True,
                    )
                    position = 600
                else:
                    position = 1

            else:
                break

        last_payload = payload[position:]


def open_pcap(file, output, ip_filter=True):
    if file != None and not os.path.isfile(file):
        print("Invalid file", flush=True)
        return
    print("Reading " + file, flush=True)
    if os.name == "nt":
        print("Loading file into ram. This may take a while.", flush=True)
        cap = rdpcap(file)
        index = 0
        for package in cap:
            package_handler(package, output, ip_filter)
            if index % 10000 == 0:
                print(f"{index}/{len(cap)} packages analyzed.", flush=True)
            index += 1
    else:
        sniff(offline=file, filter="tcp", prn=package_handler, store=0)

    print(f"Logs saved under: {output}\nYou can close this window now.", flush=True)


def start_sniff(output, all_interfaces=True, ip_filter=True):
    try:
        print("Reading Network...", flush=True)
        winList = get_windows_if_list()
        intfList = get_if_list()
        guidToNameDict = {e["guid"]: e["name"] for e in winList}
        namesAllowedList = [guidToNameDict.get(e) for e in intfList]
        namesAllowedList = list(filter(None, namesAllowedList))
        # print("Network Interfaces: ", namesAllowedList, flush=True)
        sniff(
            filter="tcp",
            prn=lambda x: package_handler(x, output, ip_filter),
            store=0,
            iface=namesAllowedList
            if len(namesAllowedList) > 0 and all_interfaces
            else None,
        )
    except Exception as e:
        print("Error while reading network.", flush=True)
        print(e, flush=True)
