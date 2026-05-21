"use client"
import { Draw, ChildRef } from "@/components/draw"
import { useState, useEffect, useRef } from "react";
import Image from "next/image";


export default function Page() {
    const [penColor, setPenColor] = useState("white");
    const [imgData, setImgData] = useState<FormData | null>(null);
    const [drawOption, setDrawOption] = useState(1);
    const [lineWidth, setLineWidth] = useState(3);
    const [imgPath, setImgPath] = useState("");
    const [isSaving, setIsSaving] = useState(false); // ✅ 保存中フラグ

    const ChildRef = useRef<ChildRef | null>(null);

    const handleSave = async () => {
        await ChildRef.current?.setImg();
        if (!imgData) return;

        const response = await fetch('/api/save_img', {
            method: 'POST',
            body: imgData,
        }).then(res => res.json());
        console.log('保存レスポンス:', response);

        if (response.success) {
            setImgPath(response.path ? response.path : ""); // サーバーから返された画像のパスを設定
        } else {
            console.error('画像の保存に失敗しました');
        }

        setIsSaving(false); // ✅ 保存処理が完了したらフラグをリセット
    };

        // Undo ボタンのハンドラー
    const handleUndo = () => {
        ChildRef.current?.undoRedo(true)
    };

    // Redo ボタンのハンドラー
    const handleRedo = () => {
        ChildRef.current?.undoRedo(false);
    };

    // Clear ボタンのハンドラー
    const handleClear = () => {
        const confirmed = window.confirm('描画内容をすべてクリアしますか？');
        if (confirmed) {
            ChildRef.current?.clearCanvas();
        }
    };

    // ✅ 新規追加: キーボードショートカット（Ctrl+Z / Cmd+Z で Undo）
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+Z または Cmd+Z で Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            }
            // Ctrl+Shift+Z または Cmd+Shift+Z で Redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                handleRedo();
            }
            // Ctrl+Y または Cmd+Y でも Redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


    return (
        <div className="w-7xl mx-auto overflow-hidden">
            <Draw 
                className="mb-20" 
                src="/ru-ku1.jpg" 
                penColor={penColor} 
                drawOption={drawOption} 
                lineWidth={lineWidth} 
                ref={ChildRef}
                setImgData={setImgData} 
            />
            
            <div className="space-y-4 touchable flex">
                <div>
                    <label htmlFor="penColor" className="mr-2 mx-2">ペンの色:</label>
                    <select 
                        name="penColor" 
                        id="penColor" 
                        value={penColor} 
                        onChange={(e) => setPenColor(e.target.value)}
                        className="border p-2"
                    >
                        <option value="white">White</option>
                        <option value="black">Black</option>
                        <option value="red">Red</option>
                        <option value="green">Green</option>
                        <option value="blue">Blue</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="drawOption" className="mr-2 mx-2">モード:</label>
                    <select 
                        name="drawOption" 
                        id="drawOption" 
                        value={drawOption} 
                        onChange={(e) => setDrawOption(Number(e.target.value))}
                        className="border p-2 mx-2"
                    >
                        <option value={0}>Eraser</option>
                        <option value={1}>Pen</option>
                        <option value={2}>Glow</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="lineWidth" className="mr-2 mx-2">線の太さ: {lineWidth}</label>
                    <input 
                        type="range" 
                        id="lineWidth" 
                        min="1" 
                        max="50" 
                        className="mr-2"
                        value={lineWidth} 
                        onChange={(e) => setLineWidth(Number(e.target.value))} 
                    />
                </div>

                {/* 画像保存ボタン */}
                <button 
                    onClick={() => {handleSave(); setIsSaving(true);}}
                    disabled={isSaving}
                    className={`px-6 py-2 rounded text-white ${
                        isSaving 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    {isSaving ? '保存中...' : '📸 画像を保存'}
                </button>

                {/* ✅ 新規追加: Undo ボタン */}
                <button 
                    onClick={handleUndo}
                    className="px-6 py-2 rounded text-white bg-orange-500 hover:bg-orange-600"
                    title="元に戻す (Ctrl+Z)"
                >
                    ↩️ Undo
                </button>

                {/* ✅ 新規追加: Redo ボタン */}
                <button 
                    onClick={handleRedo}
                    className="px-6 py-2 rounded text-white bg-purple-500 hover:bg-purple-600"
                    title="やり直す (Ctrl+Shift+Z)"
                >
                    ↪️ Redo
                </button>

                {/* ✅ 新規追加: Clear ボタン */}
                <button 
                    onClick={handleClear}
                    className="px-6 py-2 rounded text-white bg-red-500 hover:bg-red-600"
                    title="すべてクリア"
                >
                    🗑️ Clear
                </button>
            </div>

            {imgPath && (
                <div className="mt-8 p-4 border rounded">
                    <h3 className="text-xl font-bold mb-4">保存された画像:</h3>
                    <div className="relative w-full h-[500px]">
                        <Image 
                            src={imgPath} 
                            alt="Saved Drawing"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">パス: {imgPath}</p>
                </div>
            )}
        </div>
    )
}