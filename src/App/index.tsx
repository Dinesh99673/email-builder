import React, { useState, useEffect } from 'react';

import { Stack, useTheme } from '@mui/material';

import { useInspectorDrawerOpen, useSamplesDrawerOpen } from '../documents/editor/EditorContext';

import InspectorDrawer, { INSPECTOR_DRAWER_WIDTH } from './InspectorDrawer';
import SamplesDrawer, { SAMPLES_DRAWER_WIDTH } from './SamplesDrawer';
import TemplatePanel from './TemplatePanel';

function useDrawerTransition(cssProperty: 'margin-left' | 'margin-right', open: boolean) {
  const { transitions } = useTheme();
  return transitions.create(cssProperty, {
    easing: !open ? transitions.easing.sharp : transitions.easing.easeOut,
    duration: !open ? transitions.duration.leavingScreen : transitions.duration.enteringScreen,
  });
}

export default function App() {
  const inspectorDrawerOpen = useInspectorDrawerOpen();
  const samplesDrawerOpen = useSamplesDrawerOpen();

  const marginLeftTransition = useDrawerTransition('margin-left', samplesDrawerOpen);
  const marginRightTransition = useDrawerTransition('margin-right', inspectorDrawerOpen);

  const [parentData, setParentData] = useState<any>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.origin) return;
  
      console.log("Child received data:", event.data);
      if(event.data.type === "INITIAL_DATA") {
        setParentData(prev => {
          // avoid re-setting same data
          if (JSON.stringify(prev) === JSON.stringify(event.data)) return prev;
          return event.data;
        });
      }
    };
  
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  

  return (
    <>
      <InspectorDrawer />
      <SamplesDrawer userID={parentData?.userID} />

      <Stack
        sx={{
          marginRight: inspectorDrawerOpen ? `${INSPECTOR_DRAWER_WIDTH}px` : 0,
          marginLeft: samplesDrawerOpen ? `${SAMPLES_DRAWER_WIDTH}px` : 0,
          transition: [marginLeftTransition, marginRightTransition].join(', '),
        }}
      >
        <TemplatePanel message={parentData} />
      </Stack>
    </>
  );
}
