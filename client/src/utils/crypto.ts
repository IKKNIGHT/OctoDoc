// AES-256-GCM encryption using Web Crypto API

export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyString);
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

export async function encrypt(
  plaintext: string,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return {
    ciphertext: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
  };
}

export async function decrypt(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const ciphertextBuffer = base64ToArrayBuffer(ciphertext);
  const ivBuffer = base64ToArrayBuffer(iv);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    ciphertextBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export async function encryptFile(
  file: File,
  key: CryptoKey
): Promise<{ encryptedData: string; iv: string; encryptedFilename: string; filenameIv: string; fileSize: number }> {
  const fileBuffer = await file.arrayBuffer();

  // Encrypt file data
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBuffer
  );

  // Encrypt filename
  const filenameIv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encryptedFilename = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: filenameIv },
    key,
    encoder.encode(file.name)
  );

  return {
    encryptedData: arrayBufferToBase64(encryptedData),
    iv: arrayBufferToBase64(iv),
    encryptedFilename: arrayBufferToBase64(encryptedFilename),
    filenameIv: arrayBufferToBase64(filenameIv),
    fileSize: file.size,
  };
}

export async function decryptFile(
  encryptedData: string,
  iv: string,
  encryptedFilename: string,
  filenameIv: string,
  key: CryptoKey
): Promise<{ data: Blob; filename: string }> {
  // Decrypt file data
  const dataBuffer = base64ToArrayBuffer(encryptedData);
  const ivBuffer = base64ToArrayBuffer(iv);
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    dataBuffer
  );

  // Decrypt filename
  const filenameBuffer = base64ToArrayBuffer(encryptedFilename);
  const filenameIvBuffer = base64ToArrayBuffer(filenameIv);
  const decryptedFilename = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: filenameIvBuffer },
    key,
    filenameBuffer
  );

  const decoder = new TextDecoder();
  const filename = decoder.decode(decryptedFilename);

  return {
    data: new Blob([decryptedData]),
    filename,
  };
}

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
