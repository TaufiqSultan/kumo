import { Transform, TransformCallback } from "stream";

export const allowedExtensions = [
  ".ts",
  ".png",
  ".jpg",
  ".webp",
  ".ico",
  ".html",
  ".js",
  ".css",
  ".txt",
];

export class LineTransform extends Transform {
  private buffer: string;
  private manifestUrl: string;
  private referer?: string;

  constructor(manifestUrl: string, referer?: string) {
    super();
    this.buffer = "";
    this.manifestUrl = manifestUrl;
    this.referer = referer;
  }

  _transform(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback
  ) {
    const data = this.buffer + chunk.toString();
    const lines = data.split(/\r?\n/);
    this.buffer = lines.pop() || "";

    for (const line of lines) {
      const modifiedLine = this.processLine(line);
      this.push(modifiedLine + "\n");
    }

    callback();
  }

  _flush(callback: TransformCallback) {
    if (this.buffer) {
      const modifiedLine = this.processLine(this.buffer);
      this.push(modifiedLine);
    }
    callback();
  }

  private resolveUrl(path: string): string {
    try {
        // Resolve path against manifestUrl
        // This handles:
        // - Absolute URLs (http://...) -> returns as is
        // - Root relative (/foo.ts) -> resolves against domain
        // - Relative (foo.ts) -> resolves against current path
        return new URL(path, this.manifestUrl).href;
    } catch {
        return path; // Fallback if invalid
    }
  }

  private getProxyUrl(originalUrl: string): string {
      const absoluteUrl = this.resolveUrl(originalUrl);
      let proxyUrl = `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
      if (this.referer) {
          proxyUrl += `&referer=${encodeURIComponent(this.referer)}`;
      }
      return proxyUrl;
  }

  private processLine(line: string): string {
    const trimmed = line.trim();

    // Handle URI attributes in tags like #EXT-X-I-FRAME-STREAM-INF:URI="..." or #EXT-X-MEDIA:...,URI="..."
    if (line.includes('URI="')) {
      return line.replace(/URI="([^"]+)"/g, (match, uri) => {
         return `URI="${this.getProxyUrl(uri)}"`;
      });
    }

    // Skip comments/tags that we didn't handle above
    if (trimmed.startsWith('#')) {
        return line;
    }

    // Handle standard line-based URLs (segments, variants)
    // Heuristic: If it ends with common extensions or looks like a URL
    if (
        trimmed.endsWith('.m3u8') || 
        trimmed.endsWith('.ts') ||
        allowedExtensions.some(ext => trimmed.endsWith(ext)) ||
        trimmed.startsWith('http')
    ) {
        return this.getProxyUrl(trimmed);
    }

    return line;
  }
}
