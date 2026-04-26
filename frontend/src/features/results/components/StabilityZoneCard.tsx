"use client";
import React from "react";
import type { StabilityZone } from "@/types/audit";

interface StabilityZoneCardProps {
  stabilityZone: StabilityZone;
}

export default function StabilityZoneCard({ stabilityZone }: StabilityZoneCardProps) {
  const { zones, summary } = stabilityZone;

  return (
    <section className="result-card" id="stability-zone-card">
      <h3 className="result-card__title">
        🧪 Would a small change flip the result?
      </h3>
      <p className="result-card__subtitle">{summary}</p>

      {zones.length > 0 && (
        <div className="stability-bar" role="figure" aria-label="Decision stability range">
          {zones.map((zone, i) => {
            const width = Math.max((zone.end - zone.start) * 100, 2);
            const isAccept = zone.label === "ACCEPT";

            return (
              <div
                key={i}
                className={`stability-bar__segment ${isAccept ? "stability-bar__segment--accept" : "stability-bar__segment--reject"}`}
                style={{ width: `${width}%` }}
                title={`${zone.start.toFixed(2)} – ${zone.end.toFixed(2)}: ${zone.label}`}
              >
                <span className="stability-bar__label">
                  {zone.label === "ACCEPT" ? "✅ Passes" : zone.label === "REJECT" ? "❌ Fails" : zone.label}
                </span>
                <span className="stability-bar__range">
                  {zone.start.toFixed(2)} – {zone.end.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .stability-bar {
          display: flex;
          width: 100%;
          height: 64px;
          border-radius: 8px;
          overflow: hidden;
          margin-top: 12px;
          border: 1px solid var(--border-primary, rgba(255,255,255,0.08));
        }
        .stability-bar__segment {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          transition: all 0.3s ease;
          cursor: default;
          gap: 4px;
        }
        .stability-bar__segment--accept {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(34, 197, 94, 0.1));
          color: #22c55e;
        }
        .stability-bar__segment--reject {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(239, 68, 68, 0.1));
          color: #ef4444;
        }
        .stability-bar__label {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
          font-family: var(--font-mono, monospace);
        }
        .stability-bar__range {
          font-size: 12px;
          opacity: 1;
          color: var(--t2, rgba(255,255,255,0.7));
          font-weight: 500;
          font-family: var(--font-mono, monospace);
        }
        .stability-bar__segment:hover {
          filter: brightness(1.3);
        }
      `}</style>
    </section>
  );
}
