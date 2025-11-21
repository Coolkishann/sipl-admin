import React, { useState } from "react";

const UploadImage = ({ property, record, onChange }) => {
  const [loading, setLoading] = useState(false);

  const uploadFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    // save Cloudinary URL
    onChange(property.name, data.url);
  };

  return (
    <div>
      <input type="file" onChange={uploadFile} />
      {loading && <p>Uploading...</p>}

      {record.params[property.name] && (
        <img
          src={record.params[property.name]}
          alt="Preview"
          style={{ width: "200px", marginTop: "10px", borderRadius: "8px" }}
        />
      )}
    </div>
  );
};

export default UploadImage;
