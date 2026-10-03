#!/usr/bin/env bash
# Convertit un enregistrement de référence en WAV mono 24 kHz (format attendu par Chatterbox).
# Usage : scripts/prep_ref.sh memo_vocal.m4a voix/bilel_ref.wav
set -euo pipefail
in="$1"; out="$2"
ffmpeg -hide_banner -y -i "$in" -ac 1 -ar 24000 -af "highpass=f=80" "$out"
ffprobe -hide_banner -v error -show_entries format=duration -of default=nw=1 "$out"
