'use client'

import React, { memo, useEffect, useRef, MutableRefObject } from "react";
import EditorJS, {OutputBlockData, OutputData} from "@editorjs/editorjs";
import Header from "@editorjs/header";
// @ts-ignore
import LinkTool from '@editorjs/link';
import EditorjsList from "@editorjs/list";
import Quote from "@editorjs/quote";
// @ts-ignore
import Embed from '@editorjs/embed';
import Warning from '@editorjs/warning';
// @ts-ignore
import Delimiter from '@coolbytes/editorjs-delimiter'
// @ts-ignore
import ToggleBlock from 'editorjs-toggle-block';
import ColorPicker from 'editorjs-color-picker';
// @ts-ignore
import editorjsCodecup from '@calumk/editorjs-codecup';
// @ts-ignore
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
// @ts-ignore
import Strikethrough from '@sotaproject/strikethrough';
// @ts-ignore
import DragDrop from "editorjs-drag-drop";
import ImageTool from '@editorjs/image';
import './editor.css'
import {UserCommunities} from "@/types/communities/communities";

export const EDITOR_JS_TOOLS = {
    header: {
        class: Header,
        inlineToolbar: true,
        shortcut: "CMD+SHIFT+H"
    },
    linkTool: {
        class: LinkTool,
        shortcut: "CMD+SHIFT+L",
        config: {
            endpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/communities/fetch`, // Your backend endpoint for url data fetching,
        }
    },
    list: {
        class: EditorjsList,
        inlineToolbar: true,
        config: {
            defaultStyle: 'unordered',
            maxLevel: 4,
        }
    },
    quote: {
        class: Quote,
        inlineToolbar: true,
        shortcut: "CMD+SHIFT+Q",
        config: {
            quotePlaceholder: "Enter a quote",
            captionPlaceholder: "Quote's author",
        }
    },
    embed: {
        class: Embed,
        config: {
            services: {
                youtube: true,
                instagram: true,
                twitter: true,
                twitch: true,
                imgur: true,
                github: true,
            }
        }
    },
    warning: {
        class: Warning,
        inlineToolbar: true,
        shortcut: 'CMD+SHIFT+W',
        config: {
            titlePlaceholder: 'Title',
            messagePlaceholder: 'Message',
        },
    },
    delimiter: {
        class: Delimiter,
        config: {
            styleOptions: ['star', 'dash', 'line'],
            defaultStyle: 'star',
            lineWidthOptions: [8, 15, 25, 35, 50, 60, 100],
            defaultLineWidth: 25,
            lineThicknessOptions: [1, 2, 3, 4, 5, 6],
            defaultLineThickness: 2,
        }
    },
    toggle: {
        class: ToggleBlock,
        inlineToolbar: true,
    },
    ColorPicker: {
        class: ColorPicker,
    },
    code: {
        class: editorjsCodecup,
        shortcut: 'CMD+SHIFT+C',
    },
    Marker: {
        class: Marker,
        shortcut: 'CMD+SHIFT+M',
    },
    inlineCode: {
        class: InlineCode,
    },
    strikethrough: Strikethrough,
};

interface EditorProps {
    data?: OutputBlockData[];
    editorblock: string;
    community: UserCommunities;
    onChange?: (data: OutputData) => void;
    isReadOnly?: boolean;
}

/**
 * Editor component for creating and editing content using Editor.js.
 *
 * @param {EditorProps} props - The properties for the Editor component.
 * @param {OutputBlockData[]} [props.data] - The initial data for the editor.
 * @param {string} props.editorblock - The ID of the HTML element to initialize the editor in.
 * @param {UserCommunities} props.community - The community to which the editor belongs.
 * @param {(data: OutputData) => void} [props.onChange] - Callback function to handle changes in the editor content.
 * @param {boolean} [props.isReadOnly] - Flag to set the editor in read-only mode.
 * @returns {JSX.Element} The rendered Editor component.
 */
const Editor: React.FC<EditorProps> = ({ data, editorblock, community, onChange, isReadOnly }) => {
    const ref: MutableRefObject<EditorJS | null> = useRef(null);

    useEffect(() => {
        if (!ref.current) {
            const editor = new EditorJS({
                holder: editorblock,
                placeholder: "Type / to see available blocks",
                // @ts-ignore
                tools: {
                    ...EDITOR_JS_TOOLS,
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                uploadByFile: async (file: File) => {
                                    const response = await fetch(`/dashboard/communities/${community.id}/file/${file.name}`, {
                                        method: "POST",
                                        body: file,
                                    });

                                    if (!response.ok) {
                                        throw new Error("Failed to upload image");
                                    }

                                    const data = await response.json();

                                    return {
                                        success: 1,
                                        file: {
                                            url: data.url,
                                        }
                                    }
                                }
                            }
                        },
                    },
                },
                readOnly: isReadOnly,
                autofocus: !data,
                data: data ? {
                    time: Date.now(),
                    blocks: data,
                    version: "2.22.2",
                } : undefined,
                async onChange(api, event) {
                    const data = await api.saver.save();

                    onChange && onChange(data);
                },
                onReady() {
                    new DragDrop(editor);
                },
            });
            ref.current = editor;
        }
    }, [data, editorblock]);

    return <div id={editorblock} />;
};

export default memo(Editor);