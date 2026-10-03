#!/usr/bin/env bash
# Prépare l'environnement : Remotion (Node) + Python 3.11 (Chatterbox, faster-whisper).
set -euo pipefail
cd "$(dirname "$0")/.."

(cd video && npm install)

if command -v uv >/dev/null; then
  uv venv --python 3.11 .venv
  VIRTUAL_ENV=.venv uv pip install -r requirements.txt
else
  python3.11 -m venv .venv
  .venv/bin/pip install -r requirements.txt
fi

.venv/bin/python -c "import torch; print('cuda' if torch.cuda.is_available() else 'mps' if torch.backends.mps.is_available() else 'cpu')"
