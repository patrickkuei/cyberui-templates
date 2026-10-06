import { useState } from 'react';
import { Card, TabNavigation } from 'cyberui-2045';
import { TaskTable } from '../components/TaskTable';
import type { Task } from '../data/types';

export interface TasksPageProps {
  tasks: Task[];
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
}

// TabNavigation takes labels, so the active tab is a label from this tuple.
// The Record maps each label to its rule: adding a tab without a filter is a
// compile error. Cancelled tasks appear under All only.
const FILTER_TABS = ['All', 'Active', 'Done', 'Failed'] as const;
type FilterTab = (typeof FILTER_TABS)[number];
const FILTERS: Record<FilterTab, (task: Task) => boolean> = {
  All: () => true,
  Active: (task) => task.status === 'queued' || task.status === 'running',
  Done: (task) => task.status === 'done',
  Failed: (task) => task.status === 'failed',
};
const isFilterTab = (value: string): value is FilterTab => (FILTER_TABS as readonly string[]).includes(value);

export function TasksPage({ tasks, onCancel, onRetry }: TasksPageProps) {
  const [tab, setTab] = useState<FilterTab>('All');

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Tasks</h1>
        <p className="page-subtitle">Simulated tasks. Cancel and Retry change the simulation only.</p>
      </header>

      <section aria-label="Task list">
        <Card className="panel-surface">
          <div className="task-filter">
            <TabNavigation
              tabs={FILTER_TABS}
              activeTab={tab}
              onTabChange={(next) => {
                if (isFilterTab(next)) setTab(next);
              }}
            />
          </div>
          <TaskTable tasks={tasks.filter(FILTERS[tab])} onCancel={onCancel} onRetry={onRetry} />
        </Card>
      </section>
    </>
  );
}
