import { parseWhatsAppExport, analyzeChat } from './utils/chatParser';
import { analyzeWithAI } from './utils/aiAnalysis';
import type { ChatData } from './types';

export async function handleShareTarget(formData: FormData): Promise<ChatData | null> {
  const file = formData.get('chat') as File;
  if (!file) return null;

  try {
    const content = await file.text();
    const messages = parseWhatsAppExport(content);
    const participants = [...new Set(messages.map(m => m.sender))];
    const stats = analyzeChat(messages);
    
    try {
      const aiResult = await analyzeWithAI(messages);
      stats.aiAnalysis = aiResult;
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Continue without AI analysis if it fails
      stats.aiAnalysis = {
        content: null,
        success: false,
        error: 'AI analysis unavailable'
      };
    }
    
    return {
      messages,
      participants,
      stats
    };
  } catch (error) {
    console.error('Error processing shared file:', error);
    return null;
  }
}