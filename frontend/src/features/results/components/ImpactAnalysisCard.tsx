"use client";
import React from "react";
import type { ImpactItem } from "@/types/audit";

interface ImpactAnalysisCardProps {
  impacts: ImpactItem[];
}

export default function ImpactAnalysisCard({ impacts }: ImpactAnalysisCardProps) {
  if (!impacts || impacts.length === 0) return null;

  const maxDelta = Math.max(...impacts.map((i) => Math.abs(i.delta)), 0.01);

  return (
    <section className="result-card" id="impact-analysis-card">
      <h3 className="result-card__title">
        🔍 What Affected The Score?
      </h3>

      <div className="impact-list">
        {impacts.map((item, i) => {
          const barWidth = Math.min((Math.abs(item.delta) / maxDelta) * 100, 100);
          const isPositive = item.direction === "positive";
          const pct = (item.delta * 100).toFixed(1);
          const sign = isPositive ? "+" : "";

          return (
            <div
              key={i}
              className={`impact-row ${item.decision_changed ? "impact-row--flipped" : ""}`}
            >
              <span className="impact-row__label">{item.variable}</span>
              <div className="impact-row__bar-track">
                <div
                  className={`impact-row__bar ${isPositive ? "impact-row__bar--positive" : "impact-row__bar--negative"}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className={`impact-row__delta ${isPositive ? "impact-row__delta--positive" : "impact-row__delta--negative"}`}>
                {sign}{pct}%
              </span>
              {item.decision_changed && (
                <span className="impact-row__flip" title="This change flipped the decision">
                  ⚡
                </span>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .impact-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
        }
        .impact-row {
          display: grid;
          grid-template-columns: 140px 1fr 60px 24px;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
        }
        .impact-row--flipped {
          background: rgba(250, 204, 21, 0.05);
          border-radius: 4px;
          padding: 6px 8px;
        }
        .impact-row__label {
          font-size: 13px;
          color: var(--text-secondary, rgba(255,255,255,0.7));
          font-family: var(--font-mono, monospace);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .impact-row__bar-track {
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
        }
        .impact-row__bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .impact-row__bar--positive {
          background: linear-gradient(90deg, rgba(34, 197, 94, 0.6), rgba(34, 197, 94, 0.9));
        }
        .impact-row__bar--negative {
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.6), rgba(239, 68, 68, 0.9));
        }
        .impact-row__delta {
          font-size: 12px;
          font-weight: 600;
          font-family: var(--font-mono, monospace);
          text-align: right;
        }
        .impact-row__delta--positive { color: #22c55e; }
        .impact-row__delta--negative { color: #ef4444; }
        .impact-row__flip {
          font-size: 14px;
          cursor: help;
        }
      `}</style>
    </section>
  );
}
