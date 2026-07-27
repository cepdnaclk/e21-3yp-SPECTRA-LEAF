"use client";

import { motion } from "framer-motion";
import { ExternalLink, GitBranch, Mail } from "lucide-react";
import Image from "next/image";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { team } from "@/data/team";
import { getAssetPath } from "@/lib/paths";

export function Team() {
  return (
    <section id="team" className="section team-section">
      <SectionHeading
        index="14"
        eyebrow="Project team"
        title="Four disciplines. One shared signal."
        description="The team spans the physical edge, secure cloud, operational interface and future learning strategy."
      />
      <div className="team-grid">
        {team.map((member, index) => {
          const initials = member.name.split(" ").map((part) => part[0]).join("").slice(0, 2);
          return (
            <motion.article key={member.registrationNumber} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <div className="member-number">0{index + 1}</div>
              <div className="member-avatar">
                {member.profileImage ? (
                  <Image
                    src={getAssetPath(member.profileImage)}
                    alt={`${member.name}, ${member.role}`}
                    width={208}
                    height={208}
                    sizes="104px"
                  />
                ) : (
                  <span>{initials}</span>
                )}
                <i />
              </div>
              <small>{member.registrationNumber}</small>
              <h3>{member.name}</h3>
              <h4>{member.role}</h4>
              <p>{member.biography}</p>
              <div className="member-links">
                <a href={`mailto:${member.email}`} aria-label={`Email ${member.name}`}><Mail /></a>
                {member.linkedInUrl && <a href={member.linkedInUrl} aria-label={`${member.name} on LinkedIn`}><ExternalLink /></a>}
                {member.githubUrl && <a href={member.githubUrl} aria-label={`${member.name} on GitHub`}><GitBranch /></a>}
                <span>{member.email}</span>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
