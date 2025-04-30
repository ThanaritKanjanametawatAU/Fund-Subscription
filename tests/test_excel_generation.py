import os
import sys
import unittest
from pathlib import Path

# Add the parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.process_files import process_fund_subscription

class TestExcelGeneration(unittest.TestCase):
    def setUp(self):
        # Create test data directory if it doesn't exist
        self.test_data_dir = Path("test_data")
        self.test_data_dir.mkdir(exist_ok=True)
        
        # Define paths
        self.master_file_path = self.test_data_dir / "MasterFile.xlsx"
        self.data_file_path = self.test_data_dir / "Data.xlsx"
        self.output_path = Path("tests/output/test_output.xlsx")
        
        # Create output directory
        self.output_path.parent.mkdir(exist_ok=True, parents=True)
        
        # Test report date
        self.report_date = "01/01/2023"
    
    def test_dependencies_installed(self):
        """Test that all required dependencies are installed"""
        try:
            import pandas as pd
            import numpy as np
            import openpyxl
            self.assertTrue(True, "Dependencies are installed correctly")
        except ImportError as e:
            self.fail(f"Dependency import failed: {e}")
    
    def test_excel_generation(self):
        """Test Excel file generation with sample files"""
        # Skip test if sample files don't exist
        if not self.master_file_path.exists() or not self.data_file_path.exists():
            self.skipTest(
                f"Sample files not found at {self.master_file_path} and {self.data_file_path}. "
                "Please place test files before running this test."
            )
        
        try:
            # Read sample files
            with open(self.master_file_path, "rb") as f:
                master_file_content = f.read()
            with open(self.data_file_path, "rb") as f:
                data_file_content = f.read()
            
            # Process the files
            result = process_fund_subscription(
                master_file_content, 
                data_file_content, 
                self.report_date
            )
            
            # Save the result
            with open(self.output_path, "wb") as f:
                f.write(result)
            
            # Verify the file exists and has content
            self.assertTrue(os.path.exists(self.output_path))
            self.assertGreater(os.path.getsize(self.output_path), 0)
            
            print(f"Excel file generated successfully at {self.output_path.absolute()}")
            
        except Exception as e:
            self.fail(f"Excel generation failed: {e}")
    
    def test_input_validation(self):
        """Test input validation in the process_fund_subscription function"""
        # Test with empty master file
        with self.assertRaises(Exception):
            process_fund_subscription(b"", b"some data", self.report_date)
        
        # Test with empty data file
        with self.assertRaises(Exception):
            process_fund_subscription(b"some data", b"", self.report_date)
        
        # Test with invalid report date
        with self.assertRaises(Exception):
            process_fund_subscription(b"some data", b"some data", "")

if __name__ == "__main__":
    unittest.main() 