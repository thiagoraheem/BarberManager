#!/usr/bin/env python3
"""
Test runner script for BarberManager

This script provides convenient commands to run different types of tests.
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle the result"""
    print(f"\n🔍 {description}")
    print(f"💻 Running: {command}")
    print("-" * 50)
    
    try:
        result = subprocess.run(command, shell=True, check=True)
        print(f"✅ {description} completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed with exit code {e.returncode}")
        return False

def main():
    """Main test runner function"""
    print("🧪 BarberManager Test Runner")
    print("=" * 50)
    
    # Change to project directory
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    if len(sys.argv) > 1:
        test_type = sys.argv[1].lower()
    else:
        test_type = "all"
    
    success = True
    
    if test_type in ["all", "unit"]:
        # Run unit tests
        success &= run_command(
            "python -m pytest tests/ -m 'not integration' --tb=short",
            "Unit Tests"
        )
    
    if test_type in ["all", "integration"]:
        # Run integration tests
        success &= run_command(
            "python -m pytest tests/ -m 'integration' --tb=short",
            "Integration Tests"
        )
    
    if test_type in ["all", "coverage"]:
        # Run tests with coverage
        success &= run_command(
            "python -m pytest tests/ --cov=backend --cov-report=html --cov-report=term",
            "Coverage Analysis"
        )
    
    if test_type == "quick":
        # Run quick tests only
        success &= run_command(
            "python -m pytest tests/ -x --tb=line",
            "Quick Tests (stop on first failure)"
        )
    
    if test_type == "auth":
        # Run authentication tests only
        success &= run_command(
            "python -m pytest tests/test_auth.py -v",
            "Authentication Tests"
        )
    
    if test_type == "api":
        # Run all API tests
        success &= run_command(
            "python -m pytest tests/ -k 'test_' --tb=short",
            "API Tests"
        )
    
    # Summary
    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests completed successfully!")
        print("\n📊 Coverage report generated in: htmlcov/index.html")
    else:
        print("💥 Some tests failed. Check the output above for details.")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ["-h", "--help"]:
        print("""
🧪 BarberManager Test Runner

Usage: python run_tests.py [test_type]

Available test types:
  all        - Run all tests (default)
  unit       - Run unit tests only
  integration- Run integration tests only
  coverage   - Run tests with coverage analysis
  quick      - Run tests with stop on first failure
  auth       - Run authentication tests only
  api        - Run API tests only
  
Examples:
  python run_tests.py all
  python run_tests.py unit
  python run_tests.py coverage
  python run_tests.py quick
        """)
    else:
        main()