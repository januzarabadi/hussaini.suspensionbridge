/* Persistent public visitor reviews powered by Supabase. */
import { createClient } from "@supabase/supabase-js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("review-form");
  const grid = document.getElementById("testimonial-grid");
  const status = document.getElementById("review-status");
  const loading = document.getElementById("reviews-loading");

  if (!form || !grid || !status) return;

  const config = window.HSB_SUPABASE_CONFIG || {};
  const submitButton = form.querySelector('button[type="submit"]');
  const avatarStyles = ["", "teal", "gold"];

  const showStatus = (message, isError = false) => {
    status.textContent = message;
    status.hidden = false;
    status.classList.toggle("error", isError);
  };

  if (!config.url || !config.publishableKey) {
    loading?.remove();
    showStatus(
      "Reviews are temporarily unavailable. Add the Supabase URL and publishable key to js/supabase-config.js.",
      true
    );
    submitButton.disabled = true;
    return;
  }

  const client = createClient(config.url, config.publishableKey);

  const getInitials = name => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "GV";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDate = value => new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));

  const createReviewCard = (review, index = 0) => {
    const name = review.name?.trim() || "Guest Visitor";
    const rating = Number(review.rating);
    const figure = document.createElement("figure");
    const stars = document.createElement("div");
    const quote = document.createElement("blockquote");
    const caption = document.createElement("figcaption");
    const avatar = document.createElement("span");
    const details = document.createElement("span");
    const author = document.createElement("strong");
    const meta = document.createElement("small");
    const avatarClass = avatarStyles[index % avatarStyles.length];

    figure.className = "testimonial reveal in-view visitor-review";
    stars.className = "stars";
    stars.setAttribute("aria-label", `${rating} out of 5 stars`);
    stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);
    quote.textContent = `“${review.review.trim()}”`;
    avatar.className = `avatar${avatarClass ? ` ${avatarClass}` : ""}`;
    avatar.textContent = getInitials(name);
    author.textContent = name;
    meta.textContent = `${review.country.trim()} · ${formatDate(review.created_at)}`;

    details.append(author, meta);
    caption.append(avatar, details);
    figure.append(stars, quote, caption);
    return figure;
  };

  const insertReviewFirst = card => {
    grid.prepend(card);
  };

  const loadReviews = async () => {
    const { data, error } = await client
      .from("review")
      .select("id, name, country, rating, review, created_at")
      .order("created_at", { ascending: false });

    loading?.remove();

    if (error) {
      console.error("Could not load reviews:", error);
      showStatus("Reviews could not be loaded. Please try again later.", true);
      return;
    }

    if (!data.length) {
      const empty = document.createElement("p");
      empty.className = "reviews-empty";
      empty.textContent = "Be the first to share your experience.";
      grid.append(empty);
      return;
    }

    data.forEach((review, index) => grid.append(createReviewCard(review, index)));
  };

  form.addEventListener("submit", async event => {
    event.preventDefault();
    status.hidden = true;
    status.classList.remove("error");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = document.getElementById("review-name").value.trim();
    const country = document.getElementById("review-country").value.trim();
    const reviewText = document.getElementById("review-text").value.trim();
    const rating = Number(form.querySelector('input[name="rating"]:checked')?.value);

    if (!country || reviewText.length < 10 || rating < 1 || rating > 5) {
      showStatus("Please complete the country, rating, and review fields.", true);
      return;
    }

    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");

    const { data, error } = await client
      .from("review")
      .insert({
        name: name || null,
        country,
        rating,
        review: reviewText
      })
      .select("id, name, country, rating, review, created_at")
      .single();

    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");

    if (error) {
      console.error("Could not submit review:", error);
      showStatus("Your review could not be submitted. Please try again.", true);
      return;
    }

    grid.querySelector(".reviews-empty")?.remove();
    insertReviewFirst(createReviewCard(data));
    form.reset();
    showStatus("Thank you! Your review has been added.");
  });

  loadReviews();
});
