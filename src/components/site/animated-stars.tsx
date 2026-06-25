"use client";

import { useId, useEffect, useRef, useState } from "react";

const labels = ["Terrible", "Bad", "OK", "Good", "Excellent"];

export function AnimatedStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const uid = useId();
  const ratingRef = useRef<HTMLDivElement>(null);
  const prevRatingRef = useRef(value);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    const el = ratingRef.current;
    if (!el) return;

    const updateRating = (newVal: number) => {
      const prevID = prevRatingRef.current;

      // clear animation delays
      el.querySelectorAll<HTMLElement>('[class*="rating__label"]').forEach((lbl) => {
        lbl.className = "rating__label";
      });

      let delay = 0;
      const ratingObj = { id: newVal, name: labels[newVal - 1] };
      prevRatingRef.current = newVal;

      [1, 2, 3, 4, 5].forEach((id) => {
        const label = el.querySelector<HTMLElement>(`[for="${uid}-rating-${id}"]`);
        if (!label) return;

        if (id > prevID + 1 && id <= ratingObj.id) {
          delay++;
          label.classList.add(`rating__label--delay${delay}`);
        }

        const display = el.querySelector<HTMLElement>(`[data-rating="${id}"]`);
        if (!display) return;

        if (ratingObj.id !== id) {
          display.setAttribute("hidden", "");
        } else {
          display.removeAttribute("hidden");
        }
      });
    };

    // Initial setup
    updateRating(value);

    // Listen for changes on the hidden radio inputs
    const inputs = el.querySelectorAll<HTMLInputElement>("input[type=radio]");
    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const newVal = Number(target.value);
      onChange(newVal);
      updateRating(newVal);
    };
    inputs.forEach((input) => input.addEventListener("change", handleChange));

    return () => {
      inputs.forEach((input) => input.removeEventListener("change", handleChange));
    };
  }, [uid, onChange, value]);

  return (
    <div className="rating" ref={ratingRef}>
      <div
        className="rating__stars"
        onMouseLeave={() => setHoveredStar(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <input
            key={star}
            id={`${uid}-rating-${star}`}
            className={`rating__input rating__input-${star}`}
            type="radio"
            name={`${uid}-rating`}
            value={star}
            defaultChecked={value === star}
            onChange={() => {}}
          />
        ))}
        {[1, 2, 3, 4, 5].map((star) => {
          const active = hoveredStar >= star;
          return (
            <label
              key={star}
              className="rating__label"
              htmlFor={`${uid}-rating-${star}`}
              onMouseEnter={() => setHoveredStar(star)}
            >
              <svg className="rating__star" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
                <g transform="translate(16,16)">
                  <circle className="rating__star-ring" fill="none" stroke="#000" strokeWidth="16" r="8" transform="scale(0)" />
                </g>
                <g stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <g transform="translate(16,16) rotate(180)">
                    <polygon className="rating__star-stroke" points="0,15 4.41,6.07 14.27,4.64 7.13,-2.32 8.82,-12.14 0,-7.5 -8.82,-12.14 -7.13,-2.32 -14.27,4.64 -4.41,6.07" fill="none" style={{ stroke: active ? "#f59e0b" : undefined }} />
                    <polygon className="rating__star-fill" points="0,15 4.41,6.07 14.27,4.64 7.13,-2.32 8.82,-12.14 0,-7.5 -8.82,-12.14 -7.13,-2.32 -14.27,4.64 -4.41,6.07" fill="#000" />
                  </g>
                  <g transform="translate(16,16)" strokeDasharray="12 12" strokeDashoffset="12">
                    <polyline className="rating__star-line" transform="rotate(0)" points="0 4,0 16" />
                    <polyline className="rating__star-line" transform="rotate(72)" points="0 4,0 16" />
                    <polyline className="rating__star-line" transform="rotate(144)" points="0 4,0 16" />
                    <polyline className="rating__star-line" transform="rotate(216)" points="0 4,0 16" />
                    <polyline className="rating__star-line" transform="rotate(288)" points="0 4,0 16" />
                  </g>
                </g>
              </svg>
              <span className="rating__sr">{star} star&mdash;{labels[star - 1]}</span>
            </label>
          );
        })}
        {labels.map((label, i) => (
          <p key={label} className="rating__display" data-rating={i + 1} hidden>
            {label}
          </p>
        ))}
      </div>
    </div>
  );
}
