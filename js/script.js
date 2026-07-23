/* Hussaini destination guide interactions */
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".nav-menu");
  const topButton = document.querySelector(".scroll-top");
  const sections = [...document.querySelectorAll("main section[id]")];

  // Mobile navigation
  menuButton.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", open);
    menuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  });
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }));

  // Header treatment, active links, and scroll-to-top
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 35);
    topButton.classList.toggle("visible", y > 600);
    let active = "";
    sections.forEach(section => { if (y >= section.offsetTop - 180) active = section.id; });
    document.querySelectorAll(".nav-menu a").forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === `#${active}`);
    });
    document.querySelector(".hero-media").style.transform = `translateY(${y * 0.22}px)`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  topButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Keep the desktop document untouched while presenting visitor priorities first on smaller screens.
  const main = document.querySelector("main");
  const originalMainChildren = [...main.children];
  const visitorGuidelines = document.querySelector(".visitor-guidelines");
  const guideDetails = document.querySelector(".guide-details");
  const rulesContainer = document.querySelector("#rules .container");
  const mobileQuery = window.matchMedia("(max-width: 850px)");
  const mobileFlow = [
    ".hero", "#guide", ".statistics", "#locations", "#experiences", "#rules",
    "#stay-food", "#nearby", "#gallery", "#visitor-stories", "#share-adventure", "#about",
    "#construction", "#people", "#zarabad", "#timeline", "#drone-video",
    "#photo-stories", "#facts", "#reviews", "#share-experience", ".faq", "#contact"
  ];

  const syncMobileFlow = () => {
    if (mobileQuery.matches) {
      rulesContainer.append(visitorGuidelines);
      mobileFlow.forEach(selector => {
        const section = main.querySelector(`:scope > ${selector}`);
        if (section) main.append(section);
      });
      document.querySelectorAll(".guideline-toggle").forEach(toggle => {
        toggle.setAttribute("aria-expanded", "false");
        toggle.querySelector("span").textContent = "+";
      });
    } else {
      guideDetails.append(visitorGuidelines);
      originalMainChildren.forEach(section => main.append(section));
      document.querySelectorAll(".guideline-toggle").forEach(toggle => {
        toggle.setAttribute("aria-expanded", "true");
        toggle.querySelector("span").textContent = "−";
      });
    }
    onScroll();
  };

  mobileQuery.addEventListener("change", syncMobileFlow);
  syncMobileFlow();

  // Reveal content and animate numbers after they become visible
  const animated = new WeakSet();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
      const counter = entry.target.querySelector("[data-count]");
      if (counter && !animated.has(counter)) {
        animated.add(counter);
        const end = Number(counter.dataset.count);
        const start = performance.now();
        const duration = 1550;
        const update = now => {
          const progress = Math.min((now - start) / duration, 1);
          const value = Math.round((1 - Math.pow(1 - progress, 3)) * end);
          counter.textContent = value.toLocaleString() + (counter.dataset.suffix || "");
          if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });
  document.querySelectorAll(".reveal").forEach(element => observer.observe(element));

  // FAQ accordion
  document.querySelectorAll(".faq-question").forEach(question => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling;
      const expanded = question.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq-question").forEach(item => {
        item.setAttribute("aria-expanded", "false");
        item.nextElementSibling.classList.remove("open");
      });
      if (!expanded) {
        question.setAttribute("aria-expanded", "true");
        answer.classList.add("open");
      }
    });
  });

  // Rules are compact accordions on mobile and remain fully expanded on desktop.
  document.querySelectorAll(".guideline-toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
      if (!mobileQuery.matches) return;
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      toggle.querySelector("span").textContent = expanded ? "+" : "−";
    });
  });

  // Accessible gallery dialog
  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector("p");
  document.querySelectorAll(".gallery-item, .visitor-card").forEach(item => {
    item.addEventListener("click", () => {
      lightboxImage.src = item.dataset.image;
      lightboxImage.alt = item.querySelector("img").alt;
      lightboxCaption.textContent = item.dataset.caption;
      lightbox.showModal();
    });
  });
  document.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", event => { if (event.target === lightbox) lightbox.close(); });

  // Photo Stories before-and-after comparison
  document.querySelectorAll(".compare-slider").forEach(slider => {
    const control = slider.querySelector(".compare-control");
    const overlay = slider.querySelector(".compare-overlay");
    const line = slider.querySelector(".compare-line");
    const updateComparison = value => {
      overlay.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
      line.style.left = `${value}%`;
      control.setAttribute("aria-valuenow", value);
      control.setAttribute("aria-valuetext", `${value} percent of current bridge image revealed`);
    };
    updateComparison(control.value);
    control.addEventListener("input", event => updateComparison(event.target.value));
  });

  // Small ripple feedback for primary actions
  document.querySelectorAll(".ripple").forEach(button => {
    button.addEventListener("click", event => {
      const ripple = document.createElement("span");
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const rect = button.getBoundingClientRect();
      ripple.className = "ripple-effect";
      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${event.clientX - rect.left - diameter / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - diameter / 2}px`;
      button.querySelector(".ripple-effect")?.remove();
      button.appendChild(ripple);
    });
  });

  // Visitor reviews — no account required; newest first in the Reviews section
  const reviewForm = document.getElementById("review-form");
  const reviewGrid = document.getElementById("testimonial-grid");
  const reviewStatus = document.getElementById("review-status");
  const reviewStorageKey = "hsb-visitor-reviews";
  const avatarStyles = ["", "teal", "gold"];

  const escapeHtml = value => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const getInitials = name => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "GV";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const starString = rating => "★".repeat(rating) + "☆".repeat(5 - rating);

  const createReviewCard = (review, index = 0) => {
    const name = review.name?.trim() || "Guest Visitor";
    const location = review.location.trim();
    const text = review.text.trim();
    const rating = Number(review.rating) || 5;
    const avatarClass = avatarStyles[index % avatarStyles.length];
    const figure = document.createElement("figure");
    figure.className = "testimonial reveal in-view visitor-review";
    figure.innerHTML = `
      <div class="stars" aria-label="${rating} out of 5 stars">${starString(rating)}</div>
      <blockquote>“${escapeHtml(text)}”</blockquote>
      <figcaption>
        <span class="avatar${avatarClass ? ` ${avatarClass}` : ""}">${escapeHtml(getInitials(name))}</span>
        <span>
          <strong>${escapeHtml(name)}</strong>
          <small>${escapeHtml(location)}</small>
        </span>
      </figcaption>
    `;
    return figure;
  };

  const loadStoredReviews = () => {
    try {
      const raw = localStorage.getItem(reviewStorageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveReviews = reviews => {
    try {
      localStorage.setItem(reviewStorageKey, JSON.stringify(reviews));
    } catch {
      /* storage may be unavailable */
    }
  };

  if (reviewForm && reviewGrid) {
    const insertVisitorReview = card => {
      const firstVisitor = reviewGrid.querySelector(".visitor-review");
      if (firstVisitor) reviewGrid.insertBefore(card, firstVisitor);
      else reviewGrid.append(card);
    };

    const stored = loadStoredReviews();
    // Oldest first so insert-before-first keeps newest visitor reviews at the top of the visitor block
    [...stored].reverse().forEach((review, index) => {
      insertVisitorReview(createReviewCard(review, index));
    });

    reviewForm.addEventListener("submit", event => {
      event.preventDefault();
      const name = document.getElementById("review-name").value.trim();
      const location = document.getElementById("review-location").value.trim();
      const text = document.getElementById("review-text").value.trim();
      const ratingInput = reviewForm.querySelector('input[name="rating"]:checked');

      if (!location || !text || !ratingInput) {
        reviewForm.reportValidity();
        return;
      }

      const review = {
        name,
        location,
        text,
        rating: Number(ratingInput.value),
        createdAt: Date.now()
      };

      const reviews = loadStoredReviews();
      reviews.unshift(review);
      saveReviews(reviews);

      insertVisitorReview(createReviewCard(review, 0));
      reviewForm.reset();
      reviewStatus.hidden = false;
      reviewStatus.textContent = "Thank you! Your review has been added.";
      window.setTimeout(() => {
        reviewStatus.hidden = true;
      }, 4500);
    });
  }

});
