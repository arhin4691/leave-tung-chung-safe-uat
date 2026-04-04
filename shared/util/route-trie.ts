/**
 * RouteTrie — compact prefix tree for bus route number prediction.
 *
 * All keys are normalised to UPPERCASE for case-insensitive matching.
 * Each leaf stores the original route strings that end there, enabling
 * both prefix enumeration and exact-match detection in O(k) time where
 * k = length of the prefix string.
 *
 * Typical usage
 * ─────────────
 *   const trie = buildTrie(["E21", "E21A", "K12", "961"]);
 *   trie.nextChars("")        // Set { "E", "K", "9" }
 *   trie.nextChars("E")       // Set { "2" }
 *   trie.nextChars("E2")      // Set { "1" }
 *   trie.nextChars("E21")     // Set { "A" }
 *   trie.matches("E21", 10)   // ["E21", "E21A"]
 *   trie.isExact("E21")       // true
 */

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  /** Complete route strings that terminate exactly at this depth. */
  routes: string[] = [];
}

export class RouteTrie {
  private root: TrieNode = new TrieNode();

  /** Insert a route number (stored as-is; lookup is case-insensitive). */
  insert(route: string): void {
    let node = this.root;
    for (const ch of route.toUpperCase()) {
      let child = node.children.get(ch);
      if (!child) {
        child = new TrieNode();
        node.children.set(ch, child);
      }
      node = child;
    }
    // Avoid duplicate entries (e.g. same route inserted via outbound + inbound)
    if (!node.routes.includes(route)) {
      node.routes.push(route);
    }
  }

  /**
   * Returns the set of valid next characters that can follow `prefix`.
   * An empty prefix returns all valid starting characters.
   */
  nextChars(prefix: string): Set<string> {
    const node = this._walk(prefix);
    if (!node) return new Set();
    return new Set(node.children.keys());
  }

  /**
   * Returns up to `max` complete route numbers whose string starts with
   * `prefix` (case-insensitive), sorted shortest-first then alphabetically.
   */
  matches(prefix: string, max = 20): string[] {
    const node = this._walk(prefix);
    if (!node) return [];
    const result: string[] = [];
    this._collect(node, result, max * 2); // over-collect then sort + trim
    return result
      .sort(
        (a, b) =>
          a.length - b.length ||
          a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
      )
      .slice(0, max);
  }

  /** Returns true if `input` matches an inserted route exactly. */
  isExact(input: string): boolean {
    const node = this._walk(input);
    return !!node && node.routes.length > 0;
  }

  // ── Internals ──────────────────────────────────────────────────

  private _walk(prefix: string): TrieNode | null {
    let node = this.root;
    for (const ch of prefix.toUpperCase()) {
      const next = node.children.get(ch);
      if (!next) return null;
      node = next;
    }
    return node;
  }

  private _collect(node: TrieNode, result: string[], max: number): void {
    if (result.length >= max) return;
    for (const r of node.routes) {
      result.push(r);
      if (result.length >= max) return;
    }
    for (const child of node.children.values()) {
      this._collect(child, result, max);
      if (result.length >= max) return;
    }
  }
}

/** Convenience factory: builds a RouteTrie from an array of route strings. */
export function buildTrie(routes: string[]): RouteTrie {
  const trie = new RouteTrie();
  for (const r of routes) trie.insert(r);
  return trie;
}
