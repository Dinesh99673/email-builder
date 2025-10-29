import { Box, Button, Divider, Drawer, Stack, Typography } from '@mui/material';

import { useSamplesDrawerOpen, resetDocument, setCurrentTemplateId } from '../../documents/editor/EditorContext';
import { useCurrentTemplateId } from '../../documents/editor/EditorContext';

import SidebarButton from './SidebarButton';
import { useEffect, useState } from 'react';

export const SAMPLES_DRAWER_WIDTH = 240;

export default function SamplesDrawer() {
  const samplesDrawerOpen = useSamplesDrawerOpen();
  const [userEmailTemplates, setUserEmailTemplates] = useState<any[]>([]);
  const currentTemplateId = useCurrentTemplateId();

  const userId = "j0GX6FU8Slcou3Wf2fRP5Ix1zGZ2";

  const fetchTemplates = () => {
    if (userId) {
      console.log('fetching templates for user', userId);
      fetch(`http://localhost:5001/api/templates/email-builder/${userId}`)
        .then(res => res.json())
        .then(data => {
          console.log('data', data);
          console.log('data.templates', data.template);
          if(data.template) {
            setUserEmailTemplates(data.template);
          } else {
            setUserEmailTemplates([]);
          }
        })
        .catch(err => {
          console.log('err', err);
        });
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleTemplateClick = async (tpl: any) => {
    console.log('tpl', tpl.name);
    const parsedData = await JSON.parse(tpl.jsonData);
    setCurrentTemplateId(tpl.id || null);
    resetDocument(parsedData);
  };

  const handleCreateNewTemplate = async () => {
    try {
      const input = window.prompt('Enter a name for the new email template:', 'Untitled Template');
      if (input === null) {
        return;
      }
      const name = input.trim();
      if (!name) {
        alert('Please provide a valid name.');
        return;
      }

      const newId = await (crypto as any).randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random()*16)|0, v = c === 'x' ? r : (r&0x3)|0x8;
      return v.toString(16);
      });
      const res = await fetch('http://localhost:5001/api/email-builder/new-email-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailTemplateId: newId, userId, name }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create template');
      }
      console.log({msg: 'newId', newId, res});

      setCurrentTemplateId(newId);
      resetDocument({} as any);
      fetchTemplates();
    } catch (err) {
      console.log('Failed to create new template', err);
    }
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={samplesDrawerOpen}
      sx={{
        width: samplesDrawerOpen ? SAMPLES_DRAWER_WIDTH : 0,
      }}
    >
      <Stack spacing={3} py={1} px={2} width={SAMPLES_DRAWER_WIDTH} justifyContent="space-between" height="100%">
        <Stack spacing={2} sx={{ '& .MuiButtonBase-root': { width: '100%', justifyContent: 'flex-start' } }}>
          <Typography variant="h6" component="h1" sx={{ p: 0.75 }}>
            Email Builder
          </Typography>
          <b>Sample Email Templates</b>
          <Stack alignItems="flex-start">
            <SidebarButton href="#">Empty</SidebarButton>
            <SidebarButton href="#sample/welcome">Welcome email</SidebarButton>
            <SidebarButton href="#sample/one-time-password">One-time passcode (OTP)</SidebarButton>
            <SidebarButton href="#sample/reset-password">Reset password</SidebarButton>
            <SidebarButton href="#sample/order-ecomerce">E-commerce receipt</SidebarButton>
            <SidebarButton href="#sample/subscription-receipt">Subscription receipt</SidebarButton>
            <SidebarButton href="#sample/reservation-reminder">Reservation reminder</SidebarButton>
            <SidebarButton href="#sample/post-metrics-report">Post metrics</SidebarButton>
            <SidebarButton href="#sample/respond-to-message">Respond to inquiry</SidebarButton>
          </Stack>

          <Divider />

          {/* User templates block */}
          <Stack spacing={1.25} height="100%" alignItems="flex-start">
            <b>Your Email Templates</b>
            <Button size="small" variant="contained" color="primary" fullWidth onClick={handleCreateNewTemplate}>
              Create new email template
            </Button>
            <Box
              sx={{
                width: '100%',
                overflowY: 'auto',
                height: 'auto',
                pr: 0.5,
              }}
            >
              <Stack spacing={1} height="46vh">
                {userEmailTemplates.map((tpl) => {
                  const isSelected = tpl.id === currentTemplateId;
                  return (
                    <Box
                      key={tpl.id}
                      sx={{
                        width: '100%',
                        padding: '6px',
                        cursor: isSelected ? 'default' : 'pointer',
                        '&:hover': isSelected ? {} : { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
                        borderRadius: '4px',
                        backgroundColor: isSelected ? 'grey.700' : 'transparent',
                        color: isSelected ? 'common.white' : 'inherit',
                        pointerEvents: isSelected ? 'none' : 'auto',
                      }}
                      onClick={() => { if (!isSelected) handleTemplateClick(tpl); }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {tpl.name}
                      </Typography>
                      <Typography variant="caption" color={isSelected ? 'common.white' : 'text.secondary'}>
                        Created on {(new Date((tpl.created_at?.seconds || 0) * 1000).toLocaleString())}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        </Stack>

      </Stack>
    </Drawer>
  );
}
