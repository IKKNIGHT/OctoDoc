import { useState, useRef } from 'react';
import { generateKey, exportKey, encrypt, encryptFile } from '../utils/crypto';
import { createPaste } from '../utils/api';
import RichTextEditor from './RichTextEditor';

interface FileWithPreview {
  file: File;
  id: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function CreatePaste() {
  const [content, setContent] = useState('<p></p>');
  const [expiresIn, setExpiresIn] = useState('1d');
  const [burnAfterReading, setBurnAfterReading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: FileWithPreview[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      // Limit file size to 25MB
      if (file.size > 25 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum size is 25MB.`);
        continue;
      }
      newFiles.push({
        file,
        id: crypto.randomUUID(),
      });
    }

    setFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async () => {
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    if (!strippedContent && files.length === 0) {
      setError('Please enter some content or attach files');
      return;
    }

    setLoading(true);
    setError('');
    setShareUrl('');

    try {
      const key = await generateKey();
      const { ciphertext, iv } = await encrypt(content, key);
      const keyString = await exportKey(key);

      // Encrypt all files
      const encryptedAttachments = await Promise.all(
        files.map((f) => encryptFile(f.file, key))
      );

      const response = await createPaste({
        encryptedContent: ciphertext,
        iv,
        burnAfterReading,
        expiresIn: expiresIn === 'never' ? undefined : expiresIn,
        attachments: encryptedAttachments,
      });

      const url = `${window.location.origin}/paste/${response.id}#${keyString}`;
      setShareUrl(url);
      setContent('<p></p>');
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create paste');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const handleNew = () => {
    setShareUrl('');
    setContent('<p></p>');
    setBurnAfterReading(false);
    setExpiresIn('1d');
    setFiles([]);
  };

  if (shareUrl) {
    return (
      <div className="card">
        <div className="message success">
          Paste created successfully! Share the link below.
          {burnAfterReading && (
            <span> This paste will be deleted after viewing.</span>
          )}
        </div>
        <div className="share-url">
          <div className="share-url-header">
            <span>Share URL</span>
            <button
              className={`btn btn-secondary ${copied ? 'copied' : ''}`}
              onClick={copyToClipboard}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
        </div>
        <div className="new-paste-link">
          <button className="btn" onClick={handleNew}>
            Create New Paste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {error && <div className="message error">{error}</div>}

      <RichTextEditor
        content={content}
        onChange={setContent}
        disabled={loading}
      />

      {/* File Attachments */}
      <div className="attachments-section">
        <div className="attachments-header">
          <label>Attachments</label>
          <button
            type="button"
            className="btn btn-secondary attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            + Add Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {files.length > 0 && (
          <div className="file-list">
            {files.map((f) => (
              <div key={f.id} className="file-item">
                <span className="file-icon">📎</span>
                <span className="file-name">{f.file.name}</span>
                <span className="file-size">{formatFileSize(f.file.size)}</span>
                <button
                  type="button"
                  className="file-remove"
                  onClick={() => removeFile(f.id)}
                  disabled={loading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="options">
        <div className="option-group">
          <label>Expires</label>
          <select
            className="select"
            value={expiresIn}
            onChange={(e) => setExpiresIn(e.target.value)}
            disabled={loading}
          >
            <option value="5m">5 minutes</option>
            <option value="10m">10 minutes</option>
            <option value="30m">30 minutes</option>
            <option value="1h">1 hour</option>
            <option value="6h">6 hours</option>
            <option value="12h">12 hours</option>
            <option value="1d">1 day</option>
            <option value="3d">3 days</option>
            <option value="1w">1 week</option>
            <option value="1M">1 month</option>
            <option value="never">Never</option>
          </select>
        </div>

        <div className="option-group">
          <label>&nbsp;</label>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="burn"
              checked={burnAfterReading}
              onChange={(e) => setBurnAfterReading(e.target.checked)}
              disabled={loading}
            />
            <span>Burn after reading</span>
          </div>
        </div>
      </div>

      <div className="actions">
        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Encrypting...' : 'Create Paste'}
        </button>
      </div>
    </div>
  );
}
