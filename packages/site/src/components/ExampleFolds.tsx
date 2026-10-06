import { useId } from 'react';
import { Accordion } from 'cyberui-2045';
import type { ExampleCase } from '../content/types';

export interface ExampleFoldsProps {
  examples: ExampleCase[];
}

// Wrapped in `.neutral-scope` by the caller: Accordion gives an expanded
// panel a neon accent border by default, and this page spends its neon once.
//
// Accordion derives its header/panel DOM ids from each item's `id`, so the
// ids are prefixed with useId(): two template sections on one page would
// otherwise share "example-0-header".
export function ExampleFolds({ examples }: ExampleFoldsProps) {
  const prefix = useId();

  const items = examples.map((example, index) => ({
    id: `${prefix}-example-${index}`,
    title: example.title,
    content: (
      <div className="example-case">
        <h4>What they&apos;d type to their AI, in order</h4>
        <ol>
          {example.requests.map((request) => (
            <li key={request}>
              <q>{request}</q>
            </li>
          ))}
        </ol>
        <h4>Where they&apos;d get stuck</h4>
        <p>
          <q>{example.stuck}</q>
        </p>
        <h4>How they&apos;d know it worked</h4>
        <p>
          <q>{example.worked}</q>
        </p>
      </div>
    ),
  }));

  return (
    <>
      <p className="template-examples-note">An AI played each of these, in a simulated interview. They are not real people.</p>
      <Accordion mode="multiple" items={items} />
    </>
  );
}
