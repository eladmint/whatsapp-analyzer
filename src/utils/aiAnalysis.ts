import { Message, AIAnalysis } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function analyzeWithAI(messages: Message[]): Promise<AIAnalysis> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      content: null,
      success: false,
      error: 'Internal configuration error'
    };
  }

  // Prepare conversation data for analysis
  const conversationSummary = messages.map(msg => 
    `${msg.sender}: ${msg.content}`
  ).join('\n');

  const prompt = `As an expert in psychological analysis and behavioral patterns, provide a detailed psychological profile of the participants in this WhatsApp conversation. Focus on:

1. Core Personality Traits & Motivations:
   - What drives each participant?
   - Key personality characteristics
   - Internal motivations and desires
   - How they view themselves and others

2. Communication Patterns:
   - Individual communication styles
   - How they express or deflect emotions
   - Use of humor, sarcasm, or other communication tools
   - Patterns in conversation initiation and response

3. Emotional Processing & Coping:
   - How each person handles emotional content
   - Coping mechanisms and defense strategies
   - Emotional intelligence and awareness
   - Vulnerability patterns

4. Relationship Dynamics:
   - Power dynamics and roles
   - Areas of compatibility and tension
   - How they influence each other
   - Attachment styles and boundaries

5. Behavioral Contrasts:
   - Key differences in approaches to life
   - How these differences affect their interaction
   - Areas where they complement or challenge each other

Format the analysis as a psychological profile with clear sections and specific examples from the conversation. Include a "Final Synthesis" section that captures the core dynamic between participants.

Conversation:
${conversationSummary}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'WhatsApp Chat Analyzer',
        'Origin': window.location.origin
      },
      body: JSON.stringify({
        model: 'anthropic/claude-2',
        messages: [
          {
            role: 'system',
            content: 'You are an expert psychologist specializing in relationship dynamics, personality analysis, and behavioral patterns. Provide detailed, professional analysis with specific examples and clear insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
      } catch {
        errorMessage = errorText || `API request failed with status ${response.status}`;
      }
      
      return {
        content: null,
        success: false,
        error: errorMessage
      };
    }

    const data: OpenRouterResponse = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      return {
        content: null,
        success: false,
        error: 'Invalid response format from AI service'
      };
    }

    return {
      content: data.choices[0].message.content,
      success: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return {
      content: null,
      success: false,
      error: errorMessage
    };
  }
}

export async function analyzeSpecialLingo(messages: Message[]): Promise<string[]> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    return [];
  }

  const prompt = `Analyze the following chat messages and identify unique expressions, inside jokes, or special terms that are specific to this relationship. Focus on words or phrases that:

1. Are used in a unique or special way
2. Have meaning specific to these participants
3. Represent inside jokes or shared experiences
4. Are creative variations of standard words
5. Are consistently used by the participants

Do NOT include:
- Common words or expressions
- Standard abbreviations (like "don't", "won't", etc.)
- Generic terms
- Common internet slang

For each identified term, explain why it's special to this relationship.

Messages:
${messages.map(m => `${m.sender}: ${m.content}`).join('\n')}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'WhatsApp Chat Analyzer',
        'Origin': window.location.origin
      },
      body: JSON.stringify({
        model: 'anthropic/claude-2',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in linguistic analysis and relationship dynamics.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      return [];
    }

    // Extract terms from AI response
    const terms = data.choices[0].message.content
      .split('\n')
      .filter(line => line.includes(':'))
      .map(line => line.split(':')[0].trim())
      .slice(0, 4);

    return terms;
  } catch (error) {
    console.error('Special Lingo Analysis Error:', error);
    return [];
  }
}