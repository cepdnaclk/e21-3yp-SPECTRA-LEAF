import { Reveal } from "@/components/ui/Reveal";

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  const sentences = title.match(/[^.!?]+[.!?]?/g)?.map((sentence) => sentence.trim()) ?? [title];

  return (
    <Reveal className="section-heading">
      <div className="section-kicker">
        <span>{index}</span>
        <span>{eyebrow}</span>
      </div>
      <h2 aria-label={title} data-heading>
        {sentences.map((sentence, sentenceIndex) => (
          <span className="heading-sentence" aria-hidden="true" key={`${sentence}-${sentenceIndex}`}>
            {sentence.split(" ").map((word, wordIndex) => (
              <span className="heading-word" key={`${word}-${wordIndex}`}>
                <span data-word>{word}</span>
              </span>
            ))}
          </span>
        ))}
      </h2>
      {description && <p>{description}</p>}
    </Reveal>
  );
}
