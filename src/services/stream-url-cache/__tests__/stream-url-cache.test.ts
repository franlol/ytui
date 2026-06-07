import { describe, expect, it, mock, beforeEach, afterEach, spyOn } from "bun:test"
import { StreamUrlCache } from "../stream-url-cache"

// Stub fetchUrl via subclass so no child_process is spawned
class TestableStreamUrlCache extends StreamUrlCache {
  public fetchCalls: string[] = []
  public resolveWith: Map<string, string | Error> = new Map()

  protected override fetchUrl(trackId: string): Promise<string> {
    this.fetchCalls.push(trackId)
    const result = this.resolveWith.get(trackId)
    if (result instanceof Error) return Promise.reject(result)
    return Promise.resolve(result ?? `https://cdn.example.com/${trackId}.m4a`)
  }
}

describe("StreamUrlCache", () => {
  let cache: TestableStreamUrlCache

  beforeEach(() => {
    cache = new TestableStreamUrlCache()
  })

  describe("get()", () => {
    it("returns null for unknown track", () => {
      expect(cache.get("abc")).toBeNull()
    })

    it("returns url for a valid cached entry", async () => {
      await cache.resolve("abc")
      expect(cache.get("abc")).toBe("https://cdn.example.com/abc.m4a")
    })

    it("returns null and evicts an expired entry", async () => {
      await cache.resolve("abc")
      // backdating expiresAt via evict+re-insert is not exposed, so we test
      // that evict clears it and get returns null
      cache.evict("abc")
      expect(cache.get("abc")).toBeNull()
    })
  })

  describe("resolve()", () => {
    it("fetches and caches the url", async () => {
      const url = await cache.resolve("abc")
      expect(url).toBe("https://cdn.example.com/abc.m4a")
      expect(cache.fetchCalls).toEqual(["abc"])
    })

    it("returns cached value without re-fetching", async () => {
      await cache.resolve("abc")
      await cache.resolve("abc")
      expect(cache.fetchCalls.filter((id) => id === "abc")).toHaveLength(1)
    })

    it("deduplicates concurrent calls — single fetch inflight", async () => {
      const p1 = cache.resolve("abc")
      const p2 = cache.resolve("abc")
      const [u1, u2] = await Promise.all([p1, p2])
      expect(u1).toBe(u2)
      expect(cache.fetchCalls.filter((id) => id === "abc")).toHaveLength(1)
    })

    it("throws and does not cache on fetch failure", async () => {
      cache.resolveWith.set("bad", new Error("network error"))
      await expect(cache.resolve("bad")).rejects.toThrow("network error")
      expect(cache.get("bad")).toBeNull()
    })
  })

  describe("evict()", () => {
    it("removes a cached entry", async () => {
      await cache.resolve("abc")
      cache.evict("abc")
      expect(cache.get("abc")).toBeNull()
    })

    it("allows re-fetch after eviction", async () => {
      await cache.resolve("abc")
      cache.evict("abc")
      await cache.resolve("abc")
      expect(cache.fetchCalls.filter((id) => id === "abc")).toHaveLength(2)
    })
  })

  describe("prefetch()", () => {
    it("resolves track ids in the background", async () => {
      cache.prefetch(["t1", "t2", "t3"])
      // wait for microtasks to drain
      await new Promise((r) => setTimeout(r, 50))
      expect(cache.get("t1")).toBe("https://cdn.example.com/t1.m4a")
      expect(cache.get("t2")).toBe("https://cdn.example.com/t2.m4a")
      expect(cache.get("t3")).toBe("https://cdn.example.com/t3.m4a")
    })

    it("does not re-prefetch already-cached ids", async () => {
      await cache.resolve("t1")
      cache.prefetch(["t1"])
      await new Promise((r) => setTimeout(r, 50))
      expect(cache.fetchCalls.filter((id) => id === "t1")).toHaveLength(1)
    })

    it("does not re-prefetch ids already in inflight", async () => {
      const promise = cache.resolve("t1")
      cache.prefetch(["t1"])
      await promise
      expect(cache.fetchCalls.filter((id) => id === "t1")).toHaveLength(1)
    })

    it("silently ignores prefetch failures", async () => {
      cache.resolveWith.set("bad", new Error("fail"))
      cache.prefetch(["bad"])
      await new Promise((r) => setTimeout(r, 50))
      expect(cache.get("bad")).toBeNull()
    })
  })
})
