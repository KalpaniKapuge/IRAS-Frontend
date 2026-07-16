import { CheckCircle2 } from "lucide-react";

interface JobDescriptionProps {
  description: string | null;
  jobTitle: string;
}

interface DescriptionSection {
  title: string;
  blocks: Array<{ type: "paragraph"; text: string } | { type: "list"; items: string[] }>;
}

interface DescriptionFact {
  label: string;
  value: string;
}

function cleanText(value: string) {
  return value
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value: string) {
  return cleanText(value).toLowerCase();
}

function addListItem(section: DescriptionSection, item: string) {
  const last = section.blocks[section.blocks.length - 1];
  if (last?.type === "list") {
    last.items.push(item);
    return;
  }
  section.blocks.push({ type: "list", items: [item] });
}

function parseDescription(description: string | null, jobTitle: string) {
  const text = description?.trim();
  if (!text) return { facts: [], sections: [] };

  const facts: DescriptionFact[] = [];
  const sections: DescriptionSection[] = [];
  let current: DescriptionSection | null = null;

  const ensureSection = (title = "Overview") => {
    if (!current) {
      current = { title, blocks: [] };
      sections.push(current);
    }
    return current;
  };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const title = cleanText(heading[2]);
      if (heading[1].length === 1 && normalize(title) === normalize(jobTitle)) {
        current = null;
        continue;
      }
      current = { title, blocks: [] };
      sections.push(current);
      continue;
    }

    const fact = line.match(/^\*\*([^:*]+):\*\*\s*(.+)$/);
    if (fact) {
      facts.push({ label: cleanText(fact[1]), value: cleanText(fact[2]) });
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/) ?? line.match(/^\d+\.\s+(.+)$/);
    if (bullet) {
      addListItem(ensureSection("Details"), cleanText(bullet[1]));
      continue;
    }

    ensureSection("Overview").blocks.push({ type: "paragraph", text: cleanText(line) });
  }

  return {
    facts,
    sections: sections.filter((section) => section.blocks.length > 0),
  };
}

export function JobDescription({ description, jobTitle }: JobDescriptionProps) {
  const { facts, sections } = parseDescription(description, jobTitle);

  if (facts.length === 0 && sections.length === 0) {
    return <p className="text-sm text-muted-foreground">No description provided yet.</p>;
  }

  return (
    <div className="space-y-6">
      {facts.length > 0 && (
        <div className="grid gap-3 rounded-lg border border-border bg-muted/25 p-4 sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={`${fact.label}-${fact.value}`}>
              <p className="text-xs font-medium uppercase text-muted-foreground">{fact.label}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{fact.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
            <div className="space-y-3">
              {section.blocks.map((block, index) =>
                block.type === "paragraph" ? (
                  <p key={`${section.title}-${index}`} className="text-sm leading-7 text-foreground/85">
                    {block.text}
                  </p>
                ) : (
                  <ul key={`${section.title}-${index}`} className="space-y-2">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-foreground/85">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
