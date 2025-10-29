import { MonitorOutlined, PhoneIphoneOutlined, Save } from '@mui/icons-material';
import { Box, IconButton, Stack, SxProps, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { Reader } from '@usewaypoint/email-builder';

import EditorBlock from '../../documents/editor/EditorBlock';
import {
  setSelectedScreenSize,
  useDocument,
  useSelectedMainTab,
  useSelectedScreenSize,
} from '../../documents/editor/EditorContext';
import { useCurrentTemplateId } from '../../documents/editor/EditorContext';
import ToggleInspectorPanelButton from '../InspectorDrawer/ToggleInspectorPanelButton';
import ToggleSamplesPanelButton from '../SamplesDrawer/ToggleSamplesPanelButton';

import DownloadJson from './DownloadJson';
import HtmlPanel from './HtmlPanel';
import ImportJson from './ImportJson';
import JsonPanel from './JsonPanel';
import MainTabsGroup from './MainTabsGroup';
import ShareButton from './ShareButton';

export default function TemplatePanel({ message }: { message: any }) {
  const document = useDocument();
  const selectedMainTab = useSelectedMainTab();
  const selectedScreenSize = useSelectedScreenSize();
  const currentTemplateId = useCurrentTemplateId();

  let mainBoxSx: SxProps = {
    height: '100%',
  };
  if (selectedScreenSize === 'mobile') {
    mainBoxSx = {
      ...mainBoxSx,
      margin: '32px auto',
      width: 370,
      height: 800,
      boxShadow:
        'rgba(33, 36, 67, 0.04) 0px 10px 20px, rgba(33, 36, 67, 0.04) 0px 2px 6px, rgba(33, 36, 67, 0.04) 0px 0px 1px',
    };
  }

  const handleScreenSizeChange = (_: unknown, value: unknown) => {
    switch (value) {
      case 'mobile':
      case 'desktop':
        setSelectedScreenSize(value);
        return;
      default:
        setSelectedScreenSize('desktop');
    }
  };

  const renderMainPanel = () => {
    switch (selectedMainTab) {
      case 'editor':
        return (
          <Box sx={mainBoxSx}>
            <EditorBlock id="root" />
          </Box>
        );
      case 'preview':
        return (
          <Box sx={mainBoxSx}>
            <Reader document={document} rootBlockId="root" />
          </Box>
        );
      case 'html':
        return <HtmlPanel />;
      case 'json':
        return <JsonPanel />;
    }
  };

  const saveTemplate = async () => {
    try {
      const payload = {
        emailTemplateId: currentTemplateId,
        jsonData: JSON.stringify(document),
      };
      const res = await fetch('http://localhost:5001/api/email-builder/save-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to save template');
      }
      const data = await res.json();
      console.log('Saved template', data);
      alert('Template saved successfully');
      return data;
    } catch (err) {
      console.log({ err });
      alert('Failed to save template');
    }
  };

  return (
    <>
      <Stack
        sx={{
          height: 49,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 'appBar',
          px: 1,
        }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <ToggleSamplesPanelButton />
        <Stack px={2} direction="row" gap={2} width="100%" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2}>
            <MainTabsGroup />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Save Template">
              <IconButton onClick={saveTemplate}>
                <Save fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <DownloadJson />
            <ImportJson />
            <ToggleButtonGroup value={selectedScreenSize} exclusive size="small" onChange={handleScreenSizeChange}>
              <ToggleButton value="desktop">
                <Tooltip title="Desktop view">
                  <MonitorOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="mobile">
                <Tooltip title="Mobile view">
                  <PhoneIphoneOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            <ShareButton />
          </Stack>
        </Stack>
        <ToggleInspectorPanelButton />
      </Stack>
      <Box sx={{ height: 'calc(100vh - 49px)', overflow: 'auto', minWidth: 370 }}>{renderMainPanel()}</Box>
    </>
  );
}
