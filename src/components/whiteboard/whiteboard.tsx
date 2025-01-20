'use client'

import {useSync} from "@tldraw/sync";
import { useMemo } from "react";
import {
    DefaultToolbar,
    DefaultToolbarContent,
    TLAssetStore, TLComponents,
    Tldraw,
    TldrawUiMenuItem,
    TLUiAssetUrlOverrides,
    TLUiOverrides,
    uniqueId,
    useIsToolSelected, useTools
} from "tldraw";
import 'tldraw/tldraw.css'
import {Profile} from "@/types/profile";
import {AiTool} from "@/components/whiteboard/ai/AiTool";
import ai from "@public/ai.svg";

interface WhiteboardProps {
    id: string;
    token: string;
    profile: Profile;
}

const customTools = [AiTool]

function CustomToolbar() {
    const tools = useTools()
    const isAiToolSelected = useIsToolSelected(tools['ai'])
    return (
        <DefaultToolbar>
            <TldrawUiMenuItem {...tools['ai']} isSelected={isAiToolSelected} />
            <DefaultToolbarContent />
        </DefaultToolbar>
    )
}

const customAssetUrls: TLUiAssetUrlOverrides = {
    icons: {
        'tool-ai': ai.src,
    },
}

const customComponents: TLComponents = {
    Toolbar: CustomToolbar,
}

export function Whiteboard({ id, token, profile}: WhiteboardProps) {
    const multiplayerAssets = useMemo(() => createMultiplayerAssets(id), [id]);

    const store = useSync({
        uri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/whiteboard?id=${id}&jwt=${token}`,
        assets: multiplayerAssets,
        userInfo: {
            id: profile!.id,
            name: profile?.name
        }
    })

    const customUiOverrides: TLUiOverrides = {
        tools(editor, tools) {
            return {
                ...tools,
                ai: {
                    id: 'ai',
                    label: 'Ai',
                    icon: 'tool-ai',
                    onSelect() {
                        editor.setCurrentTool('ai')
                    },
                }
            }
        }
    }


    return (
        <Tldraw store={store} className="h-screen" tools={customTools} overrides={customUiOverrides} assetUrls={customAssetUrls} components={customComponents} />
    )
}

const createMultiplayerAssets = (id: string): TLAssetStore => ({
    async upload(_asset, file) {
        const uid = uniqueId()
        const objectName = `${uid}-${file.name}`;
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/whiteboard/${id}/file/${encodeURIComponent(objectName)}`;

        const response = await fetch(url, {
            method: 'POST',
            body: file,
        });

        if (!response.ok) {
            throw new Error(`Failed to upload asset: ${response.statusText}`);
        }

        return url;
    },

    resolve(asset) {
        return asset.props.src;
    },
});