import { Accordion } from 'cyberui-2045';
import { FAQ } from '../data/faq';
import { sectionProps } from '../sections';
import { SectionHeading } from './SectionHeading';

// Built once: the questions are static. Each item gets an explicit `id`
// because Accordion otherwise ids items by position, which would attach the
// open state to the wrong question if the list were ever reordered. Accordion
// renders every answer in the DOM, hidden (aria-hidden and inert) until opened,
// and `single` mode (the default) closes the open item when another opens.
const ITEMS = FAQ.map((item) => ({
  id: item.id,
  title: item.question,
  content: <p className="faq-answer">{item.answer}</p>,
}));

export function FaqSection() {
  return (
    <section {...sectionProps('faq')} className="section">
      <div className="page-width">
        <SectionHeading id="faq" />
        <Accordion className="faq-list" items={ITEMS} mode="single" />
      </div>
    </section>
  );
}
