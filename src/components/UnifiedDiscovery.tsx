"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import Link from "next/link";

type Journey = "healthcare" | "home-services";

export function UnifiedDiscovery() {
  const [journey, setJourney] = useState<Journey>("healthcare");
  const isHealthcare = journey === "healthcare";

  return (
    <div className="discovery-shell">
      <div
        className="discovery-tabs"
        role="tablist"
        aria-label="Choose a service journey"
        data-active={journey}
      >
        <span className="tab-indicator" aria-hidden="true" />
        <button
          type="button"
          role="tab"
          aria-selected={isHealthcare}
          className={isHealthcare ? "is-active" : ""}
          onClick={() => setJourney("healthcare")}
        >
          <Icon name="heart" size={17} /> Healthcare
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isHealthcare}
          className={!isHealthcare ? "is-active" : ""}
          onClick={() => setJourney("home-services")}
        >
          <Icon name="home" size={17} /> Home services
        </button>
      </div>

      <form
        key={journey}
        className="discovery-form"
        data-journey={journey}
        action={isHealthcare ? "/healthcare" : "/home-services"}
        method="get"
      >
        <label>
          <span>{isHealthcare ? "Doctor, specialty or care need" : "Service, category or provider"}</span>
          <div>
            <Icon name="search" size={19} />
            <input
              type="search"
              name="query"
              placeholder={isHealthcare ? "Try “Mental Health”" : "Try “Laboratory”"}
              autoComplete="off"
            />
          </div>
        </label>
        {!isHealthcare && (
          <label className="discovery-location">
            <span>Location</span>
            <div>
              <Icon name="location" size={19} />
              <input name="location" placeholder="Choose your area" autoComplete="address-level2" />
            </div>
          </label>
        )}
        <div className="discovery-submit">
  <span aria-hidden="true">&nbsp;</span>
  <button type="submit">
    {isHealthcare ? "Find healthcare" : "Explore services"}
    <Icon name="arrow" size={18} />
  </button>
</div>
      </form>

      <div className="discovery-chips">
        <span>Popular:</span>
        {(isHealthcare
          ? ["Mental Health", "Dermatology", "Pediatrics"]
          : ["Laboratory", "Nursing", "Physiotherapy"]
        ).map((term) => (
          <Link
            key={term}
            href={`${isHealthcare ? "/healthcare" : "/home-services"}?query=${encodeURIComponent(term)}`}
          >
            {term}
          </Link>
        ))}
      </div>
    </div>
  );
}