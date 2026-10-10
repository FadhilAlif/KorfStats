/**
 * Generator UUIDv4 (AGENTS.md §3A — client_event_id wajib UUIDv4 untuk idempotensi sync).
 *
 * `crypto.randomUUID()` hanya tersedia di secure context (HTTPS / localhost).
 * Saat aplikasi dibuka dari tablet via IP LAN (http://192.168.x.x) API tersebut tidak ada,
 * sehingga disediakan fallback berbasis `crypto.getRandomValues()` (RFC 4122 v4).
 */
export function newId(): string {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
