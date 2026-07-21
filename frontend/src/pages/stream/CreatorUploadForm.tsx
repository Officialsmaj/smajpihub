import { useState, type FormEvent } from "react";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { uploadCreatorVideo } from "../../lib/streamCreator";

const CreatorUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) { setStatus("error"); setMessage("Choose a video file first."); return; }
    const data = new FormData(event.currentTarget);
    try {
      setStatus("uploading"); setMessage("");
      await uploadCreatorVideo(file, {
        title: String(data.get("title") || ""), description: String(data.get("description") || ""),
        category: String(data.get("category") || "Entertainment"), visibility: String(data.get("visibility") || "private"),
        rightsConfirmed: data.get("rightsConfirmed") === "on",
      }, setProgress);
      setStatus("processing"); setMessage("Upload complete. Cloudflare is processing the video and SMAJ moderation is pending.");
    } catch (error) {
      setStatus("error");
      const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setMessage(responseMessage || (error instanceof Error ? error.message : "Video upload failed."));
    }
  };

  return <form className="sw-form" onSubmit={(event) => void submit(event)}>
    <label className={`sw-drop ${file ? "selected" : ""}`}><CloudUploadRoundedIcon /><b>{file ? file.name : "Choose a video to upload"}</b><span>MP4, WebM or MOV · initial limit 200 MB</span><input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => { const next = event.target.files?.[0] || null; setFile(next); setProgress(0); setStatus("idle"); setMessage(""); }} /></label>
    {file && file.size > 200 * 1024 * 1024 ? <p className="sw-upload-message error">This file is over 200 MB. Large resumable uploads will be added in the tus phase.</p> : null}
    <label>Title<input name="title" required maxLength={140} placeholder="Give your video a clear title" /></label>
    <label>Description<textarea name="description" required minLength={20} maxLength={3000} rows={4} placeholder="Tell viewers about this video and who created it" /></label>
    <div><label>Category<select name="category"><option>Entertainment</option><option>Film</option><option>Series</option><option>Music</option><option>Learning</option><option>Sports</option></select></label><label>Visibility<select name="visibility" defaultValue="private"><option value="private">Private until approved</option><option value="unlisted">Unlisted</option><option value="public">Public after approval</option></select></label></div>
    <label className="sw-rights-confirm"><input name="rightsConfirmed" type="checkbox" required /><span><b>I own or control the distribution rights</b><small>I authorize SMAJ Stream to store, process and display this video according to the selected visibility and platform terms.</small></span></label>
    {status === "uploading" ? <div className="sw-upload-progress"><i style={{ width: `${progress}%` }} /><span>{progress}% uploaded</span></div> : null}
    {message ? <p className={`sw-upload-message ${status === "error" ? "error" : "success"}`}>{status === "processing" ? <CheckCircleRoundedIcon /> : null}{message}</p> : null}
    <button type="submit" disabled={status === "uploading" || !file || Boolean(file && file.size > 200 * 1024 * 1024)}>{status === "uploading" ? "Uploading…" : "Upload for review"}</button>
  </form>;
};

export default CreatorUploadForm;
