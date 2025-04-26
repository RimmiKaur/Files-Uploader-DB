import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify

export default function FileUpload({ reloadFiles }) {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;

    // Validate that files are PDFs
    const validFiles = Array.from(selectedFiles).filter((file) =>
      file.type === "application/pdf"
    );

    if (validFiles.length !== selectedFiles.length) {
      setError("Only PDF files are allowed.");
      setFiles([]);
    } else {
      setFiles(validFiles);
      setError("");
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select files first");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    // Prepare form data
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file); // Ensure 'files' is the field name
    });

    try {
      // Send file upload request
    //   await axios.post("https://file-uploader-db-server.onrender.com/api/upload", formData, {
        await axios.post("http://localhost:8080/api/upload", formData, {
        
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percent = Math.floor((loaded * 100) / total);
          setUploadProgress(percent);
        },
      });

      setIsUploading(false);
      setUploadProgress(0);
      setSuccess("Files uploaded successfully!");
      toast.success("Files uploaded successfully!"); // Display success message using toast

      setFiles([]); // Clear selected files after successful upload

      // Trigger file list update in parent component
      reloadFiles(); // This will re-fetch the updated file list
    } catch (err) {
      setIsUploading(false);
      setError("Error uploading files. Please try again.");
      if (err.response && err.response.data) {
        toast.error(err.response.data); // Show error from backend (file size or type issues)
      } else {
        toast.error("Error uploading files. Please try again.");
      }    }
  };

  return (
    <div className="p-8 bg-gray-100 shadow-xl/30  mb-10 text-black h-fit max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center text-blue-600">Upload PDFs</h2>
      <ToastContainer /> {/* ToastContainer to display toast notifications */}
      
      {/* File Input */}
      <div>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileChange}
          className="mb-4 p-2 border border-gray-300  w-full"
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Success Message */}
      {success && <p className="text-green-500 text-center">{success}</p>}

      {/* Upload Button */}
      <div className="mt-4">
        <button
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
          className="bg-blue-500 text-white px-6 py-2 w-full transition duration-300 ease-in-out hover:bg-blue-400 disabled:bg-gray-400"
        >
          {isUploading ? "Uploading..." : "Upload Files"}
        </button>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="mt-6">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="font-semibold text-sm">Uploading...</span>
              </div>
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase text-teal-600">
                  {uploadProgress}%
                </span>
              </div>
            </div>
            <div className="flex mb-2">
              <div className="w-full bg-gray-200">
                <div
                  className="bg-teal-500 text-xs font-medium leading-none py-1 text-center text-teal-100"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
