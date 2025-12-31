import { useState } from 'react';
import { generateKey, exportKey, encrypt } from '../utils/crypto';
import { createPaste } from '../utils/api';
import RichTextEditor from './RichTextEditor';

export default function CreatePaste() {
  const [content, setContent] = useState('<p></p>');
  const [expiresIn, setExpiresIn] = useState('1d');
  const [burnAfterReading, setBurnAfterReading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    // Check if content is empty (just empty paragraph tags)
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    if (!strippedContent) {
      setError('Please enter some content');
      return;
    }

    setLoading(true);
    setError('');
    setShareUrl('');

    try {
      const key = await generateKey();
      const { ciphertext, iv } = await encrypt(content, key);
      const keyString = await exportKey(key);

      const response = await createPaste({
        encryptedContent: ciphertext,
        iv,
        burnAfterReading,
        expiresIn: expiresIn === 'never' ? undefined : expiresIn,
      });

      const url = `${window.location.origin}/paste/${response.id}#${keyString}`;
      setShareUrl(url);
      setContent('<p></p>');
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
