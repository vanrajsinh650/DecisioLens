(() => {
  const form = document.getElementById("audit-form");
  const status = document.getElementById("status");
  const runBtn = document.getElementById("run-btn");

  const resultPanel = document.getElementById("result");
  const decisionValue = document.getElementById("decision-value");
  const scoreValue = document.getElementById("score-value");
  const confidenceValue = document.getElementById("confidence-value");
  const riskValue = document.getElementById("risk-value");
  const reasonTags = document.getElementById("reason-tags");
  const explanationText = document.getElementById("explanation-text");

  const juryAuditor = document.getElementById("jury-auditor");
  const juryChallenger = document.getElementById("jury-challenger");
  const juryJudge = document.getElementById("jury-judge");

  if (!form || !status || !runBtn) {
    return;
  }

  const getApiBase = () => {
    const explicit = String(document.getElementById("api-base")?.value || "").trim();
    if (explicit) {
      return explicit.replace(/\/+$/, "");
    }

    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      return window.location.origin.replace(/\/+$/, "");
    }
    return "http://127.0.0.1:8000";
  };

  const setStatus = (text, isError = false) => {
    status.textContent = text;
    status.classList.toggle("error", isError);
  };

  const renderTags = (tags) => {
    reasonTags.innerHTML = "";
    if (!Array.isArray(tags) || tags.length === 0) {
      const empty = document.createElement("span");
      empty.className = "tag";
      empty.textContent = "none";
      reasonTags.appendChild(empty);
      return;
    }

    tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = String(tag);
      reasonTags.appendChild(chip);
    });
  };

  const renderResult = (data) => {
    const score = data?.original?.score;
    const risk = data?.risk || {};
    const jury = data?.ai_jury_view || {};

    decisionValue.textContent = String(data?.original?.decision ?? "-");
    scoreValue.textContent = typeof score === "number" ? score.toFixed(6) : String(score ?? "-");
    confidenceValue.textContent = String(data?.confidence_zone ?? "-");
    riskValue.textContent = `${String(risk.level ?? "-")} (${String(risk.score ?? "-")}/100)`;

    juryAuditor.textContent = `Auditor -> ${String(jury.auditor ?? "-")}`;
    juryChallenger.textContent = `Challenger -> ${String(jury.challenger ?? "-")}`;
    juryJudge.textContent = `Judge -> ${String(jury.judge ?? "-")}`;

    renderTags(data?.reason_tags);
    explanationText.textContent = String(data?.explanation ?? "No explanation returned.");
    resultPanel.classList.remove("hidden");
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    setStatus("Running audit...");
    runBtn.disabled = true;

    try {
      const payload = {
        profile: {
          name: String(document.getElementById("name")?.value || ""),
          score: Number(document.getElementById("score")?.value || 0),
          experience: Number(document.getElementById("experience")?.value || 0),
          gender: String(document.getElementById("gender")?.value || ""),
          location: String(document.getElementById("location")?.value || ""),
          college: String(document.getElementById("college")?.value || ""),
        },
        threshold: Number(document.getElementById("threshold")?.value || 0.5),
      };

      const response = await fetch(`${getApiBase()}/audit/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`API error ${response.status}: ${detail}`);
      }

      const data = await response.json();
      renderResult(data);
      setStatus("Audit completed.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setStatus(message, true);
    } finally {
      runBtn.disabled = false;
    }
  });
})();
