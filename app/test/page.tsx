"use client"
import { Draw } from "@/components/draw"
import { useState } from "react";

export default function Page() {
    const [penColor, setPenColor] = useState("white");
    const [imgData, setImgData] = useState<FormData | null>(null);
    const [drawOption, setDrawOption] = useState(1);
    const [lineWidth, setLineWidth] = useState(3);
    const [isSave, setIsSave] = useState(false);

    return (
        <div className="w-[1280px] mx-auto">
            <Draw className="mb-40" src="/ru-ku1.jpg" penColor={penColor} drawOption={drawOption} lineWidth={lineWidth} isSave={isSave} setImgData={setImgData} />
            <select name="penColor" id="penColor" value={penColor} onChange={(e) => setPenColor(e.target.value)}>
                <option value="white">White</option>
                <option value="black">Black</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
            </select>
            <select name="drawOption" id="drawOption" value={drawOption} onChange={(e) => setDrawOption(Number(e.target.value))}>
                <option value={1}>Pen</option>
                <option value={2}>Eraser</option>
            </select>
            <input type="range" id="lineWidth" min="1" max="50" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} />
            <button onClick={() => setIsSave(true)}>Save Image</button>
        </div>
    )
}