import os
import sys
import vtk
import pydicom

# Get folder paths from environment variables
dicom_folder = os.environ.get("DATAIN")
output_folder = os.environ.get("DATAOUT")

if not dicom_folder or not output_folder:
    print("Environment variables DATAIN and DATAOUT must be set.")
    sys.exit(1)

# Ensure the output folder exists
os.makedirs(output_folder, exist_ok=True)

# Function to process DICOM and export 3D model
def process_dicom_to_3d_and_export(folder_path, output_path):
    reader = vtk.vtkDICOMImageReader()
    reader.SetDirectoryName(folder_path)
    reader.Update()

    marching_cubes = vtk.vtkMarchingCubes()
    marching_cubes.SetInputConnection(reader.GetOutputPort())
    marching_cubes.SetValue(0, 500)  # Adjust the isovalue as needed
    marching_cubes.Update()

    stl_writer = vtk.vtkSTLWriter()
    stl_writer.SetInputConnection(marching_cubes.GetOutputPort())
    stl_writer.SetFileName(output_path)
    stl_writer.Write()

    print(f"3D model saved to: {output_path}")

# Define the output STL file path
output_file = os.path.join(output_folder, "dicom_model.stl")

# Process DICOM files
process_dicom_to_3d_and_export(dicom_folder, output_file)