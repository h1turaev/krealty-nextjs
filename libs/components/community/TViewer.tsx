import { Box, CircularProgress, Stack } from '@mui/material';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Viewer } from '@toast-ui/react-editor';
import { useEffect, useState } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';

const TViewer = (props: any) => {
  const [editorLoaded, setEditorLoaded] = useState(false);
  const { isDarkMode } = useDarkMode();

  /** LIFECYCLES **/
  useEffect(() => {
    if (props.markdown) {
      setEditorLoaded(true);
    } else {
      setEditorLoaded(false);
    }
  }, [props.markdown]);

  return (
    <Stack
      sx={{
        background: isDarkMode ? '#1e2128' : 'white',
        mt: 0,
        borderRadius: '10px',
        transition: 'background-color 0.3s ease',
        width: '100%',
        maxWidth: '600px',
      }}
    >
      <Box
        component={'div'}
        sx={{
          m: 0,
          p: 0,
          '& :global(.toastui-editor-contents)': {
            '& img': {
              maxWidth: '100% !important',
              width: '100% !important',
              height: 'auto !important',
              maxHeight: '400px !important',
              margin: '0 !important',
              padding: '0 !important',
              display: 'block !important',
              marginBottom: '0 !important',
              objectFit: 'cover !important',
              borderRadius: '0 !important',
            },
          },
        }}
      >
        {editorLoaded ? (
          <Viewer
            initialValue={props.markdown}
            customHTMLRenderer={{
              htmlBlock: {
                iframe(node: any) {
                  return [
                    {
                      type: 'openTag',
                      tagName: 'iframe',
                      outerNewLine: true,
                      attributes: node.attrs,
                    },
                    { type: 'html', content: node.childrenHTML ?? '' },
                    { type: 'closeTag', tagName: 'iframe', outerNewLine: true },
                  ];
                },
                div(node: any) {
                  return [
                    { type: 'openTag', tagName: 'div', outerNewLine: true, attributes: node.attrs },
                    { type: 'html', content: node.childrenHTML ?? '' },
                    { type: 'closeTag', tagName: 'div', outerNewLine: true },
                  ];
                },
              },
              htmlInline: {
                big(node: any, { entering }: any) {
                  return entering
                    ? { type: 'openTag', tagName: 'big', attributes: node.attrs }
                    : { type: 'closeTag', tagName: 'big' };
                },
              },
            }}
          />
        ) : (
          <CircularProgress />
        )}
      </Box>
    </Stack>
  );
};

export default TViewer;
