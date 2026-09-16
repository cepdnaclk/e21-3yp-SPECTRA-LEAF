"use client";

import {
  ArrowUpRight,
  CloudCog,
  Gauge,
  GitBranch,
  RadioTower,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";

const features = [
  {
    icon: RadioTower,
    number: "01",
    title: "Six synchronized inputs",
    text: "Temperature, humidity, vision and three gas-response channels capture one batch-linked view of the changing tea bed.",
    value: "06",
    readout: "SENSOR CHANNELS",
    tags: ["ONE TIMELINE", "BATCH LINKED"],
  },
  {
    icon: Gauge,
    number: "02",
    title: "Shared live batch control",
    text: "Starting or stopping fermentation updates the backend-owned process state seen by connected web and mobile clients.",
    value: "LIVE",
    readout: "SHARED PROCESS STATE",
    tags: ["START + STOP", "AUTO REFRESH"],
  },
  {
    icon: RefreshCw,
    number: "03",
    title: "Resilient camera edge",
    text: "The ESP32-CAM coordinates sensing and visual context, reconnects after interruptions and resumes secure publishing.",
    value: "AUTO",
    readout: "EDGE RECOVERY",
    tags: ["ESP32-CAM", "WI-FI RECONNECT"],
  },
  {
    icon: CloudCog,
    number: "04",
    title: "Serverless cloud pipeline",
    text: "AWS IoT Core, Lambda and DynamoDB move telemetry securely without fixed server infrastructure.",
    value: "MQTT",
    readout: "SECURE TELEMETRY",
    tags: ["DEVICE SHADOW", "DYNAMODB"],
  },
  {
    icon: ShieldCheck,
    number: "05",
    title: "Role-aware access",
    text: "Cognito protects operational data while officers and managers receive interfaces matched to their responsibilities.",
    value: "03",
    readout: "USER ROLES",
    tags: ["COGNITO", "WEB + MOBILE"],
  },
  {
    icon: GitBranch,
    number: "06",
    title: "Quality-ready evidence",
    text: "Completed sensor profiles can be paired with expert Good Leaf Percentage results for future model development.",
    value: "GLP",
    readout: "QUALITY LABEL LINK",
    tags: ["BATCH HISTORY", "MODEL READY"],
  },
] as const;

export function KeyFeatures() {
  return (
    <section id="features" className="section features-section">
      <SectionHeading
        index="03"
        eyebrow="Key features"
        title="One platform connecting the leaf, the edge and the cloud."
        description="The current prototype combines practical sensing, reliable telemetry and usable factory insight while preparing every batch for future intelligence."
      />

      <div className="features-grid">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article data-reveal
              className="feature-item"
              key={feature.number}
            >
              {/* Feature number */}
              <div className="feature-number">
                {feature.number}
              </div>

              {/* Main content */}
              <div className="feature-main">
                {/* Top metadata */}
                <div className="feature-topline">
                  <span>{feature.readout}</span>

                  <Icon
                    className="feature-icon"
                    aria-hidden="true"
                  />
                </div>

                {/* Title */}
                <h3>{feature.title}</h3>

                {/* Description */}
                <p>{feature.text}</p>

                {/* Bottom information */}
                <div className="feature-footer">
                  <div className="feature-value">
                    <strong>{feature.value}</strong>
                    <span>{feature.readout}</span>
                  </div>

                  <div className="feature-tags">
                    {feature.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <ArrowUpRight
                className="feature-arrow"
                aria-hidden="true"
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}

