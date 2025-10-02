from time import localtime, strftime
from . import config
from scapy.all import wrpcap
import os

def dec(bytes):
    message = str(bytes, "latin-1")
    message = message.replace("\x00", "")
    return message


def extract_string(hex, offset, length):
    if hex[offset:offset+2] == "00":
        return -1
    try:
        length = min(len(hex)-offset, length)
        if length < 0:
            raise ValueError('Package too short')

        return dec(bytes.fromhex(hex[offset:offset+length]))
    except ValueError as e:
        print(e, flush=True)
        return -1

last_payload = ""

def package_handler(package, output, record=False):

    global last_payload

    if "IP" not in package:
        return

    package_src = package["IP"].src

    # checks if the package derives from bdo
    is_bdo_ip = len(([ip for ip in config.config.ips if ip in package_src])) > 0

    # chckes if the packages comes from a tcp stream
    uses_tcp = "TCP" in package and hasattr(package["TCP"].payload, "load")
    if is_bdo_ip and uses_tcp:

        if record:
           wrpcap(output+".pcap", package, append=True)
           return

        # loads the payload as raw hex
        payload = bytes(package["TCP"].payload).hex()

        while last_payload != "" or config.config.identifier in payload:
            # combines previous payload with new one
            payload = last_payload + payload

            # get starting position for the combat log
            start_index = payload.index(config.config.identifier)

            # remove unnecessary information
            payload = payload[start_index:]

            # if the combat log is not complete
            if config.config.log_length > len(payload):
                # save payload for next package
                last_payload = payload
                return

            # extract log information
            timestamp = strftime("%I:%M:%S", localtime(int(package.time)))
            guild = extract_string(payload, config.config.guild_offset, config.config.name_length)
            player_one = extract_string(
                payload, config.config.player_one_offset, config.config.name_length)
            player_two = extract_string(
                payload, config.config.player_two_offset, config.config.name_length)
            is_kill = payload[config.config.kill_offset: config.config.kill_offset+1] == "1"

            # Extract character names by scanning the entire payload
            # We look for names that are not family names or guild names
            character_names = []
            scanned_positions = set([config.config.guild_offset, config.config.player_one_offset, 
                                    config.config.player_two_offset])
            
            # Scan through the payload looking for character names
            for offset in range(0, min(config.config.log_length, len(payload)), 2):
                if offset in scanned_positions:
                    continue
                    
                name = extract_string(payload, offset, config.config.name_length)
                if name != -1 and len(name) > 2:
                    # Make sure it's not a family name or guild name
                    if name not in [player_one, player_two, guild]:
                        character_names.append((offset, name))
                        scanned_positions.add(offset)
            
            # Sort character names by their position in the payload
            character_names.sort(key=lambda x: x[0])
            
            # Extract just the names
            chars = [name for _, name in character_names[:2]]
            
            # Format: always (Player2Char, Player1Char)
            # Since chars are typically found in order [Player1Char, Player2Char], we reverse them
            if len(chars) == 2:
                character_info = f" ({chars[1]},{chars[0]})"
            elif len(chars) == 1:
                character_info = f" ({chars[0]},)"
            else:
                character_info = ""

            # Use single format for all logs
            if is_kill:
                log = f"[{timestamp}] {player_one} has killed {player_two} from {guild}{character_info}"
            else:
                log = f"[{timestamp}] {player_one} died to {player_two} from {guild}{character_info}"

            print(log, flush=True)
            directory = os.path.dirname(output)
            if not os.path.exists(directory):
                os.makedirs(directory)

            with open(output, "a") as file:
                try:
                    file.write(log + "\n")
                except UnicodeEncodeError as error:
                    print(error, flush=True)

            payload = payload[len(config.config.identifier):]
            # reset last_payload
            last_payload = ""