import React from 'react';
import { renderToString } from 'react-dom/server';
import { Timeline } from './src/pages/Timeline';
import { ScheduleProvider } from './src/contexts/ScheduleContext';
import { BrowserRouter } from 'react-router-dom';

try {
  const html = renderToString(
    React.createElement(BrowserRouter, null, 
      React.createElement(ScheduleProvider, null, 
        React.createElement(Timeline)
      )
    )
  );
  console.log('RENDER SUCCESS');
} catch (err) {
  console.log('RENDER ERROR:', err);
}
