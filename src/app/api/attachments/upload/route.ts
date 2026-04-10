import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAuth, isAuthResponse } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { uploadToDrive, getOrCreateBatchModuleFolder, buildFileName } from "@/lib/drive";

export const runtime = "nodejs"; // Required for file handling

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;
  const { user } = auth;

  try {
    const formData = await req.formData();
    const file       = formData.get("file") as File | null;
    const entityType = formData.get("entityType") as string;
    const entityId   = formData.get("entityId") as string;
    const fileType   = formData.get("fileType") as string;   // "coa", "signed_bmr", "invoice_scan", etc.
    const batchNo    = formData.get("batchNo") as string;
    const description= formData.get("description") as string ?? "";

    if (!file || !entityType || !entityId) {
      return NextResponse.json({ error: "file, entityType, and entityId are required" }, { status: 400 });
    }

    // Read file into buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext    = file.name.split(".").pop() ?? "bin";

    // Build standardised filename
    const fileName = buildFileName({
      docType:     entityType.toUpperCase().replace("_RECORDS", "").replace("_", "-"),
      batchNo:     batchNo ?? "UNKNOWN",
      description: fileType ?? "document",
      ext,
    });

    // Get or create the Drive folder for this batch + module
    const folderId = await getOrCreateBatchModuleFolder(batchNo ?? "MISC", entityType);

    // Upload to Drive
    const driveResult = await uploadToDrive({
      buffer,
      fileName,
      mimeType:    file.type || "application/octet-stream",
      folderId,
      description: `Entity: ${entityType} | ID: ${entityId} | Uploaded by: ${user.email} | ${description}`,
    });

    // Save metadata to Supabase (not the file itself)
    const supabase = createServiceClient();

    // Check for existing latest version to chain versions
    const { data: existing } = await supabase
      .from("attachments")
      .select("id, version")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .eq("is_latest", true)
      .eq("file_type", fileType ?? "")
      .order("version", { ascending: false })
      .limit(1)
      .single();

    const newVersion = existing ? existing.version + 1 : 1;

    // Mark old version as not latest
    if (existing) {
      await supabase
        .from("attachments")
        .update({ is_latest: false })
        .eq("id", existing.id);
    }

    const { data: attachment, error } = await supabase
      .from("attachments")
      .insert({
        entity_type:          entityType,
        entity_id:            entityId,
        drive_file_id:        driveResult.fileId,
        drive_view_url:       driveResult.viewUrl,
        drive_download_url:   driveResult.downloadUrl,
        drive_folder_id:      folderId,
        file_name:            fileName,
        file_type:            fileType ?? null,
        mime_type:            file.type,
        file_size_bytes:      buffer.length,
        version:              newVersion,
        is_latest:            true,
        previous_version_id:  existing?.id ?? null,
        uploaded_by:          user.id,
        uploaded_by_name:     user.full_name,
        description:          description || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    await logAudit({
      user,
      action:         "UPLOAD",
      entityType,
      entityId,
      entityDisplay:  fileName,
      newValues:      { drive_file_id: driveResult.fileId, file_name: fileName, version: newVersion },
    });

    return NextResponse.json({ data: attachment }, { status: 201 });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[UPLOAD ERROR]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET: list attachments for an entity
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType");
  const entityId   = searchParams.get("entityId");
  const latestOnly = searchParams.get("latestOnly") !== "false";

  if (!entityType || !entityId) {
    return NextResponse.json({ error: "entityType and entityId required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  let query = supabase
    .from("attachments")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("uploaded_at", { ascending: false });

  if (latestOnly) query = query.eq("is_latest", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
