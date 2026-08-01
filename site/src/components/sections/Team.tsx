"use client";

import { motion } from "framer-motion";
import { ExternalLink, GitBranch, Leaf, Mail } from "lucide-react";
import Image from "next/image";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { domainAdvisors, supervisors, team } from "@/data/team";
import { getAssetPath } from "@/lib/paths";

export function Team() {
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
      <div className="domain-heading">
        <span>Domain guidance</span>
        <h3>Crop Science advisors</h3>
        <p>Domain advisors help connect sensor behaviour with tea oxidation, sampling practice and final Good Leaf Percentage evaluation.</p>
      </div>
      {domainAdvisors.length > 0 ? (
        <div className="advisor-grid">
          {domainAdvisors.map((advisor, index) => (
            <motion.article key={advisor.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <a className="advisor-avatar" href={advisor.profileUrl} target="_blank" rel="noreferrer" aria-label={`Open ${advisor.name}'s Crop Science profile`}>
                <Image src={getAssetPath(advisor.profileImage)} alt={advisor.name} width={320} height={320} sizes="140px" />
              </a><span>D0{index + 1}</span>
              <small>{advisor.organization}</small>
              <h3><a href={advisor.linkedInUrl || advisor.profileUrl} target="_blank" rel="noreferrer">{advisor.name}<ExternalLink /></a></h3>
              <h4>{advisor.title}</h4><p>{advisor.contribution}</p>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="advisor-pending"><Leaf /><div><strong>Advisor profiles awaiting confirmation</strong><p>Names, titles and contribution details will be added here as soon as the Crop Science contacts are supplied.</p></div></div>
      )}
      <div className="supervisor-heading">
        <span>Academic guidance</span>
        <h3>Project supervision</h3>
      </div>
      <div className="supervisor-grid">
        {supervisors.map((supervisor, index) => {
          const initials = supervisor.name
            .replace(/^(Ms\.|Dr\.)\s*/, "")
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2);

          return (
            <motion.article
              key={supervisor.email}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <div className="supervisor-number">S0{index + 1}</div>
              <a className="supervisor-avatar" href={supervisor.profileUrl} target="_blank" rel="noreferrer" aria-label={`Open ${supervisor.name}'s staff profile`}>
                {supervisor.profileImage ? <Image src={getAssetPath(supervisor.profileImage)} alt="" width={320} height={320} sizes="132px" /> : initials}
              </a>
              <div className="supervisor-copy">
                <small>Department of Computer Engineering</small>
                <h3><a href={supervisor.profileUrl} target="_blank" rel="noreferrer">{supervisor.name}<ExternalLink /></a></h3>
                <h4>{supervisor.role}</h4>
                <p>{supervisor.biography}</p>
                <a href={`mailto:${supervisor.email}`}><Mail />{supervisor.email}</a>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
