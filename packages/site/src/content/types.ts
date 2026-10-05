export interface CodeSnippet {
  title: string;
  code: string;
  note?: string;
  /** Adds a "Full file" link under the block. Used by /process evidence panels. */
  sourceHref?: string;
  /** Commit the snippet was taken from; shown beside the "Full file" link. */
  asOf?: string;
  /**
   * Wrap long lines instead of scrolling horizontally. Right for prose;
   * leave unset for diagrams and code, where line breaks are the content.
   */
  wrap?: boolean;
  /**
   * Box-drawing or column-aligned text. Scrolls instead of wrapping (do not
   * also set `wrap`), and is set in one system monospace font with a tight
   * line height so box characters line up and vertical bars connect.
   */
  diagram?: boolean;
}

/** One folded example on the Templates page: a person, what they'd ask their AI, and how it went. */
export interface ExampleCase {
  /** The fold's title, e.g. "A small shop owner". */
  title: string;
  /** What they'd type to their AI, in order. The subagent's own words, never reworded. */
  requests: string[];
  /** Where they'd get stuck. Verbatim, truncated with an ellipsis if long. */
  stuck: string;
  /** How they'd know it worked. Verbatim, truncated with an ellipsis if long. */
  worked: string;
}

/** The editorial copy for one template's section. Everything else on the section is derived from the Template. */
export interface TemplateContent {
  /** Plain-language "Use this if you're building…" bullets. */
  useIf: string[];
  /** What is simulated or mock, and that the template ships screens, not a data connection. */
  headsUp: string;
  /** Completes the sentence "Probably not for you …". */
  notFor: string;
  examples: ExampleCase[];
}
