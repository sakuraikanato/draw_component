"use client";
import React, { use, useRef, useState, useEffect, Dispatch, SetStateAction } from "react";

/*
drawOption

1 = ペン
2 = 消しゴム

*/

interface DrawProps {
    className?: string;
    src: string;
    penColor?: string;
    drawOption: number;
    lineWidth: number;
    isSave: boolean;
    setImgData: Dispatch<SetStateAction<FormData | null>>;
}

export const Draw = ({ className,src, penColor = "white", drawOption = 1, lineWidth = 3, isSave, setImgData }: DrawProps) => {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgCanvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const x = useRef(0);
    const y = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctxRef.current = ctx;


        const imgCanvas = imgCanvasRef.current;
        if (!imgCanvas) return;
        const imgCtx = imgCanvas.getContext("2d");
        if (!imgCtx) return;

        const img = new Image();
        img.src = src;
        img.onload = () => {
            imgCtx.drawImage(img, 0, 0, imgCanvas.width, imgCanvas.height);
        };
    }, []);

    useEffect(() => {
        if (isSave) {
            saveImage();
        }
    }, [isSave]);

    const getCoordinate = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        let clientX: number, clientY: number;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        x.current = clientX - rect.left;
        y.current = clientY - rect.top;
    };
    const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!ctx || !canvas) return;

        getCoordinate(e);
        isDrawingRef.current = true;
    };

    const handleEnd = () => {
        isDrawingRef.current = false;
    };

    const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!ctx || !canvas) return;

        if (!isDrawingRef.current) return;

        const oldX = x.current;
        const oldY = y.current;

        getCoordinate(e);

        drawLine(ctx, oldX, oldY, x.current, y.current);
    };

    // 線を描く関数
    function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {

        // -----描画オプション-----
        switch (drawOption) {
            case 1: // ペン
                ctx.globalCompositeOperation = "source-over";
                break;
            case 2: // 消しゴム
                ctx.globalCompositeOperation = "destination-out";
                break;
            default:
                ctx.globalCompositeOperation = "source-over";
        }
        ctx.strokeStyle = penColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        // ----------------------

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    };

    // 画像保存
    const saveImage = () => {
        const imgCanvas = imgCanvasRef.current;
        const drawCanvas = canvasRef.current;
        if (!imgCanvas || !drawCanvas) return;

        // 結合用canvas
        const mergedCanvas = document.createElement("canvas");
        mergedCanvas.width = 1280;
        mergedCanvas.height = 720;
        const mergedCtx = mergedCanvas.getContext("2d");
        if (!mergedCtx) return;

        // 背景画像
        mergedCtx.drawImage(imgCanvas, 0, 0);

        // 描画内容
        mergedCtx.drawImage(drawCanvas, 0, 0);

        // formDataに変換して親コンポーネントに渡す
        mergedCanvas.toBlob((blob) => {
            if (!blob) return;

            const formData = new FormData();
            formData.append("image", blob, `drawing-${Date.now()}.png`);
            setImgData(formData);

        }, "image/png");
    };

    return (
        <div className={className}>
            <div className="relative w-[1280px] h-[720px]">
                {/* 背景画像用Canvas */}
                <canvas
                    ref={imgCanvasRef}
                    width={1280}
                    height={720}
                    className="absolute top-0 left-0 border-white"
                ></canvas>
                {/* 描画用Canvas */}
                <canvas
                    ref={canvasRef}
                    width={1280}
                    height={720}
                    className="absolute top-0 left-0 border-white"
                    onMouseDown={handleStart}
                    onMouseUp={handleEnd}
                    onMouseMove={handleMove}
                    onTouchStart={handleStart}
                    onTouchEnd={handleEnd}
                    onTouchMove={handleMove}
                ></canvas>
            </div>
        </div>
    )
}