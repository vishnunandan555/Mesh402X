#!/usr/bin/env bash
# ==============================================================================
# 🐍 MEDUSA x402 AUTONOMOUS AGENT INSTALLER
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
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v18+ first.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected.${NC}"

# 2. Initialize package.json if not present & install packages
echo -e "\n${CYAN}[2/5] Installing x402 & Algorand SDK packages...${NC}"
if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
    npm init -y > /dev/null 2>&1
fi

npm install --save-dev @x402-avm/fetch @x402-avm/avm algosdk dotenv tsx @types/node typescript

echo -e "${GREEN}✓ Dependencies installed successfully.${NC}"

# 3. Create medusa-scripts directory & download/create scripts
echo -e "\n${CYAN}[3/5] Setting up modular Medusa audit scripts in ./medusa-scripts/...${NC}"
mkdir -p medusa-scripts
mkdir -p .agents/skills/medusa-audit/scripts

GITHUB_RAW="https://raw.githubusercontent.com/vishnunandan555/Mesh402X/main"

# Function to download or create script fallback
fetch_or_create_script() {
    local script_name="$1"
    local local_path="medusa-scripts/${script_name}"
    
    # Try downloading from GitHub
    if curl -fsSL "${GITHUB_RAW}/medusa-scripts/${script_name}" -o "${local_path}" 2>/dev/null; then
        echo -e "  ${GREEN}✓ Downloaded ${script_name}${NC}"
    fi
}

SCRIPTS=("audit-full.ts" "audit-scan.ts" "audit-remediate.ts" "audit-attest.ts" "audit-dev.ts" "check-wallet.ts" "optin-usdc.ts" "generate-wallet.ts")

for s in "${SCRIPTS[@]}"; do
    fetch_or_create_script "$s"
done

# Copy to .agents/skills
cp medusa-scripts/*.ts .agents/skills/medusa-audit/scripts/ 2>/dev/null || true

# 4. Download / Install Medusa_Skill.md
echo -e "\n${CYAN}[4/5] Installing Medusa Agent Skill specification...${NC}"
curl -fsSL "${GITHUB_RAW}/Medusa_Skill.md" -o "Medusa_Skill.md" 2>/dev/null || true
curl -fsSL "${GITHUB_RAW}/Medusa_Skill.md" -o ".agents/skills/medusa-audit/SKILL.md" 2>/dev/null || true
echo -e "${GREEN}✓ Medusa_Skill.md & .agents/skills/medusa-audit/SKILL.md configured.${NC}"

# 5. Wallet Configuration in .env
echo -e "\n${CYAN}[5/5] Configuring Agent Algorand Wallet (.env)...${NC}"

ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
fi

USER_MNEMONIC=""
USER_ADDRESS=""

if grep -q "AGENT_MNEMONIC" "$ENV_FILE" && [ -n "$(grep -E "^AGENT_MNEMONIC=.+" "$ENV_FILE")" ]; then
    echo -e "${GREEN}✓ Existing AGENT_MNEMONIC detected in .env.${NC}"
else
    echo -e "${YELLOW}Please enter your Algorand TestNet wallet credentials for your agent:${NC}"
    
    # Read from /dev/tty if available (works even when script is piped via curl | bash)
    if [ -t 0 ]; then
        read -r -p "🔑 Enter your 25-word Mnemonic (AGENT_MNEMONIC): " USER_MNEMONIC
        read -r -p "💳 Enter Public Address (Optional, press Enter to auto-derive): " USER_ADDRESS
    elif [ -e /dev/tty ]; then
        read -r -p "🔑 Enter your 25-word Mnemonic (AGENT_MNEMONIC): " USER_MNEMONIC < /dev/tty
        read -r -p "💳 Enter Public Address (Optional, press Enter to auto-derive): " USER_ADDRESS < /dev/tty
    fi

    # Trim whitespace
    USER_MNEMONIC=$(echo "$USER_MNEMONIC" | xargs)
    USER_ADDRESS=$(echo "$USER_ADDRESS" | xargs)

    if [ -n "$USER_MNEMONIC" ]; then
        # Auto-derive address from mnemonic if not provided
        if [ -z "$USER_ADDRESS" ]; then
            DERIVED_ADDR=$(node -e "
              try {
                const algosdk = require('algosdk');
                const acc = algosdk.mnemonicToSecretKey('$USER_MNEMONIC');
                console.log(acc.addr);
              } catch(e) {
                console.log('');
              }
            " 2>/dev/null || echo "")
            if [ -n "$DERIVED_ADDR" ]; then
                USER_ADDRESS="$DERIVED_ADDR"
            fi
        fi

        # Save to .env
        echo "" >> "$ENV_FILE"
        echo "# Medusa x402 Agent Configuration" >> "$ENV_FILE"
        echo "AGENT_MNEMONIC=\"$USER_MNEMONIC\"" >> "$ENV_FILE"
        if [ -n "$USER_ADDRESS" ]; then
            echo "AGENT_ADDRESS=\"$USER_ADDRESS\"" >> "$ENV_FILE"
        fi
        echo "ADSEC_SERVER_URL=\"https://mesh402x.onrender.com\"" >> "$ENV_FILE"

        echo -e "${GREEN}✓ Wallet configured successfully in .env!${NC}"
        if [ -n "$USER_ADDRESS" ]; then
            echo -e "  ${CYAN}Public Address: ${YELLOW}${USER_ADDRESS}${NC}"
        fi
    else
        echo -e "${YELLOW}ℹ️  No mnemonic entered. Added placeholder to .env.${NC}"
        echo "" >> "$ENV_FILE"
        echo "# Medusa x402 Agent Configuration" >> "$ENV_FILE"
        echo "AGENT_MNEMONIC=\"\"" >> "$ENV_FILE"
        echo "ADSEC_SERVER_URL=\"https://mesh402x.onrender.com\"" >> "$ENV_FILE"
        echo -e "  ${YELLOW}Remember to add your AGENT_MNEMONIC to .env before running paid audits.${NC}"
    fi
fi

echo -e "\n${GREEN}══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 MEDUSA x402 AGENT INSTALLATION COMPLETE!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "\n${CYAN}Available Commands for You or Your AI Agent:${NC}"
echo -e "  • ${YELLOW}npx tsx medusa-scripts/audit-full.ts <file>${NC}      - Full Audit ($0.001 USDC)"
echo -e "  • ${YELLOW}npx tsx medusa-scripts/audit-scan.ts <file>${NC}      - Pre-Flight Scan ($0.001 USDC)"
echo -e "  • ${YELLOW}npx tsx medusa-scripts/audit-remediate.ts <file>${NC} - Auto Git Diff Fixes ($0.001 USDC)"
echo -e "  • ${YELLOW}npx tsx medusa-scripts/audit-attest.ts <file>${NC}    - On-Chain Attestation ($0.001 USDC)"
echo -e "  • ${YELLOW}npx tsx medusa-scripts/audit-dev.ts <file>${NC}       - Free Dev Test ($0.00)"
echo -e "  • ${YELLOW}npx tsx medusa-scripts/check-wallet.ts${NC}          - Check Wallet Balance & Status"
echo -e "\n${CYAN}Simply prompt your AI agent (Antigravity / Cursor / Claude):${NC}"
echo -e "  💬 ${YELLOW}\"Audit my code for security vulnerabilities using Medusa.\"${NC}\n"
