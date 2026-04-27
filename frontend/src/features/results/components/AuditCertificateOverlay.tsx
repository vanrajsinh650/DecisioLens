"use client";
import React, { useMemo } from "react";
import { formatDateTime, formatPercent } from "@/lib/format";
import { AuditSession } from "@/types/audit";

interface AuditCertificateOverlayProps {
    session: AuditSession;
    onClose: () => void;
}

export default function AuditCertificateOverlay({ session, onClose }: AuditCertificateOverlayProps) {
    const { response, request, submittedAt } = session;
    const auditId = useMemo(
        () => `DL-${submittedAt.replace(/[^0-9]/g, "").slice(-8)}-${Math.random().toString(36).substring(7).toUpperCase()}`,
        [submittedAt],
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                animation: "fade-in 0.3s ease-out",
            }}
            onClick={onClose}
        >
            <div
                className="certificate-paper"
                style={{
                    width: "100%",
                    maxWidth: "840px",
                    background: "#fff",
                    color: "#050505",
                    padding: "80px",
                    borderRadius: "4px",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                    position: "relative",
                    overflow: "hidden",
                    fontFamily: "'Sora', sans-serif",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative border */}
                <div style={{ position: "absolute", inset: "15px", border: "4px double #C5A059" }} />
                <div style={{ position: "absolute", inset: "25px", border: "1px solid #E5C284", opacity: 0.5 }} />

                {/* Content */}
                <div style={{ position: "relative", textAlign: "center" }}>
                    <div style={{ marginBottom: "60px" }}>
                        <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: 0, letterSpacing: "0.2em", color: "#C5A059" }}>DECISIOLENS</h1>
                        <div style={{ width: "120px", height: "2px", background: "#C5A059", margin: "12px auto" }} />
                        <p style={{ fontSize: "0.9rem", letterSpacing: "0.5em", textTransform: "uppercase", marginTop: "10px", color: "#666" }}>Forensic Decision Audit Certificate</p>
                    </div>

                    <div style={{ margin: "50px 0" }}>
                        <p style={{ fontSize: "1.2rem", fontStyle: "italic", color: "#444" }}>This document certifies that a comprehensive forensic audit was performed on an automated decision for:</p>
                        <h2 style={{ fontSize: "2.4rem", margin: "24px 0", fontWeight: 700, color: "#000" }}>{String(request.profile.name || "Anonymous Applicant")}</h2>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", textAlign: "left", margin: "70px 0", borderTop: "1px solid #EEE", borderBottom: "1px solid #EEE", padding: "40px 0" }}>
                        <div>
                            <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Audit Domain</p>
                            <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>{request.domain?.toUpperCase()}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Audit ID</p>
                            <p style={{ fontSize: "1.1rem", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{auditId}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Decision Quality</p>
                            <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>{formatPercent(response.original.score, 1)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Verdict Integrity</p>
                            <p style={{ fontSize: "1.2rem", fontWeight: 700, color: response.insights.risk_level === "HIGH_RISK" ? "#D32F2F" : response.insights.risk_level === "BORDERLINE" ? "#E65100" : "#2E7D32" }}>{response.insights.risk_level?.toUpperCase() || "STABLE"}</p>
                        </div>
                    </div>

                    <div style={{ marginTop: "40px", padding: "0 40px" }}>
                        <p style={{ fontSize: "0.95rem", color: "#555", lineHeight: 1.8 }}>
                            The DecisioLens forensic engine executed 9 threshold sensitivity simulations and analyzed {response.variations?.length || 0} counterfactual profiles. 
                            The decision was determined to be <strong>{response.insights.instability ? "UNSTABLE" : "STABLE"}</strong> 
                            under current parameters, with <strong>{response.insights.bias_detected ? "DETECTED FAIRNESS CONCERNS" : "NO DIRECT BIAS INDICATORS"}</strong> found.
                        </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "100px" }}>
                        <div style={{ textAlign: "left" }}>
                            <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase" }}>Issuance Date</p>
                            <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>{formatDateTime(submittedAt)}</p>
                        </div>
                        
                        {/* Gold Seal */}
                        <div style={{ position: "relative" }}>
                            <div style={{ 
                                width: "140px", 
                                height: "140px", 
                                background: "linear-gradient(135deg, #E5C284 0%, #C5A059 100%)",
                                borderRadius: "50%", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                boxShadow: "0 8px 24px rgba(197, 160, 89, 0.4)",
                                position: "relative"
                            }}>
                                <div style={{ 
                                    width: "128px", 
                                    height: "128px", 
                                    border: "2px dashed rgba(255,255,255,0.4)", 
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center"
                                }}>
                                    <div style={{ color: "#FFF", transform: "rotate(-5deg)" }}>
                                        <p style={{ margin: 0, fontWeight: 900, fontSize: "0.8rem", letterSpacing: "0.05em" }}>DECISIOLENS</p>
                                        <p style={{ margin: 0, fontSize: "0.6rem", opacity: 0.9 }}>OFFICIAL AUDIT</p>
                                        <p style={{ margin: 0, fontSize: "0.5rem", marginTop: "4px" }}>{auditId.slice(0, 8)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print/Close UI (hidden during print) */}
                <div className="no-print" style={{ position: "absolute", top: "30px", right: "30px", display: "flex", gap: "12px" }}>
                    <button 
                        onClick={handlePrint}
                        style={{ 
                            padding: "10px 24px", 
                            background: "#C5A059", 
                            color: "#fff", 
                            border: "none", 
                            borderRadius: "6px", 
                            cursor: "pointer",
                            fontWeight: 600,
                            boxShadow: "0 4px 12px rgba(197, 160, 89, 0.3)"
                        }}
                    >
                        PRINT CERTIFICATE
                    </button>
                    <button 
                        onClick={onClose}
                        style={{ 
                            padding: "10px 24px", 
                            background: "rgba(0,0,0,0.05)", 
                            color: "#000", 
                            border: "none", 
                            borderRadius: "6px", 
                            cursor: "pointer",
                            fontWeight: 600
                        }}
                    >
                        CLOSE
                    </button>
                </div>
            </div>
            
            <style jsx>{`
                @media print {
                    .no-print { display: none !important; }
                    body * { visibility: hidden; }
                    .certificate-paper, .certificate-paper * { visibility: visible; }
                    .certificate-paper { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        margin: 0; 
                        padding: 1.5cm;
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
