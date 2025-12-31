import React, { useEffect, useMemo, useState } from "react";

type NftItem = { tokenId: string; tokenUri: string };

// ---------- Helpers ----------
function decodeDataUriJson(uri: string) {
  if (uri?.startsWith("data:application/json;base64,")) {
    const b64 = uri.slice("data:application/json;base64,".length);
    try {
      const json = atob(b64);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
  return null; // ipfs://... => on garde brut (on affichera l'URI et une image via gateway)
}

function ipfsToHttp(url?: string) {
  if (!url) return undefined;
  if (url.startsWith("ipfs://")) {
    const cid = url.replace("ipfs://", "");
    return `https://ipfs.io/ipfs/${cid}`;
  }
  return url;
}

function truncateMiddle(str: string, keep = 6) {
  if (!str || str.length <= keep * 2 + 3) return str;
  return `${str.slice(0, keep)}…${str.slice(-keep)}`;
}

export default function MyNfts() {
  const [address, setAddress] = useState<string | null>(null);
  const [items, setItems] = useState<NftItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "hasMeta" | "raw">("all");
  const [sort, setSort] = useState<"recent" | "id-asc" | "id-desc">("recent");

  async function load() {
    try {
      setErr(undefined);
      setLoading(true);
      const me = await fetch("http://localhost:3000/auth/me", { credentials: "include" }).then((r) => r.json());
      setAddress(me?.address ?? null);
      if (!me?.address) {
        setItems([]);
        return;
      }

      const res = await fetch(`http://localhost:3000/api/nft/owned?owner=${me.address}`, {
        credentials: "include",
      }).then((r) => r.json());
      if (!res?.ok) throw new Error(res?.error || "fetch_failed");
      setItems(res.items || []);
    } catch (e: any) {
      setErr(e?.message || "Erreur chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ---------- dérivations UI ----------
  const decorated = useMemo(() => {
    const withMeta = items.map((it) => {
      const meta = decodeDataUriJson(it.tokenUri);
      // image: soit meta.image (data: ou ipfs://), soit rien
      const image = ipfsToHttp(meta?.image);
      return { ...it, _meta: meta, _image: image };
    });

    let arr = withMeta;

    // filtre
    if (filter === "hasMeta") arr = arr.filter((x) => !!x._meta);
    if (filter === "raw") arr = arr.filter((x) => !x._meta);

    // recherche simple sur name/description/tokenId
    const q = query.trim().toLowerCase();
    if (q) {
      arr = arr.filter((x) => {
        const hay =
          `${x.tokenId} ${x._meta?.name ?? ""} ${x._meta?.description ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // tri
    if (sort === "id-asc") arr = [...arr].sort((a, b) => Number(a.tokenId) - Number(b.tokenId));
    if (sort === "id-desc") arr = [...arr].sort((a, b) => Number(b.tokenId) - Number(a.tokenId));
    // "recent" = tel que renvoyé (supposé récent d'abord)
    return arr;
  }, [items, query, filter, sort]);

  // ---------- UI ----------
  return (
    <div style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 16 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Mes NFTs (titres)</div>
          <div style={{ color: "#6b7280", fontSize: 12 }}>
            Vos attestations et parts tokenisées s’affichent ici.
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="btn btnSmall"
          aria-busy={loading}
          title="Rafraîchir la liste"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Actualisation…" : "Actualiser"}
        </button>
      </div>

      {/* Bandeau adresse / SIWE */}
      {!address && (
        <div
          style={{
            border: "1px solid #fde2e2",
            background: "#fff6f6",
            color: "#991b1b",
            padding: 12,
            borderRadius: 10,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          <b>Adresse non liée.</b> Connecte d’abord ton adresse via{" "}
          <b>« Lier l’adresse (Signer) »</b> (SIWE), puis reviens ici.
        </div>
      )}

      {/* Barre d’outils (recherche/filtre/tri) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher (nom, description, tokenId)…"
          style={{
            flex: "1 1 260px",
            minWidth: 220,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "8px 10px",
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px" }}
            aria-label="Filtre"
          >
            <option value="all">Tous</option>
            <option value="hasMeta">Avec métadonnées</option>
            <option value="raw">Sans métadonnées</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px" }}
            aria-label="Tri"
          >
            <option value="recent">Plus récents</option>
            <option value="id-desc">TokenId ↓</option>
            <option value="id-asc">TokenId ↑</option>
          </select>
        </div>
      </div>

      {/* Erreur */}
      {address && !loading && err && (
        <div
          style={{
            border: "1px solid #fde2e2",
            background: "#fff6f6",
            color: "#991b1b",
            padding: 12,
            borderRadius: 10,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          {err}
        </div>
      )}

      {/* Skeletons */}
      {address && loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
            gap: 12,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ height: 140, background: "#f3f4f6" }} />
              <div style={{ padding: 12 }}>
                <div style={{ height: 14, background: "#f3f4f6", width: "65%", marginBottom: 8 }} />
                <div style={{ height: 10, background: "#f3f4f6", width: "35%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {address && !loading && !err && decorated.length === 0 && (
        <div
          style={{
            border: "1px dashed #e5e7eb",
            background: "#fafafa",
            color: "#6b7280",
            padding: 16,
            borderRadius: 10,
            fontSize: 13,
          }}
        >
          Aucun titre pour l’instant. Après un investissement confirmé et le mint, ton NFT apparaîtra ici.
        </div>
      )}

      {/* Grid */}
      {address && !loading && !err && decorated.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
            gap: 12,
          }}
        >
          {decorated.map((it) => {
            const meta = (it as any)._meta as any | null;
            const img = (it as any)._image as string | undefined;
            const name = meta?.name ?? `Token #${it.tokenId}`;
            const desc = meta?.description ?? "";
            const attrs: any[] = Array.isArray(meta?.attributes) ? meta.attributes : [];

            return (
              <div
                key={it.tokenId}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "white",
                }}
              >
                <div style={{ aspectRatio: "4 / 3", background: "#f3f4f6" }}>
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9ca3af",
                        fontSize: 12,
                      }}
                    >
                      Pas d’image
                    </div>
                  )}
                </div>

                <div style={{ padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontWeight: 700 }}>{name}</div>
                    <button
                      onClick={() => navigator.clipboard.writeText(it.tokenId)}
                      className="btn btnTiny"
                      title="Copier le tokenId"
                    >
                      {truncateMiddle(it.tokenId, 3)}
                    </button>
                  </div>

                  {desc && (
                    <div style={{ color: "#6b7280", fontSize: 12, marginTop: 4, lineHeight: 1.35 }}>
                      {desc}
                    </div>
                  )}

                  {attrs.length > 0 && (
                    <ul style={{ paddingLeft: 16, margin: "8px 0 0 0", fontSize: 12, color: "#374151" }}>
                      {attrs.slice(0, 5).map((a: any, i: number) => (
                        <li key={i}>
                          <b>{a.trait_type ?? "attr"}:</b> {String(a.value)}
                        </li>
                      ))}
                      {attrs.length > 5 && <li>…</li>}
                    </ul>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <a
                      className="btn btnSmall"
                      href={`https://sepolia.etherscan.io/token/${/* contract unknown; keep tokenURI */ ""}`}
                      onClick={(e) => e.preventDefault()}
                      title="Voir sur l’explorer (configurer le lien contrat si dispo)"
                    >
                      Explorer
                    </a>
                    <a
                      className="btn btnSmall btnSecondary"
                      href={ipfsToHttp(it.tokenUri)}
                      target="_blank"
                      rel="noreferrer"
                      title="Ouvrir tokenURI"
                    >
                      tokenURI
                    </a>
                    <button
                      className="btn btnSmall btnGhost"
                      onClick={() => {
                        if (meta) {
                          const pretty = JSON.stringify(meta, null, 2);
                          const blob = new Blob([pretty], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `nft-${it.tokenId}-meta.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        } else {
                          alert("Pas de métadonnées incorporées (data:).");
                        }
                      }}
                    >
                      Télécharger JSON
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
