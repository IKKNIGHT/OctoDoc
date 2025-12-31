import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { importKey, decrypt, decryptFile } from '../utils/crypto';
import { getPaste, type EncryptedAttachment } from '../utils/api';

interface DecryptedAttachment {
  filename: string;
  fileSize: number;
  data: Blob;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function ViewPaste() {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<DecryptedAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [burnWarning, setBurnWarning] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Prevent double-fetch in React StrictMode
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchAndDecrypt = async () => {
      if (!id) {
        setError('Invalid paste URL');
        setLoading(false);
        return;
      }

      const keyString = window.location.hash.slice(1);
      if (!keyString) {
        setError('Missing decryption key in URL');
        setLoading(false);
        return;
      }

      try {
        const paste = await getPaste(id);

        if (paste.burnAfterReading) {
          setBurnWarning(true);
        }

        const key = await importKey(keyString);
        const decrypted = await decrypt(paste.encryptedContent, paste.iv, key);
        setContent(decrypted);

        // Decrypt attachments
        if (paste.attachments && paste.attachments.length > 0) {
          const decryptedAttachments = await Promise.all(
            paste.attachments.map(async (attachment: EncryptedAttachment) => {
              const { data, filename } = await decryptFile(
                attachment.encryptedData,
                attachment.iv,
                attachment.encryptedFilename,
                attachment.filenameIv,
                key
              );
              return {
                filename,
                fileSize: attachment.fileSize,
                data,
              };
            })
          );
          setAttachments(decryptedAttachments);
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes('not found') || err.message.includes('expired')) {
            setError('This paste has expired or been deleted');
          } else if (err.message.includes('decrypt')) {
            setError('Failed to decrypt paste. The link may be corrupted.');
          } else {
            setError(err.message);
          }
        } else {
          setError('Failed to load paste');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAndDecrypt();
  }, [id]);

  const downloadAttachment = (attachment: DecryptedAttachment) => {
    const url = URL.createObjectURL(attachment.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Decrypting paste...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="message error">{error}</div>
        <div className="new-paste-link">
          <Link to="/">Create a new paste</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {burnWarning && (
        <div className="message warning">
          This paste has been deleted after viewing. Save the content if needed.
        </div>
      )}
      <div className="paste-content" dangerouslySetInnerHTML={{ __html: content }} />

      {attachments.length > 0 && (
        <div className="attachments-section view-attachments">
          <div className="attachments-header">
            <label>Attachments ({attachments.length})</label>
          </div>
          <div className="file-list">
            {attachments.map((attachment, index) => (
              <div key={index} className="file-item">
                <span className="file-icon">📎</span>
                <span className="file-name">{attachment.filename}</span>
                <span className="file-size">{formatFileSize(attachment.fileSize)}</span>
                <button
                  type="button"
                  className="btn btn-secondary download-btn"
                  onClick={() => downloadAttachment(attachment)}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="new-paste-link">
        <Link to="/">Create a new paste</Link>
      </div>
    </div>
  );
}
