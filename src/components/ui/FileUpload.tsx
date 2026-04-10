"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { AttachmentRow, Btn } from "@/components/ui";
import type { Attachment } from "@/types";

interface Props {
  entityType: string;
  entityId:   string;
  batchNo:    string;
  fileType?:  string;
  label?:     string;
  existingAttachments?: Attachment[];
  onUploaded?: (attachment: Attachment) => void;
  readOnly?:  boolean;
}

const FILE_TYPE_OPTIONS = [
  "coa", "signed_bmr", "signed_dispensing", "qc_report",
  "invoice_scan", "grn_scan", "release_cert", "deviation_report",
  "stability_data", "other",
];

export default function FileUpload({
  entityType, entityId, batchNo, fileType: defaultType,
  label = "Attach Document", existingAttachments = [], onUploaded, readOnly,
}: Props) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState(defaultType ?? "other");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>(existingAttachments);

  const handleFile = async (file: File) => {
    setUploading(true);
    const toastId = toast.loading(`Uploading ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entityType", entityType);
      formData.append("entityId", entityId);
      formData.append("batchNo", batchNo);
      formData.append("fileType", fileType);
      formData.append("description", description);

      const res = await fetch("/api/attachments/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error((await res.json()).error);
      const { data } = await res.json();

      setAttachments((prev) => [data, ...prev]);
      setDescription("");
      onUploaded?.(data);
      toast.success("Uploaded to Google Drive", { id: toastId });
    } catch (e) {
      toast.error((e as Error).message ?? "Upload failed", { id: toastId });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {/* Existing attachments */}
      {attachments.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
            Attachments ({attachments.length})
          </div>
          {attachments.map((att) => (
            <AttachmentRow
              key={att.id}
              name={att.file_name}
              url={att.drive_view_url}
              uploadedBy={att.uploaded_by_name ?? undefined}
              uploadedAt={att.uploaded_at}
            />
          ))}
        </div>
      )}

      {/* Upload area */}
      {!readOnly && (
        <div style={{
          border: "1px dashed var(--border2)", borderRadius: 8, padding: 16,
          background: "rgba(61,142,247,0.02)", textAlign: "center",
        }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {!defaultType && (
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                style={{ padding: "5px 10px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 5, color: "var(--text)", fontSize: 12, appearance: "none" }}
              >
                {FILE_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            )}
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              style={{ padding: "5px 10px", background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 5, color: "var(--text)", fontSize: 12, width: 200 }}
            />
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.xlsx,.docx,.csv"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            style={{ cursor: "pointer", color: "var(--muted)", fontSize: 13 }}
          >
            <div style={{ fontSize: 24, marginBottom: 6, opacity: 0.5 }}>📎</div>
            <div>{uploading ? "Uploading..." : label}</div>
            <div style={{ fontSize: 11, marginTop: 4, color: "var(--border2)" }}>
              Drop a file or click to browse · PDF, JPG, PNG, XLSX accepted
            </div>
            <div style={{ fontSize: 10, marginTop: 2, color: "var(--border2)" }}>
              Files upload directly to Google Drive under <code style={{ fontFamily: "monospace" }}>BATCHES/{batchNo}/{entityType.toUpperCase()}/</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
