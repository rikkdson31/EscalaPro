import React from 'react';
import { renderToString } from 'react-dom/server';
import { Timeline } from './src/pages/Timeline.tsx';
import { ScheduleProvider } from './src/contexts/ScheduleContext.tsx';

try {
  const html = renderToString(
    <ScheduleProvider>
      <Timeline />
    </ScheduleProvider>
  );
  console.log('RENDER SUCCESS');
} catch (err) {
  console.log('RENDER ERROR:', err);
}
