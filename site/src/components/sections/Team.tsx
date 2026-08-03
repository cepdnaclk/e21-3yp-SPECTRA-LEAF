"use client";

import { motion } from "framer-motion";
import { ExternalLink, GitBranch, Mail } from "lucide-react";
import Image from "next/image";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { domainAdvisors, supervisors, team } from "@/data/team";
import { getAssetPath } from "@/lib/paths";

export function Team() {
  const supervisionProfiles = [
    ...domainAdvisors.map((advisor, index) => ({
      code: `D0${index + 1}`,
      category: "Crop Science",
      organization: advisor.organization,
      name: advisor.name,
      role: advisor.title,
      description: advisor.contribution,
      profileUrl: advisor.linkedInUrl || advisor.profileUrl,
      profileImage: advisor.profileImage,
      email: null,
    })),
    ...supervisors.map((supervisor, index) => ({
      code: `S0${index + 1}`,
      category: "Academic Supervisor",
      organization: "Department of Computer Engineering",
      name: supervisor.name,
      role: supervisor.role,
      description: supervisor.biography,
      profileUrl: supervisor.profileUrl,
      profileImage: supervisor.profileImage,
      email: supervisor.email,
    })),
  ];

  return (
    <section id="team" className="section team-section">
      <SectionHeading
        index="14"
        eyebrow="Team and supervision"
        title="Engineering meets factory and crop knowledge."
        description="The student team develops the connected system with academic supervision and Crop Science guidance grounded in tea processing and quality evaluation."
      />
      <div className="team-grid">
        {team.map((member, index) => {
          const initials = member.name.split(" ").map((part) => part[0]).join("").slice(0, 2);
          const memberProfileUrl = member.linkedInUrl || member.profileUrl;
          return (
            <motion.article key={member.registrationNumber} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <div className="member-number">0{index + 1}</div>
              <div className="member-avatar">
                {member.profileImage ? (
                  <Image
                    src={getAssetPath(member.profileImage)}
                    alt={`${member.name}, ${member.role}`}
                    width={320}
                    height={320}
                    sizes="160px"
                  />
                ) : (
                  <span>{initials}</span>
                )}
                <i />
              </div>
              <small>{member.registrationNumber}</small>
              <h3><a href={memberProfileUrl} target="_blank" rel="noreferrer">{member.name}<ExternalLink /></a></h3>
              <h4>{member.role}</h4>
              <p>{member.biography}</p>
              <div className="member-links">
                <a href={`mailto:${member.email}`} aria-label={`Email ${member.name}`}><Mail /></a>
                <a href={memberProfileUrl} target="_blank" rel="noreferrer" aria-label={`Open ${member.name}'s profile`}><ExternalLink /></a>
                {member.githubUrl && <a href={member.githubUrl} aria-label={`${member.name} on GitHub`}><GitBranch /></a>}
                <span>{member.email}</span>
              </div>
            </motion.article>
          );
        })}
      </div>
      <div className="supervision-heading">
        <span>Domain and academic guidance</span>
        <h3>Domain supervision</h3>
        <p>Crop Science and Computer Engineering supervision connect tea-process knowledge with sensing, software, data validation and delivery.</p>
      </div>
      <div className="supervision-grid">
        {supervisionProfiles.map((person, index) => {
          const initials = person.name
            .replace(/^(Prof\.|Ms\.|Dr\.)\s*/, "")
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2);

          return (
            <motion.article
              className="supervision-card"
              key={person.code}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <div className="supervision-card-head"><small>{person.category}</small><span>{person.code}</span></div>
              <a className="supervision-avatar" href={person.profileUrl} target="_blank" rel="noreferrer" aria-label={`Open ${person.name}'s profile`}>
                {person.profileImage ? <Image src={getAssetPath(person.profileImage)} alt={person.name} width={320} height={320} sizes="116px" /> : initials}
              </a>
              <div className="supervision-copy">
                <small>{person.organization}</small>
                <h3><a href={person.profileUrl} target="_blank" rel="noreferrer">{person.name}<ExternalLink /></a></h3>
                <h4>{person.role}</h4>
                <p>{person.description}</p>
              </div>
              <div className="supervision-card-footer">
                {person.email ? <a href={`mailto:${person.email}`}><Mail />{person.email}</a> : <a href={person.profileUrl} target="_blank" rel="noreferrer"><ExternalLink />View university profile</a>}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
