import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        console.log('[API] リクエスト受信');
        
        // ✅ request.formData() を await で呼び出す
        const formData = await request.formData();
        const file = formData.get('image');
        
        if (!file) {
            console.error('[API] 画像がありません');
            return NextResponse.json({ 
                success: false,
                message: '画像がありません' 
            }, { status: 400 });
        }

        console.log('[API] ファイル情報:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        // Blobをバッファに変換
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // ファイル名とパス
        const fileName = `drawing-${Date.now()}.png`;
        const filePath = path.join(process.cwd(), 'public', fileName);

        console.log('[API] 保存パス:', filePath);

        // 保存
        await writeFile(filePath, buffer);

        console.log('[API] 保存成功');

        return NextResponse.json({
            success: true,
            path: `/${fileName}`,
        });

    } catch (error) {
        console.error('[API] 保存エラー:', error);
        return NextResponse.json({ 
            success: false,
            message: error.message || '保存失敗'
        }, { status: 500 });
    }
}