import { serializeStructuredData } from "@/lib/structuredData";

/** Server-rendered JSON-LD; never accepts pre-rendered HTML. */
export default function StructuredData({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }}
    />
  );
}
