'use client'

import {createShapeId, getSvgAsImage, StateNode, TLTextShape} from "tldraw";
import {blobToBase64} from "@/lib/blobToBase64";
import {aiStreamText} from "@/utils/ai";

export class AiTool extends StateNode {
    static override id = 'ai';
    static override initial = 'idle';

    override async onEnter() {
        this.parent.transition('select', {})
        const selectedShapes = this.editor.getSelectedShapes()

        if (selectedShapes.length === 0) throw Error('First select something to make real.')

        const {maxX, midY} = this.editor.getSelectionPageBounds()!

        const shapeId = createShapeId()
        this.editor.createShape({
            id: shapeId,
            type: 'text',
            x: maxX + 60,
            y: midY - (540 * 2) / 3 / 2,
            props: {
                w: 100,
                text: 'Loading...',
            }
        })

        const svg = await this.editor.getSvgString(selectedShapes, {
            scale: 1,
            background: true,
        })

        if (!svg) return

        // Turn the SVG into a DataUrl
        const blob = await getSvgAsImage(this.editor, svg.svg, {
            type: 'png',
            quality: 0.8,
            height: svg.height,
            width: svg.width,
        })

        if (!blob) return

        const dataUrl = await blobToBase64(blob!)

        try {
            const stream = await aiStreamText(dataUrl)
            let text: string = ""

            for await (const textPart of stream) {
                text += textPart
                this.editor.updateShape<TLTextShape>({
                    id: shapeId,
                    type: 'text',
                    props: {
                        text: text,
                    }
                })
            }
        } catch (e) {
            this.editor.deleteShape(shapeId)
            console.error(e)
            throw Error('Failed to generate response! Please try again.')
        }
    }

    override onExit() {
        this.editor.setCursor({ type: 'default', rotation: 0 })
    }

    override onInterrupt() {
        this.complete()
    }

    override onCancel() {
        this.complete()
    }

    private complete() {
        this.parent.transition('select', {})
    }
}