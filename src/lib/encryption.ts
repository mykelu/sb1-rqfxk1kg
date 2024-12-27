import { getRandomValues } from 'crypto';

// Generate a random 256-bit key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Generate a random IV for AES-GCM
export function generateIV(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

// Encrypt a message for multiple recipients
export async function encryptMessage(
  message: string,
  recipientPublicKeys: string[]
): Promise<{ encryptedContent: string; iv: string }> {
  // Generate a random content encryption key and IV
  const contentKey = await generateEncryptionKey();
  const iv = generateIV();

  // Encrypt the message content
  const encoder = new TextEncoder();
  const messageData = encoder.encode(message);
  
  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    contentKey,
    messageData
  );

  // Export the content key
  const rawKey = await window.crypto.subtle.exportKey('raw', contentKey);

  // Encrypt the content key for each recipient
  const encryptedKeys = await Promise.all(
    recipientPublicKeys.map(async (publicKey) => {
      const importedPublicKey = await window.crypto.subtle.importKey(
        'spki',
        Buffer.from(publicKey, 'base64'),
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256'
        },
        true,
        ['encrypt']
      );

      return window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP'
        },
        importedPublicKey,
        rawKey
      );
    })
  );

  // Combine encrypted content and keys
  return {
    encryptedContent: Buffer.from(encryptedContent).toString('base64'),
    iv: Buffer.from(iv).toString('base64')
  };
}

// Decrypt a message using the recipient's private key
export async function decryptMessage(
  encryptedContent: string,
  iv: string,
  privateKey: CryptoKey
): Promise<string> {
  try {
    // Decrypt the content
    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: Buffer.from(iv, 'base64')
      },
      privateKey,
      Buffer.from(encryptedContent, 'base64')
    );

    // Decode the decrypted content
    const decoder = new TextDecoder();
    return decoder.decode(decryptedContent);
  } catch (error) {
    console.error('Failed to decrypt message:', error);
    throw new Error('Failed to decrypt message');
  }
}