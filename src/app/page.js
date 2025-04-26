"use client"

import { useState } from "react";
import FileListing from "./components/FileListing";
import FileUpload from "./components/FileUpload";

export default function Home() {
  const [reload, setReload] = useState(false);

  // Reload file list function
  const reloadFiles = () => {
    setReload(true); // Toggle to trigger re-fetch
  };

  return (
    <div className="h-screen lg:flex lg:p-4 p-10  justify-center box-border bg-gray-50">
      <FileUpload reloadFiles={reloadFiles} />
      <FileListing reloadFiles={reload} />
    </div>
  );
}
