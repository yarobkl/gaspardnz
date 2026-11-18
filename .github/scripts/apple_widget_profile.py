#!/usr/bin/env python3
"""Install an App Store distribution profile for the GaspardNZ Live Activity.

The host app's provisioning profile cannot sign an embedded extension: its
bundle identifier differs. This script uses the existing App Store Connect
team key and the *same imported distribution certificate* as the host app.
It only creates a widget App ID/profile when one is not already registered.
"""

from __future__ import annotations

import base64
import hashlib
import json
import os
import plistlib
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import jwt
from cryptography import x509


WIDGET_BUNDLE_ID = "com.gaspardnz.app.GNZActivityWidget"
PROFILE_NAME = "GaspardNZ Live Activity Widget Distribution"
API_ROOT = "https://api.appstoreconnect.apple.com/v1"


class AppleAPI:
    def __init__(self) -> None:
        key_path = (
            Path(os.environ["RUNNER_TEMP"])
            / "appstoreconnect"
            / "private_keys"
            / f"AuthKey_{os.environ['ASC_KEY_ID']}.p8"
        )
        now = int(time.time())
        self.token = jwt.encode(
            {
                "iss": os.environ["ASC_ISSUER_ID"],
                "iat": now,
                "exp": now + 600,
                "aud": "appstoreconnect-v1",
            },
            key_path.read_bytes(),
            algorithm="ES256",
            headers={"kid": os.environ["ASC_KEY_ID"], "typ": "JWT"},
        )

    def request(self, path: str, *, payload: dict | None = None) -> dict:
        method = "POST" if payload is not None else "GET"
        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        request = urllib.request.Request(
            API_ROOT + path,
            data=body,
            method=method,
            headers={
                "Authorization": "Bearer " + self.token,
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        )
        for attempt in range(3):
            try:
                with urllib.request.urlopen(request, timeout=45) as response:
                    return json.load(response)
            except urllib.error.HTTPError as error:
                # Apple can transiently return HTTP 500 while listing profiles.
                # Never retry writes automatically: that could create duplicates.
                if payload is None and error.code in (429, 500, 502, 503, 504) and attempt < 2:
                    time.sleep(5 * (attempt + 1))
                    continue
                raise RuntimeError(
                    f"Apple Developer API {method} {path.split('?')[0]}: HTTP {error.code}. "
                    "Vérifier les droits de la clé App Store Connect."
                ) from None
            except urllib.error.URLError as error:
                if payload is None and attempt < 2:
                    time.sleep(5 * (attempt + 1))
                    continue
                raise RuntimeError(
                    f"Connexion Apple Developer indisponible pendant {method}."
                ) from error
        raise RuntimeError("Impossible de joindre l'API Apple.")

    def list_resources(self, resource: str, params: dict[str, str]) -> list[dict]:
        path = f"/{resource}?" + urllib.parse.urlencode(params)
        output: list[dict] = []
        while path:
            response = self.request(path)
            output.extend(response.get("data", []))
            next_link = response.get("links", {}).get("next")
            if next_link:
                if not next_link.startswith(API_ROOT + "/"):
                    raise RuntimeError("Pagination Apple inattendue.")
                path = next_link[len(API_ROOT) :]
            else:
                path = ""
        return output


def matching_distribution_certificate(api: AppleAPI, host_profile: dict) -> str:
    team_certificates = host_profile.get("DeveloperCertificates", [])
    identities = subprocess.check_output(
        ["security", "find-identity", "-v", "-p", "codesigning"], text=True
    ).upper()
    approved_fingerprints = {
        fingerprint
        for certificate in team_certificates
        if (fingerprint := hashlib.sha1(certificate).hexdigest().upper()) in identities
    }
    if not approved_fingerprints:
        raise RuntimeError("Le certificat signé du profil principal n'est pas installé.")
    approved_serials = {
        str(x509.load_der_x509_certificate(cert).serial_number).upper()
        for cert in team_certificates
        if hashlib.sha1(cert).hexdigest().upper() in approved_fingerprints
    }
    approved_serials_hex = {
        format(int(value), "X") for value in approved_serials
    }
    certificates = api.list_resources("certificates", {"limit": "200"})
    matches = []
    for entry in certificates:
        attrs = entry["attributes"]
        if attrs.get("certificateType") not in {"IOS_DISTRIBUTION", "DISTRIBUTION"}:
            continue
        content = attrs.get("certificateContent")
        if content:
            encoded = "".join(content.split())
            fingerprint = hashlib.sha1(base64.b64decode(encoded)).hexdigest().upper()
            matches_profile = fingerprint in approved_fingerprints
        else:
            serial = re.sub(r"[^A-F0-9]", "", (attrs.get("serialNumber") or "").upper()).lstrip("0")
            matches_profile = serial in approved_serials_hex
        if matches_profile:
            matches.append(entry["id"])
    if len(matches) != 1:
        raise RuntimeError(
            f"Un certificat de distribution unique, correspondant à l'app, est requis "
            f"(trouvés : {len(matches)})."
        )
    return matches[0]


def registered_bundle_id(api: AppleAPI) -> str:
    bundles = api.list_resources(
        "bundleIds", {"filter[identifier]": WIDGET_BUNDLE_ID, "limit": "200"}
    )
    exact = [bundle for bundle in bundles if bundle["attributes"]["identifier"] == WIDGET_BUNDLE_ID]
    if len(exact) > 1:
        raise RuntimeError("Plusieurs App IDs du widget trouvés dans Apple Developer.")
    if exact:
        return exact[0]["id"]
    print("Enregistrement du bundle ID spécifique au widget chez Apple.", flush=True)
    response = api.request(
        "/bundleIds",
        payload={
            "data": {
                "type": "bundleIds",
                "attributes": {
                    "identifier": WIDGET_BUNDLE_ID,
                    "name": "GaspardNZ Live Activity Widget",
                    "platform": "IOS",
                },
            }
        },
    )
    return response["data"]["id"]


def profile_data(api: AppleAPI, bundle_id: str, certificate_id: str) -> bytes:
    profiles = api.list_resources("profiles", {"limit": "200"})
    matching = [p for p in profiles if p["attributes"].get("name") == PROFILE_NAME]
    if matching:
        active = [
            p
            for p in matching
            if p["attributes"].get("profileState") == "ACTIVE"
            and p["attributes"].get("profileType") == "IOS_APP_STORE"
            and p["attributes"].get("profileContent")
        ]
        if len(active) != 1:
            raise RuntimeError(
                "Un ancien profil widget incompatible existe chez Apple : "
                "corriger le profil dans Apple Developer avant de relancer."
            )
        print("Profil App Store du widget existant retrouvé.", flush=True)
        return base64.b64decode("".join(active[0]["attributes"]["profileContent"].split()))

    print("Création du profil App Store propre au widget.", flush=True)
    created = api.request(
        "/profiles",
        payload={
            "data": {
                "type": "profiles",
                "attributes": {
                    "name": PROFILE_NAME,
                    "profileType": "IOS_APP_STORE",
                },
                "relationships": {
                    "bundleId": {"data": {"type": "bundleIds", "id": bundle_id}},
                    "certificates": {
                        "data": [{"type": "certificates", "id": certificate_id}]
                    },
                },
            }
        },
    )
    return base64.b64decode(
        "".join(created["data"]["attributes"]["profileContent"].split())
    )


def install_profile(content: bytes, destination: Path, host_profile: dict) -> None:
    destination.write_bytes(content)
    decoded = subprocess.check_output(["security", "cms", "-D", "-i", str(destination)])
    profile = plistlib.loads(decoded)
    team = os.environ["APPLE_TEAM_ID"]
    if profile.get("Name") != PROFILE_NAME:
        raise RuntimeError("Nom de profil du widget incorrect.")
    if profile.get("TeamIdentifier", []) != [team]:
        raise RuntimeError("Le widget appartient à une autre équipe Apple.")
    entitlements = profile.get("Entitlements", {})
    if entitlements.get("application-identifier") != f"{team}.{WIDGET_BUNDLE_ID}":
        raise RuntimeError("Le profil du widget cible un bundle ID différent.")
    host_sha1 = {
        hashlib.sha1(cert).hexdigest()
        for cert in host_profile.get("DeveloperCertificates", [])
    }
    widget_sha1 = {
        hashlib.sha1(cert).hexdigest()
        for cert in profile.get("DeveloperCertificates", [])
    }
    if not host_sha1.intersection(widget_sha1):
        raise RuntimeError("Le profil du widget utilise un autre certificat.")
    if profile.get("ExpirationDate") is None:
        raise RuntimeError("Date d'expiration du profil widget absente.")
    profile_dir = Path.home() / "Library/MobileDevice/Provisioning Profiles"
    profile_dir.mkdir(parents=True, exist_ok=True)
    (profile_dir / f"{profile['UUID']}.mobileprovision").write_bytes(content)
    print("Widget prêt : profil App Store de distribution installé et vérifié.")


def main() -> None:
    if len(sys.argv) != 3:
        raise RuntimeError("Utilisation : apple_widget_profile.py host.plist widget.mobileprovision")
    host_profile = plistlib.loads(Path(sys.argv[1]).read_bytes())
    api = AppleAPI()
    certificate_id = matching_distribution_certificate(api, host_profile)
    bundle_id = registered_bundle_id(api)
    content = profile_data(api, bundle_id, certificate_id)
    install_profile(content, Path(sys.argv[2]), host_profile)


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, KeyError, ValueError) as error:
        print(f"::error::{error}", file=sys.stderr)
        sys.exit(1)
