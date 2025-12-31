import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { importKey, decrypt } from '../utils/crypto';
import { getPaste } from '../utils/api';

export default function ViewPaste() {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState('');
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
      <div className="new-paste-link">
        <Link to="/">Create a new paste</Link>
      </div>
    </div>
  );
}
