#!/bin/bash

# Script to run all Python scripts with their respective virtual environments
# This script should be run from the /marketinfo directory

set -e  # Exit on any error

echo "🚀 Starting all Python scripts..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to run a script with its venv
run_script() {
    local script_dir=$1
    local script_name=$2
    local description=$3
    
    echo -e "${BLUE}📊 Running $description...${NC}"
    echo "Directory: $script_dir"
    echo "Script: $script_name"
    echo "----------------------------------------"
    
    # Check if directory exists
    if [ ! -d "$script_dir" ]; then
        echo -e "${RED}❌ Error: Directory $script_dir not found${NC}"
        return 1
    fi
    
    # Check if venv exists
    if [ ! -d "$script_dir/venv" ]; then
        echo -e "${RED}❌ Error: Virtual environment not found in $script_dir${NC}"
        return 1
    fi
    
    # Check if script exists
    if [ ! -f "$script_dir/$script_name" ]; then
        echo -e "${RED}❌ Error: Script $script_name not found in $script_dir${NC}"
        return 1
    fi
    
    # Change to script directory
    cd "$script_dir"
    
    # Activate virtual environment and run script
    source venv/bin/activate
    
    echo -e "${YELLOW}🔧 Virtual environment activated${NC}"
    echo -e "${YELLOW}🐍 Python version: $(python --version)${NC}"
    
    # Run the script
    if python "$script_name"; then
        echo -e "${GREEN}✅ $description completed successfully${NC}"
    else
        echo -e "${RED}❌ $description failed${NC}"
        deactivate
        cd ..
        return 1
    fi
    
    # Deactivate virtual environment
    deactivate
    echo -e "${YELLOW}🔒 Virtual environment deactivated${NC}"
    
    # Return to main directory
    cd ..
    
    echo -e "${GREEN}✅ $description finished${NC}"
    echo ""
}

# Main execution
echo -e "${BLUE}🏁 Starting script execution sequence...${NC}"
echo ""

# Store the original directory
ORIGINAL_DIR=$(pwd)

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "calendar" ] || [ ! -d "cli-charts" ] || [ ! -d "pushes" ]; then
    echo -e "${RED}❌ Error: Please run this script from the /marketinfo directory${NC}"
    exit 1
fi

# Array of scripts to run
declare -a scripts=(
    "calendar|economic_calendar.py|Economic Calendar Data Fetcher"
    "cli-charts|main.py|CLI Crypto Charts"
    "pushes|crypto_scraper.py|Crypto Data Scraper"
    "pushes|macro_scraper.py|Macro Data Scraper"
)

# Run each script
success_count=0
total_count=${#scripts[@]}

for script_info in "${scripts[@]}"; do
    IFS='|' read -r script_dir script_name description <<< "$script_info"
    
    if run_script "$script_dir" "$script_name" "$description"; then
        ((success_count++))
    else
        echo -e "${RED}⚠️  Continuing with remaining scripts...${NC}"
        echo ""
    fi
    
    # Add a small delay between scripts
    sleep 2
done

# Return to original directory
cd "$ORIGINAL_DIR"

# Summary
echo "================================================"
echo -e "${BLUE}📋 EXECUTION SUMMARY${NC}"
echo "================================================"
echo -e "Total scripts: $total_count"
echo -e "Successful: ${GREEN}$success_count${NC}"
echo -e "Failed: ${RED}$((total_count - success_count))${NC}"

if [ $success_count -eq $total_count ]; then
    echo -e "${GREEN}🎉 All scripts completed successfully!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some scripts failed. Check the output above for details.${NC}"
    exit 1
fi 