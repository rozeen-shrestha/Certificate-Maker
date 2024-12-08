"use client";

import { useState, useRef, useEffect } from "react";

export default function CertificateGeneratorPage() {
  const [certificateTemplate, setCertificateTemplate] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const handleCertificateTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image")) {
      const reader = new FileReader();
      reader.onload = () => setCertificateTemplate(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file for the certificate template.");
    }
  };

  const addField = () => {
    setFields([
      ...fields,
      { id: Date.now(), text: "", x: position.x, y: position.y, centered: false, fontSize: 20, fontFamily: "Arial", textColor: "#000000" },
    ]);
  };

  const updateField = (id, key, value) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  const handleCanvasClick = (e) => {
    if (!selectedFieldId || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    updateField(selectedFieldId, "x", x);
    updateField(selectedFieldId, "y", y);

    setSelectedFieldId(null);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (certificateTemplate) {
      drawOnCanvas();
    }
  }, [fields, certificateTemplate]);

  const drawOnCanvas = () => {
    if (!canvasRef.current || !certificateTemplate) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = certificateTemplate;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      fields.forEach(({ text, x, y, centered, fontSize, fontFamily, textColor }) => {
        ctx.fillStyle = textColor || "black";
        ctx.font = `${fontSize || 20}px ${fontFamily || "Arial"}`;
        const textWidth = ctx.measureText(text).width;
        const adjustedX = centered ? x - textWidth / 2 : x;
        const adjustedY = centered ? y + 10 : y;
        ctx.fillText(text, adjustedX, adjustedY);
      });
    };
  };

  const exportCertificate = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.download = "final_certificate.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {certificateTemplate ? (
          <canvas
            ref={canvasRef}
            className="border"
            onClick={handleCanvasClick}
            style={{
              cursor: selectedFieldId ? "crosshair" : "default",
              maxWidth: "100%",
              height: "auto",
            }}
          />
        ) : (
          <p className="text-gray-500 text-lg">Upload a certificate template to get started.</p>
        )}
      </div>

      <div className="w-auto max-w-xs bg-gray-900 p-4 flex flex-col gap-6 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">Certificate Generator V-0.1</h1>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Upload Certificate Template:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCertificateTemplateUpload}
            className="mb-2 w-full border border-gray-600 px-2 py-1 rounded text-black"
          />
        </div>

        <button
          onClick={addField}
          className="px-4 py-2 bg-blue-500 text-white rounded w-full"
        >
          Add Text Field
        </button>

        <div className="flex flex-col gap-4">
          {fields.map(({ id, text, x, y, centered, fontSize, fontFamily, textColor }) => (
            <div key={id} className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Enter text"
                value={text}
                onChange={(e) => updateField(id, "text", e.target.value)}
                className="border border-gray-600 px-2 py-1 rounded text-black"
              />

              <div>
                <span className="text-sm">Font Size:</span>
                <input
                  type="number"
                  value={fontSize || 20}
                  onChange={(e) => updateField(id, "fontSize", parseInt(e.target.value))}
                  className="border border-gray-600 px-2 py-1 rounded text-black w-full mt-1"
                />
              </div>

              <div>
                <span className="text-sm">Font Family:</span>
                <select
                  value={fontFamily || 'Arial'}
                  onChange={(e) => updateField(id, "fontFamily", e.target.value)}
                  className="border border-gray-600 px-2 py-1 rounded text-black w-full mt-1"
                >
                  <option value="Arial">Arial</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>

              <div>
                <span className="text-sm">Text Color:</span>
                <input
                  type="color"
                  value={textColor || '#000000'}
                  onChange={(e) => updateField(id, "textColor", e.target.value)}
                  className="w-full mt-1"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="text-sm">X Position:</span>
                  <input
                    type="number"
                    value={x}
                    onChange={(e) => updateField(id, "x", parseInt(e.target.value))}
                    className="border border-gray-600 px-2 py-1 rounded text-black w-full mt-1"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-sm">Y Position:</span>
                  <input
                    type="number"
                    value={y}
                    onChange={(e) => updateField(id, "y", parseInt(e.target.value))}
                    className="border border-gray-600 px-2 py-1 rounded text-black w-full mt-1"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={centered}
                  onChange={(e) => updateField(id, "centered", e.target.checked)}
                />
                Center
              </label>
              <button
                onClick={() => setSelectedFieldId(id)}
                className={`px-4 py-2 rounded ${
                  selectedFieldId === id
                    ? "bg-red-500 text-white"
                    : "bg-gray-500 text-white"
                } mt-2`}
              >
                {selectedFieldId === id ? "Selecting..." : "Select Position"}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={exportCertificate}
          className="px-4 py-2 bg-green-500 text-white rounded w-full mt-4"
        >
          Export Certificate
        </button>
      </div>
    </div>
  );
}
