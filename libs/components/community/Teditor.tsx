import { CREATE_BOARD_ARTICLE } from '@/apollo/user/mutation';
import { showError, showSuccess } from '@/libs/toast';
import { useMutation } from '@apollo/client';
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Message } from '../../enums/common.enum';
import { useDarkMode } from '../../hooks/useDarkMode';
import { T } from '../../types/common';

const TuiEditor = () => {
  const token = getJwtToken();
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(
    BoardArticleCategory.FREE,
  );

  /** APOLLO REQUESTS **/
  const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);

  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleImage, setArticleImage] = useState('');

  /** HANDLERS **/
  const uploadImage = async (image: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append(
        'operations',
        JSON.stringify({
          query: `mutation ImageUploader($file: Upload!, $target: String!) {
            imageUploader(file: $file, target: $target)
          }`,
          variables: {
            file: null,
            target: 'article',
          },
        }),
      );
      formData.append(
        'map',
        JSON.stringify({
          '0': ['variables.file'],
        }),
      );
      formData.append('0', image);

      const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'apollo-require-preflight': true,
          Authorization: `Bearer ${token}`,
        },
      });

      const responseImage = response.data.data.imageUploader;
      console.log('=responseImage: ', responseImage);
      setArticleImage(responseImage);

      return `${REACT_APP_API_URL}/${responseImage}`;
    } catch (err) {
      console.log('Error, uploadImage:', err);
      throw err;
    }
  };

  const changeCategoryHandler = (e: any) => {
    setArticleCategory(e.target.value);
  };

  const articleTitleHandler = (e: T) => {
    console.log(e.target.value);
    setArticleTitle(e.target.value);
  };

  const handleRegisterButton = async () => {
    try {
      const content = editor?.getHTML() as string;
      setArticleContent(content);

      if (content === '' && articleTitle === '') {
        throw new Error(Message.INSERT_ALL_INPUTS);
      }

      await createBoardArticle({
        variables: {
          input: { articleTitle, articleContent: content, articleImage, articleCategory },
        },
      });

      await showSuccess('Article is created successfully', 700);
      await router.push({
        pathname: '/mypage',
        query: { category: 'myArticles' },
      });
    } catch (err: any) {
      console.log(err);
      await showError(Message.INSERT_ALL_INPUTS);
    }
  };

  // Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      Placeholder.configure({
        placeholder: 'Type here...',
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: '<p>Type here...</p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: isDarkMode ? 'tiptap-editor dark-mode' : 'tiptap-editor',
      },
    },
    onUpdate: ({ editor }) => {
      // Content updated
    },
  });

  // Update editor props when dark mode changes
  useEffect(() => {
    if (editor) {
      const currentClass = editor.view.dom.className;
      const newClass = isDarkMode ? 'tiptap-editor dark-mode' : 'tiptap-editor';
      if (currentClass !== newClass) {
        editor.view.dom.className = newClass;
      }
    }
  }, [isDarkMode, editor]);

  // Handle image upload
  useEffect(() => {
    if (!editor) return;

    const handlePaste = (view: any, event: ClipboardEvent) => {
      const items = Array.from(event.clipboardData?.items || []);
      const imageItem = items.find((item) => item.type.indexOf('image') !== -1);

      if (imageItem) {
        event.preventDefault();
        const file = imageItem.getAsFile();
        if (file) {
          handleImageUpload(file);
        }
      }
    };

    const handleDrop = (view: any, event: DragEvent) => {
      const files = Array.from(event.dataTransfer?.files || []);
      const imageFile = files.find((file) => file.type.indexOf('image') !== -1);

      if (imageFile) {
        event.preventDefault();
        handleImageUpload(imageFile);
      }
    };

    const handleImageUpload = async (file: File) => {
      try {
        const imageUrl = await uploadImage(file);
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } catch (error) {
        showError('Failed to upload image');
      }
    };

    // Add image button handler
    const addImageButton = document.querySelector('.add-image-button');
    if (addImageButton) {
      const handleImageButtonClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          if (file) {
            handleImageUpload(file);
          }
        };
        input.click();
      };
      addImageButton.addEventListener('click', handleImageButtonClick);
    }

    return () => {
      // Cleanup
    };
  }, [editor, isDarkMode]);

  // Update editor dark mode - real-time tracking
  useEffect(() => {
    if (!editor) return;

    const updateEditorDarkMode = () => {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        const editorElement = editor.view.dom.closest('.tiptap-editor-wrapper');
        const proseMirrorElement = editor.view.dom;

        if (!editorElement) return;

        // Check current dark mode state from multiple sources
        const isDark =
          isDarkMode ||
          document.documentElement.classList.contains('dark-mode') ||
          document.body.classList.contains('dark-mode');

        // Update classes
        if (isDark) {
          editorElement.classList.add('dark-mode');
          if (proseMirrorElement) {
            proseMirrorElement.classList.add('dark-mode');
          }
        } else {
          editorElement.classList.remove('dark-mode');
          if (proseMirrorElement) {
            proseMirrorElement.classList.remove('dark-mode');
          }
        }
      }, 0);
    };

    // Update immediately when isDarkMode changes
    updateEditorDarkMode();

    // Watch for dark-mode class changes on document (real-time)
    const observer = new MutationObserver(() => {
      updateEditorDarkMode();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Also watch for editor element changes
    const editorElement = editor.view.dom.closest('.tiptap-editor-wrapper');
    if (editorElement) {
      observer.observe(editorElement, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [isDarkMode, editor]);

  if (!editor) {
    return null;
  }

  return (
    <Stack className={isDarkMode ? 'dark-mode' : ''}>
      <Stack direction="row" style={{ margin: '40px' }} justifyContent="space-evenly">
        <Box component={'div'} className={'form_row'} style={{ width: '300px' }}>
          <Typography
            style={{
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#7f838d',
              margin: '10px',
            }}
            variant="h3"
          >
            Category
          </Typography>
          <FormControl
            sx={{
              width: '100%',
              background: isDarkMode ? '#1e2128' : 'white',
            }}
          >
            <Select
              value={articleCategory}
              onChange={changeCategoryHandler}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
              sx={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
                backgroundColor: isDarkMode ? '#1e2128' : 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : '#1976d2',
                },
                '& .MuiSvgIcon-root': {
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: isDarkMode ? '#1e2128' : 'white',
                    '& .MuiMenuItem-root': {
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
                      backgroundColor: isDarkMode ? '#1e2128' : 'white',
                      '&:hover': {
                        backgroundColor: isDarkMode ? '#252830' : '#f5f5f5',
                      },
                      '&.Mui-selected': {
                        backgroundColor: isDarkMode ? '#252830' : '#e3f2fd',
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#1976d2',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#252830' : '#e3f2fd',
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value={BoardArticleCategory.FREE}>
                <span>Community</span>
              </MenuItem>
              <MenuItem value={BoardArticleCategory.HUMOR}>Neighborhood</MenuItem>
              <MenuItem value={BoardArticleCategory.NEWS}>Trends</MenuItem>
              <MenuItem value={BoardArticleCategory.RECOMMEND}>Living Tips</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box component={'div'} style={{ width: '300px', flexDirection: 'column' }}>
          <Typography
            style={{
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#7f838d',
              margin: '10px',
            }}
            variant="h3"
          >
            Title
          </Typography>
          <TextField
            onChange={articleTitleHandler}
            id="filled-basic"
            label="Type Title"
            sx={{
              width: '300px',
              background: isDarkMode ? '#1e2128' : 'white',
              '& .MuiOutlinedInput-root': {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : '#1976d2',
                },
              },
              '& .MuiInputLabel-root': {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#181a20',
                '&.Mui-focused': {
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#1976d2',
                },
              },
            }}
          />
        </Box>
      </Stack>

      {/* Tiptap Toolbar */}
      <Box
        sx={{
          margin: '0 40px',
          padding: '12px 16px',
          backgroundColor: isDarkMode ? '#252830' : '#f5f5f5',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'}`,
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          variant={editor.isActive('bold') ? 'contained' : 'outlined'}
          size="small"
          sx={{
            minWidth: 'auto',
            padding: '4px 12px',
            backgroundColor: editor.isActive('bold') && isDarkMode ? '#1e2128' : undefined,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            '&:hover': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
            },
          }}
        >
          <strong>B</strong>
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          variant={editor.isActive('italic') ? 'contained' : 'outlined'}
          size="small"
          sx={{
            minWidth: 'auto',
            padding: '4px 12px',
            backgroundColor: editor.isActive('italic') && isDarkMode ? '#1e2128' : undefined,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            fontStyle: 'italic',
            '&:hover': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
            },
          }}
        >
          I
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          variant={editor.isActive('underline') ? 'contained' : 'outlined'}
          size="small"
          sx={{
            minWidth: 'auto',
            padding: '4px 12px',
            backgroundColor: editor.isActive('underline') && isDarkMode ? '#1e2128' : undefined,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            textDecoration: 'underline',
            '&:hover': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
            },
          }}
        >
          U
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          variant={editor.isActive('strike') ? 'contained' : 'outlined'}
          size="small"
          sx={{
            minWidth: 'auto',
            padding: '4px 12px',
            backgroundColor: editor.isActive('strike') && isDarkMode ? '#1e2128' : undefined,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            textDecoration: 'line-through',
            '&:hover': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
            },
          }}
        >
          S
        </Button>
        <Box
          sx={{
            width: '1px',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            margin: '0 4px',
          }}
        />
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          variant={editor.isActive('heading', { level: 1 }) ? 'contained' : 'outlined'}
          size="small"
          sx={{
            minWidth: 'auto',
            padding: '4px 12px',
            backgroundColor:
              editor.isActive('heading', { level: 1 }) && isDarkMode ? '#1e2128' : undefined,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            fontSize: '18px',
            fontWeight: 'bold',
            '&:hover': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
            },
          }}
        >
          H1
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          variant={editor.isActive('heading', { level: 2 }) ? 'contained' : 'outlined'}
          size="small"
          sx={{
            minWidth: 'auto',
            padding: '4px 12px',
            backgroundColor:
              editor.isActive('heading', { level: 2 }) && isDarkMode ? '#1e2128' : undefined,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            fontSize: '16px',
            fontWeight: 'bold',
            '&:hover': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
            },
          }}
        >
          H2
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          variant={editor.isActive('heading', { level: 3 }) ? 'contained' : 'outlined'}
          size="small"
          sx={{
            minWidth: 'auto',
            padding: '4px 12px',
            backgroundColor:
              editor.isActive('heading', { level: 3 }) && isDarkMode ? '#1e2128' : undefined,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            fontSize: '14px',
            fontWeight: 'bold',
            '&:hover': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
            },
          }}
        >
          H3
        </Button>
        <Box
          sx={{
            width: '1px',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            margin: '0 4px',
          }}
        />
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant={editor.isActive('bulletList') ? 'contained' : 'outlined'}
          size="small"
          sx={{
            minWidth: 'auto',
            padding: '4px 12px',
            backgroundColor: editor.isActive('bulletList') && isDarkMode ? '#1e2128' : undefined,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            '&:hover': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
            },
          }}
        >
          •
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          variant={editor.isActive('orderedList') ? 'contained' : 'outlined'}
          size="small"
          sx={{
            minWidth: 'auto',
            padding: '4px 12px',
            backgroundColor: editor.isActive('orderedList') && isDarkMode ? '#1e2128' : undefined,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            '&:hover': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
            },
          }}
        >
          1.
        </Button>
        <Box
          sx={{
            width: '1px',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            margin: '0 4px',
          }}
        />
        <Button
          className="add-image-button"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e: any) => {
              const file = e.target.files[0];
              if (file) {
                try {
                  const imageUrl = await uploadImage(file);
                  editor.chain().focus().setImage({ src: imageUrl }).run();
                } catch (error) {
                  showError('Failed to upload image');
                }
              }
            };
            input.click();
          }}
          variant="outlined"
          size="small"
          sx={{
            minWidth: 'auto',
            padding: '4px 12px',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            '&:hover': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
            },
          }}
        >
          📷 Image
        </Button>
        <Button
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          variant={editor.isActive('link') ? 'contained' : 'outlined'}
          size="small"
          sx={{
            minWidth: 'auto',
            padding: '4px 12px',
            backgroundColor: editor.isActive('link') && isDarkMode ? '#1e2128' : undefined,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
            '&:hover': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#bdbdbd',
            },
          }}
        >
          🔗 Link
        </Button>
      </Box>

      {/* Tiptap Editor Content */}
      <Box
        className="tiptap-editor-wrapper"
        sx={{
          margin: '0 40px',
          padding: '16px',
          minHeight: '640px',
          backgroundColor: isDarkMode ? '#1e2128' : '#ffffff',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'}`,
          borderRadius: '0 0 8px 8px',
          '& .tiptap-editor': {
            minHeight: '600px',
            outline: 'none',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
            '& p': {
              margin: '8px 0',
              lineHeight: '1.6',
            },
            '& h1, & h2, & h3': {
              margin: '16px 0 8px 0',
              fontWeight: 'bold',
            },
            '& ul, & ol': {
              paddingLeft: '24px',
              margin: '8px 0',
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
              margin: '16px 0',
            },
            '& a': {
              color: isDarkMode ? '#87cdf9' : '#1976d2',
              textDecoration: 'underline',
            },
            '& .tiptap-placeholder': {
              color: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : '#9e9e9e',
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      <Stack direction="row" justifyContent="center">
        <Button
          variant="contained"
          sx={{
            margin: '30px',
            width: 'auto',
            minWidth: '150px',
            height: '44px',
            padding: '12px 24px',
            borderRadius: '12px',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#181a20',
            color: isDarkMode ? '#181a20' : '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: 'normal',
            transition: 'background-color 0.3s ease, color 0.3s ease',
            '&:hover': {
              backgroundColor: isDarkMode ? '#ffffff' : '#2a2d35',
            },
          }}
          onClick={handleRegisterButton}
        >
          Create
        </Button>
      </Stack>
    </Stack>
  );
};

export default TuiEditor;
