import { ExternalLink, GitBranch, Leaf, MoveUpRight } from "lucide-react";
import { navigation } from "@/data/navigation";
import { project } from "@/data/project";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <a className="wordmark" href="#home"><Leaf /> <span>SPECTRA <b>LEAF</b></span></a>
          <p>An Industrial IoT platform for visible, measurable and eventually intelligent tea fermentation.</p>
        </div>
        <div>
          <h3>Explore</h3>
          {navigation.slice(0, 4).map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </div>
        <div>
          <h3>Project</h3>
          <p>{project.university}</p>
          <p>{project.faculty}</p>
          <p>{project.department}</p>
          <a className="footer-project-link" href={project.projectPageUrl} target="_blank" rel="noreferrer">
            <ExternalLink /> Official project profile <MoveUpRight />
          </a>
        </div>
        <div>
          <h3>Repository</h3>
          <a className="footer-github" href={project.githubUrl} target="_blank" rel="noreferrer">
            <GitBranch /> Repository <MoveUpRight />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Spectra Leaf</span>
        <span>Built for the {project.projectYear}</span>
      </div>
    </footer>
  );
}
