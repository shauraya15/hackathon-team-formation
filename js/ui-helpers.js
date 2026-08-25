// ui-helpers.js
// Shared UI utility functions: Toast notifications, animated stat counters,
// modal triggers, and badge generators. Pure vanilla JS with no external dependencies.

// ---------- Toast Notification System ----------
function showToast(message, type = "info", duration = 3500) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  const icon = type === "success" ? "✓ " : type === "error" ? "✕ " : "ℹ ";
  
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.5rem;">
      <span style="font-weight:700;">${icon}</span>
      <span>${escapeHtml(message)}</span>
    </div>
    <button style="background:transparent;border:none;color:var(--text-tertiary);cursor:pointer;font-size:1rem;" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

// ---------- Animated Number Counter ----------
// Smoothly increments a number from 0 to target using requestAnimationFrame
function animateCounter(element, target, duration = 1000) {
  if (!element) return;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease-out cubic formula for snappy start and gentle finish
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.floor(start + (target - start) * easeProgress);

    element.textContent = currentVal.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

// ---------- Modal Management ----------
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
}

// Close modals when clicking backdrop
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-backdrop")) {
    e.target.classList.remove("open");
    document.body.style.overflow = "";
  }
});

// Close modals on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-backdrop.open").forEach((modal) => {
      modal.classList.remove("open");
    });
    document.body.style.overflow = "";
  }
});

// ---------- Skill Badges & Formatting Helpers ----------
function getSkillBadgeClass(skill) {
  switch (skill) {
    case "Frontend": return "badge-frontend";
    case "Backend": return "badge-backend";
    case "Design": return "badge-design";
    case "Data/ML": return "badge-data";
    case "DevOps/Cloud": return "badge-devops";
    default: return "badge-surface";
  }
}

function getSkillBadgeHtml(skill, isPrimary = false) {
  const badgeClass = getSkillBadgeClass(skill);
  if (isPrimary) {
    return `<span class="badge badge-skill ${badgeClass}">★ ${escapeHtml(skill)} (Primary)</span>`;
  }
  return `<span class="badge badge-skill ${badgeClass}">${escapeHtml(skill)}</span>`;
}

function formatDate(dateStr) {
  if (!dateStr) return "TBD";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function timeAgo(dateOrTimestamp) {
  if (!dateOrTimestamp) return "recently";
  const ts = typeof dateOrTimestamp === "number" ? dateOrTimestamp : new Date(dateOrTimestamp).getTime();
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
