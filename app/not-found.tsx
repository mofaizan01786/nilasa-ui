import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="shell"
      style={{
        minHeight: "65vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "60px 20px"
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.78rem",
          color: "#B8912E",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 8
        }}
      >
        404 • PAGE NOT FOUND
      </span>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "3rem",
          color: "#202B45",
          margin: "0 0 16px"
        }}
      >
        Piece Not Found
      </h1>
      <p
        style={{
          fontSize: "1rem",
          color: "#64748B",
          maxWidth: 480,
          margin: "0 0 28px",
          lineHeight: 1.6
        }}
      >
        The collection page or product silhouette you are looking for has been moved or is no longer in active circulation.
      </p>
      <Link href="/shop" className="button button--gold">
        Explore Active Collections →
      </Link>
    </main>
  );
}
