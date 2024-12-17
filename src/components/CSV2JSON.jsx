"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { readString, jsonToCSV } from "react-papaparse";
import { Tooltip } from "react-tooltip";
export default function CSV2JSON() {
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file.type === "text/csv" || file.type === "application/json") {
      setFileName(file.name.split(".").slice(0, -1).join(".")); // Remove extension
      const reader = new FileReader();

      reader.onload = () => {
        setFileContent(reader.result);
      };

      reader.readAsText(file);
    } else {
      toast.error("Invalid file uploaded");
      if (typeof window !== "undefined") {
        document.getElementById("fileInput").value = "";
      }
      setFileName("");
      setFileContent("");
    }
  };

  const downloadFile = (data, fileName, fileType) => {
    const blob = new Blob([data], { type: fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };

  const convertFile = () => {
    let convertedFileName = fileName;
    if (isJson(fileContent)) {
      // Convert JSON to CSV
      const csv = jsonToCSV(JSON.parse(fileContent));
      convertedFileName += ".csv";
      downloadFile(csv, convertedFileName, "text/csv");
    } else {
      // Convert CSV to JSON
      readString(fileContent, {
        complete: (results) => {
          // Fix number values being parsed as strings
          const data = results.data.map((row) => {
            for (const key in row) {
              if (!isNaN(row[key])) {
                row[key] = Number(row[key]);
              }
            }
            return row;
          });
          const json = JSON.stringify(data, null, 2);
          convertedFileName += ".json";
          downloadFile(json, convertedFileName, "application/json");
        },
        header: true,
      });
    }
    // Clear file input and reset state
    setFileContent("");
    if (typeof window !== "undefined") {
      document.getElementById("fileInput").value = "";
    }
  };

  const isJson = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };
  return (
    <div className="container my-5">
      <div className="container-main">
        <h1>File Converter</h1>
        <input
          type="file"
          id="fileInput"
          className="form-control"
          accept=".csv,.json"
          onChange={handleFileUpload}
        />
        <button onClick={convertFile}>Convert and Download</button>
      </div>
      <Tooltip anchorSelect=".container-main" place="top">
        Please Upload only .csv or .json files
      </Tooltip>
    </div>
  );
}