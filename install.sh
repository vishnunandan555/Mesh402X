#!/usr/bin/env bash
# ==============================================================================
# MEDUSA x402 AUTONOMOUS AGENT INSTALLER
# ==============================================================================
# One-line installer to enable autonomous pay-per-call security audits in ANY repo:
# curl -fsSL https://raw.githubusercontent.com/vishnunandan555/Mesh402X/main/install.sh | bash
# ==============================================================================

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "\n${CYAN}"
echo "  __  __ _____ ____  _   _ ____    _    "
echo " |  \/  | ____|  _ \| | | / ___|  / \   "
echo " | |\/| |  _| | | | | | | \___ \ / _ \  "
echo " | |  | | |___| |_| | |_| |___) / ___ \ "
echo " |_|  |_|_____|____/ \___/|____/_/   \_\\"
echo " x402 Autonomous Security Node Installer"
echo -e "${NC}\n"

# 1. Check Node.js and NPM
echo -e "${CYAN}[1/5] Checking environment dependencies...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}[!] Node.js is not installed. Please install Node.js v18+ first.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}[!] npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}[+] Node.js $(node -v) detected.${NC}"

# 2. Initialize package.json if not present & install packages
echo -e "\n${CYAN}[2/5] Installing x402 & Algorand SDK packages...${NC}"
if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
    npm init -y > /dev/null 2>&1
fi

npm install --save-dev @x402-avm/fetch @x402-avm/avm @modelcontextprotocol/sdk algosdk dotenv tsx @types/node typescript

echo -e "${GREEN}[+] Dependencies installed successfully.${NC}"

# 3. Create medusa-scripts and mcp-server directories
echo -e "\n${CYAN}[3/5] Setting up modular Medusa audit scripts & MCP Server...${NC}"
mkdir -p medusa-scripts
mkdir -p mcp-server
mkdir -p .agents/skills/medusa-audit/scripts

GITHUB_RAW="https://raw.githubusercontent.com/vishnunandan555/Mesh402X/main"

# Function to download or create script fallback
fetch_or_create_script() {
    local script_name="$1"
    local local_path="medusa-scripts/${script_name}"
    
    # Try downloading from GitHub
    if curl -fsSL "${GITHUB_RAW}/medusa-scripts/${script_name}" -o "${local_path}" 2>/dev/null; then
        echo -e "  ${GREEN}[+] Downloaded ${script_name}${NC}"
    fi
}

SCRIPTS=("audit-full.ts" "audit-scan.ts" "audit-remediate.ts" "audit-attest.ts" "wallet-history.ts" "check-wallet.ts" "optin-usdc.ts" "generate-wallet.ts")

for s in "${SCRIPTS[@]}"; do
    fetch_or_create_script "$s"
done

# Copy to .agents/skills
cp medusa-scripts/*.ts .agents/skills/medusa-audit/scripts/ 2>/dev/null || true

# Setup MCP Server
curl -fsSL "${GITHUB_RAW}/mcp-server/index.ts" -o "mcp-server/index.ts" 2>/dev/null || true
cat <<EOF > .agents/mcp_config.json
{
  "mcpServers": {
    "medusa-x402-security": {
      "command": "npx",
      "args": ["tsx", "mcp-server/index.ts"],
      "env": {
        "DOTENV_CONFIG_QUIET": "true"
      }
    }
  }
}
EOF
echo -e "  ${GREEN}[+] Configured Medusa MCP Server in .agents/mcp_config.json${NC}"

# 4. Download / Install Agent Instructions & Skills (AGENTS.md & Medusa_Skill.md)
echo -e "\n${CYAN}[4/5] Installing Medusa Agent Skill & AGENTS.md instructions...${NC}"
curl -fsSL "${GITHUB_RAW}/AGENTS.md" -o "AGENTS.md" 2>/dev/null || true
curl -fsSL "${GITHUB_RAW}/Medusa_Skill.md" -o "Medusa_Skill.md" 2>/dev/null || true
curl -fsSL "${GITHUB_RAW}/Medusa_Skill.md" -o ".agents/skills/medusa-audit/SKILL.md" 2>/dev/null || true
echo -e "${GREEN}[+] AGENTS.md, Medusa_Skill.md & .agents/skills/medusa-audit/SKILL.md configured.${NC}"

# 5. Wallet Configuration in wallet.env
echo -e "\n${CYAN}[5/5] Configuring Agent Algorand Wallet (wallet.env)...${NC}"

USER_MNEMONIC=""

# Read from /dev/tty if available (works even when script is piped via curl | bash)
if [ -e /dev/tty ]; then
    echo -e "${YELLOW}Enter your 25-word Algorand TestNet Wallet Mnemonic:${NC}"
    read -r -p "AGENT_MNEMONIC: " USER_MNEMONIC < /dev/tty || true
elif [ -t 0 ]; then
    echo -e "${YELLOW}Enter your 25-word Algorand TestNet Wallet Mnemonic:${NC}"
    read -r -p "AGENT_MNEMONIC: " USER_MNEMONIC || true
fi

# Clean & sanitize input (strip variable assignment prefixes, surrounding quotes, whitespace)
USER_MNEMONIC=$(echo "$USER_MNEMONIC" | sed -E "s/^[A-Za-z0-9_]+[[:space:]]*=[[:space:]]*//")
USER_MNEMONIC=$(echo "$USER_MNEMONIC" | sed -E "s/^[[:space:]\"'\\\\]+//; s/[[:space:]\"'\\\\]+$//")
USER_MNEMONIC=$(echo "$USER_MNEMONIC" | sed -E "s/^[[:space:]\"'\\\\]+//; s/[[:space:]\"'\\\\]+$//")
USER_MNEMONIC=$(echo "$USER_MNEMONIC" | xargs 2>/dev/null || echo "$USER_MNEMONIC")

# Write to wallet.env
cat <<EOF > wallet.env
# Medusa x402 Agent Wallet Configuration
AGENT_MNEMONIC="${USER_MNEMONIC}"
ADSEC_SERVER_URL="https://mesh402x.onrender.com"
EOF

if [ -n "$USER_MNEMONIC" ]; then
    echo -e "${GREEN}[+] Saved AGENT_MNEMONIC to wallet.env!${NC}"
else
    echo -e "${YELLOW}[i] Created wallet.env with placeholder AGENT_MNEMONIC=\"\"${NC}"
    echo -e "  ${YELLOW}Please paste your 25-word mnemonic into wallet.env before running paid audits.${NC}"
fi

echo -e "\n${GREEN}══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}[OK] MEDUSA x402 AGENT INSTALLATION COMPLETE!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "\n${CYAN}Available Commands for You or Your AI Agent:${NC}"
echo -e "  * ${YELLOW}npx tsx medusa-scripts/audit-full.ts <file>${NC}      - Full Audit ($0.001 USDC)"
echo -e "  * ${YELLOW}npx tsx medusa-scripts/audit-scan.ts <file>${NC}      - Pre-Flight Scan ($0.001 USDC)"
echo -e "  * ${YELLOW}npx tsx medusa-scripts/audit-remediate.ts <file>${NC} - Auto Git Diff Fixes ($0.001 USDC)"
echo -e "  * ${YELLOW}npx tsx medusa-scripts/audit-attest.ts <file>${NC}    - On-Chain Attestation ($0.001 USDC)"
echo -e "  * ${YELLOW}npx tsx medusa-scripts/wallet-history.ts${NC}        - Financial Ledger & Tx History"
echo -e "  * ${YELLOW}npx tsx medusa-scripts/check-wallet.ts${NC}          - Check Wallet Balance & Status"
echo -e "\n${CYAN}Prompt your AI assistant (Antigravity / Cursor / Claude):${NC}"
echo -e "  > ${YELLOW}\"Audit my code for security vulnerabilities using Medusa.\"${NC}\n"
