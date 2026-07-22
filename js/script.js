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

});
