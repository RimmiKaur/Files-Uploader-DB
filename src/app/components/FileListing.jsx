import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function FileListing({ reloadFiles }) {
  const [files, setFiles] = useState([]);
  const [filename, setFilename] = useState("");
  const [size, setSize] = useState(10); // Default to 10MB
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null); // To track which file is being deleted
  const [confirmDelete, setConfirmDelete] = useState(null); // To track which file needs confirmation for delete

  useEffect(() => {
    fetchFiles();
  }, [filename, size, currentPage]);

  useEffect(() => {
    if (reloadFiles) {
      fetchFiles(); // Re-fetch files when `reloadFiles` is triggered
    }
  }, [reloadFiles]);

  // Fetch files with filters and pagination
  const fetchFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://file-uploader-db-server.onrender.com/api/files", {
        params: {
          filename,
          size,
          page: currentPage,
          limit: 7, // Pagination limit (10 files per page)
        },
      });
      setFiles(response.data.files);
      setTotalFiles(response.data.totalFiles);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError("Error fetching files. Please try again later.");
    }
    setLoading(false);
  };

  // Handle search by filename
  const handleSearchChange = (e) => {
    setFilename(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle filter by file size
  const handleSizeChange = (e) => {
    setSize(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle pagination change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Confirm file delete
  const handleDeleteConfirmation = (filename) => {
    setConfirmDelete(filename); // Store the file to delete
  };

  // Handle file delete
  const handleDelete = async (filename) => {
    setDeleting(filename); // Track which file is being deleted
    try {
      const response = await axios.delete(`https://file-uploader-db-server.onrender.com/api/files/${filename}`);
      if (response.status === 200) {
        toast.success("File deleted successfully");
        fetchFiles(); // Re-fetch the files after successful deletion
        setConfirmDelete(null); // Reset confirmation
        setDeleting(null); // Reset deleting state
      }
    } catch (error) {
      toast.error("Error deleting file");
      setDeleting(null); // Reset deleting state if error occurs
    }
  };

  // Cancel the delete action
  const cancelDelete = () => {
    setConfirmDelete(null); // Reset confirmation state
  };

  return (
    <div className="p-8 bg-gray-100 shadow-xl/30  text-black max-w-7xl mx-auto h-fit">
      <h2 className="text-3xl font-semibold mb-4 text-center text-blue-600">Uploaded Files</h2>
      <ToastContainer />

      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by filename"
            value={filename}
            onChange={handleSearchChange}
            className="p-2 border border-gray-300 w-full sm:w-60 md:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setFilename("")}
            className="bg-gray-300 p-2 text-sm text-gray-700 hover:bg-gray-400 sm:ml-4"
          >
            Clear Search
          </button>
        </div>

        <div className="flex items-center space-x-4 w-full sm:w-auto mt-4 sm:mt-0">
          <label htmlFor="size" className="text-sm text-gray-700">Filter by Size:</label>
          <select
            id="size"
            value={size}
            onChange={handleSizeChange}
            className="p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value={10}>Less than 10 MB</option>
            <option value={5}>Less than 5 MB</option>
            <option value={1}>Less than 1 MB</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <>
          {/* Files Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto bg-white shadow-md">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Size (MB)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Upload Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.filename} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{file.filename}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{file.sizeMB.toFixed(2)} MB</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{new Date(file.uploadedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {confirmDelete === file.filename ? (
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleDelete(file.filename)}
                            className="bg-red-600 text-white px-4 py-2 hover:bg-red-500"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="bg-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteConfirmation(file.filename)}
                          className="bg-red-500 text-white px-4 py-2 hover:bg-red-400"
                        >
                          Delete
                        </button>
                      )}
                      {deleting === file.filename && (
                        <div className="text-sm text-gray-500">Deleting...</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-6 py-2 bg-blue-500 text-white disabled:bg-gray-400"
            >
              Prev
            </button>

            <div>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-6 py-2 bg-blue-500 text-white disabled:bg-gray-400"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
