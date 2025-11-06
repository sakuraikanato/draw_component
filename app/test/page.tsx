"use client"
import { Draw } from "@/components/draw"
import { useState, useEffect } from "react";
import Image from "next/image";


export default function Page() {
    const [penColor, setPenColor] = useState("white");
    const [imgData, setImgData] = useState<FormData | null>(null);
    const [drawOption, setDrawOption] = useState(1);
    const [lineWidth, setLineWidth] = useState(3);
    const [isSave, setIsSave] = useState(false);
    const [imgPath, setImgPath] = useState("");
    const [isSaving, setIsSaving] = useState(false); // ✅ 保存中フラグ

    useEffect(() => {
        if (imgData) {
            // 画像データが更新されたら保存処理を実行
            handleSave();
        }
    }, [imgData]);

    const handleSave = async () => {
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
        setIsSave(false); // 保存フラグをリセット
    };


    return (
        <div className="w-[1280px] mx-auto overflow-hidden">
            <Draw 
                className="mb-40" 
                src="/ru-ku1.jpg" 
                penColor={penColor} 
                drawOption={drawOption} 
                lineWidth={lineWidth} 
                isSave={isSave} 
                setImgData={setImgData} 
            />
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="penColor" className="mr-2">ペンの色:</label>
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
                    <label htmlFor="drawOption" className="mr-2">モード:</label>
                    <select 
                        name="drawOption" 
                        id="drawOption" 
                        value={drawOption} 
                        onChange={(e) => setDrawOption(Number(e.target.value))}
                        className="border p-2"
                    >
                        <option value={1}>Pen</option>
                        <option value={2}>Eraser</option>
                        <option value={3}>Glow</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="lineWidth" className="mr-2">線の太さ: {lineWidth}</label>
                    <input 
                        type="range" 
                        id="lineWidth" 
                        min="1" 
                        max="50" 
                        value={lineWidth} 
                        onChange={(e) => setLineWidth(Number(e.target.value))} 
                    />
                </div>

                <button 
                    onClick={() => {setIsSave(true);}}
                    disabled={isSaving}
                    className={`px-6 py-2 rounded text-white ${
                        isSaving 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    {isSaving ? '保存中...' : '画像を保存'}
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