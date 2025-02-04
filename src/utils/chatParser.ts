import { Message, ChatStats, EmotionalMetrics, CommunicationStyle, WordCloudData, SpecialTerm, ImageAnalytics } from '../types';

// Emotion-related word lists
const emotionalWords = {
  positive: ['happy', 'love', 'great', 'awesome', 'excited', 'wonderful', 'good', 'nice', 'fun', 'beautiful'],
  negative: ['sad', 'angry', 'upset', 'hate', 'terrible', 'bad', 'awful', 'worried', 'stressed', 'annoyed'],
  vulnerable: ['feel', 'miss', 'need', 'sorry', 'hurt', 'alone', 'afraid', 'worried', 'confused', 'help'],
  humor: ['lol', 'haha', 'lmao', '😂', '🤣', 'funny', 'joke', 'hilarious', '😅', '😆']
};

// Common words to exclude (expanded list)
const excludedWords = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
  'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
  'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
  'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
  'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
  'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
  'give', 'day', 'most', 'cant', 'cant', 'wont', 'dont', 'dont',
  'null', '<media', 'omitted>', "i'll", 'im', "i'm", 'ive', "i've",
  'message', 'deleted', 'http', 'https', 'www', 'com',
  'still', 'hey', 'meet', 'got', 'get', 'getting', 'goes', 'going', 'gone',
  'come', 'coming', 'came', 'want', 'wanted', 'wants', 'need', 'needed', 'needs',
  'look', 'looking', 'looked', 'see', 'seeing', 'seen', 'saw', 'watch', 'watching',
  'think', 'thinking', 'thought', 'know', 'knowing', 'knew', 'known',
  'yes', 'yeah', 'yep', 'no', 'nope', 'not', 'ok', 'okay', 'sure', 'right',
  'good', 'great', 'nice', 'cool', 'awesome', 'amazing', 'wow', 'omg', 'oh',
  'lol', 'haha', 'hehe', 'hmm', 'well', 'like', 'really', 'just', 'actually',
  'maybe', 'probably', 'definitely', 'absolutely', 'totally', 'basically',
  'anyway', 'though', 'although', 'however', 'but', 'and', 'or', 'so', 'then',
  'now', 'later', 'soon', 'today', 'tomorrow', 'yesterday', 'morning', 'evening',
  'night', 'time', 'week', 'month', 'year', 'day', 'hour', 'minute', 'second',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december'
];

function parseWhatsAppExport(text: string): Message[] {
  const lines = text.split('\n');
  const messages: Message[] = [];
  
  const messageRegex = /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}(?:,|\s)\s*\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]?\s+-?\s+([^:]+):\s+(.+)/i;

  for (const line of lines) {
    const match = line.match(messageRegex);
    if (match) {
      const [, timestamp, sender, content] = match;
      try {
        const date = new Date(timestamp.replace(',', ''));
        if (!isNaN(date.getTime())) {
          messages.push({
            sender: sender.trim(),
            content: content.trim(),
            timestamp: date
          });
        }
      } catch (e) {
        console.warn('Failed to parse date:', timestamp);
      }
    }
  }

  return messages;
}

function calculateEmotionalMetrics(messages: Message[], sender: string): EmotionalMetrics {
  const userMessages = messages.filter(m => m.sender === sender);
  const totalMessages = userMessages.length;
  
  let emotionalExpressions = 0;
  let positiveExpressions = 0;
  let negativeExpressions = 0;
  let humorExpressions = 0;
  let vulnerableExpressions = 0;

  const examples = {
    positive: [] as Message[],
    negative: [] as Message[],
    humor: [] as Message[],
    vulnerable: [] as Message[]
  };

  userMessages.forEach(msg => {
    const content = msg.content.toLowerCase();
    
    // Count and collect examples for positive expressions
    const hasPositive = emotionalWords.positive.some(word => content.includes(word));
    if (hasPositive) {
      emotionalExpressions++;
      positiveExpressions++;
      if (examples.positive.length < 3) {
        examples.positive.push(msg);
      }
    }
    
    // Count and collect examples for negative expressions
    const hasNegative = emotionalWords.negative.some(word => content.includes(word));
    if (hasNegative) {
      emotionalExpressions++;
      negativeExpressions++;
      if (examples.negative.length < 3) {
        examples.negative.push(msg);
      }
    }
    
    // Count and collect examples for humor
    const hasHumor = emotionalWords.humor.some(word => content.includes(word));
    if (hasHumor) {
      humorExpressions++;
      if (examples.humor.length < 3) {
        examples.humor.push(msg);
      }
    }
    
    // Count and collect examples for vulnerability
    const hasVulnerable = emotionalWords.vulnerable.some(word => content.includes(word));
    if (hasVulnerable) {
      vulnerableExpressions++;
      if (examples.vulnerable.length < 3) {
        examples.vulnerable.push(msg);
      }
    }
  });

  return {
    expressiveness: emotionalExpressions / Math.max(totalMessages, 1),
    positivity: (positiveExpressions - negativeExpressions) / Math.max(totalMessages, 1),
    humor: humorExpressions / Math.max(totalMessages, 1),
    vulnerability: vulnerableExpressions / Math.max(totalMessages, 1),
    examples
  };
}

function calculateCommunicationStyle(messages: Message[], sender: string): CommunicationStyle {
  const userMessages = messages.filter(m => m.sender === sender);
  const totalMessages = userMessages.length;
  
  let totalResponseTime = 0;
  let responseCount = 0;
  let initiations = 0;
  const examples = {
    longMessages: [] as Message[],
    quickResponses: [] as Message[],
    topicStarters: [] as Message[]
  };
  
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].sender === sender) {
      const timeDiff = messages[i].timestamp.getTime() - messages[i-1].timestamp.getTime();
      
      if (messages[i-1].sender !== sender) {
        totalResponseTime += timeDiff;
        responseCount++;
        
        if (timeDiff < 60000) { // Response within a minute
          examples.quickResponses.push(messages[i]);
        }
      }

      if (i === 0 || messages[i-1].timestamp.getTime() - messages[i].timestamp.getTime() > 3600000) {
        initiations++;
        examples.topicStarters.push(messages[i]);
      }

      if (messages[i].content.length > 200) {
        examples.longMessages.push(messages[i]);
      }
    }
  }

  // Limit examples
  examples.longMessages = examples.longMessages.slice(0, 3);
  examples.quickResponses = examples.quickResponses.slice(0, 3);
  examples.topicStarters = examples.topicStarters.slice(0, 3);

  return {
    averageResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0,
    messageLength: userMessages.reduce((acc, msg) => acc + msg.content.length, 0) / Math.max(totalMessages, 1),
    initiatesConversations: initiations,
    topicsIntroduced: [],
    emotionalTone: {
      humor: 0,
      seriousness: 0,
      support: 0,
      conflict: 0
    },
    examples
  };
}

function analyzeSpecialLingo(messages: Message[]): SpecialTerm[] {
  const terms: SpecialTerm[] = [];
  const wordUsage: Record<string, {
    count: number;
    users: Set<string>;
    examples: Message[];
    contexts: string[];
  }> = {};

  // Patterns to identify special terms
  const patterns = {
    emoji: /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u,
    nickname: /^[A-Z][a-z]+y$|^[A-Z][a-z]+ie$|^[A-Z][a-z]+(o|sy)$/,  // Common nickname patterns
    place: /^[A-Z][a-zA-Z\s\-\']+$/,  // Capitalized place names
    slang: /^[a-z]+ing$|^[a-z]+ed$|^[a-z]+s$/,  // Common word endings to exclude
    url: /^https?:\/\//,
    punctuation: /[.,!?]/g
  };

  // Context window size for analyzing word usage
  const CONTEXT_WINDOW = 3;

  // Analyze each message
  messages.forEach((msg, msgIndex) => {
    // Get surrounding messages for context
    const contextMessages = messages.slice(
      Math.max(0, msgIndex - CONTEXT_WINDOW),
      msgIndex + CONTEXT_WINDOW + 1
    );
    
    // Split message into words and clean them
    const words = msg.content
      .split(/\s+/)
      .map(word => word.replace(patterns.punctuation, ''))
      .filter(word => word.length > 1);

    // Analyze each word in context
    words.forEach((word, wordIndex) => {
      // Skip common words and patterns
      if (
        excludedWords.includes(word.toLowerCase()) ||
        patterns.url.test(word) ||
        patterns.slang.test(word) ||
        word.length < 2
      ) {
        return;
      }

      const key = word;
      if (!wordUsage[key]) {
        wordUsage[key] = {
          count: 0,
          users: new Set(),
          examples: [],
          contexts: []
        };
      }

      // Get surrounding words for context
      const context = words
        .slice(Math.max(0, wordIndex - 2), wordIndex + 3)
        .join(' ');
      
      wordUsage[key].count++;
      wordUsage[key].users.add(msg.sender);
      if (wordUsage[key].examples.length < 5) {
        wordUsage[key].examples.push(msg);
      }
      if (wordUsage[key].contexts.length < 3) {
        wordUsage[key].contexts.push(context);
      }
    });
  });

  // Filter and categorize special terms
  Object.entries(wordUsage)
    .filter(([word, usage]) => {
      const isEmoji = patterns.emoji.test(word);
      const isNickname = patterns.nickname.test(word);
      const isPlace = patterns.place.test(word);
      const isUnique = usage.count >= 3 && usage.count <= messages.length * 0.01;
      const isGroupSpecific = usage.users.size <= 2;

      // Keep terms that are either:
      return (
        isUnique && (
          isEmoji || // Emoji sequences
          isNickname || // Nicknames
          isPlace || // Place names
          isGroupSpecific || // Group-specific terms
          // Or appears in similar contexts (indicating special meaning)
          (usage.contexts.length >= 2 && 
           new Set(usage.contexts).size < usage.contexts.length)
        )
      );
    })
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 15) // Keep top 15 most significant terms
    .forEach(([term, usage]) => {
      let meaning = 'Unique expression';
      if (patterns.emoji.test(term)) {
        meaning = 'Frequently used emoji';
      } else if (patterns.nickname.test(term)) {
        meaning = 'Nickname or term of endearment';
      } else if (patterns.place.test(term)) {
        meaning = 'Frequently mentioned location';
      } else if (usage.users.size === 1) {
        meaning = `Expression unique to ${Array.from(usage.users)[0]}`;
      } else if (usage.contexts.length >= 2) {
        meaning = 'Group-specific term with special meaning';
      }

      terms.push({
        term,
        meaning,
        users: Array.from(usage.users),
        frequency: usage.count,
        examples: usage.examples
      });
    });

  return terms;
}

function calculateWordCloud(messages: Message[]): WordCloudData[] {
  const wordCount: Record<string, number> = {};
  
  messages.forEach(msg => {
    const words = msg.content.toLowerCase()
      .replace(/[.,!?]/g, '')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !excludedWords.includes(word) &&
        !word.startsWith('http') &&
        !word.includes('media') &&
        !word.includes('omitted')
      );
      
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });

  return Object.entries(wordCount)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 100); // Limit to top 100 words for the cloud
}

function analyzeImages(messages: Message[]): ImageAnalytics {
  const imageMessages = messages.filter(msg => 
    msg.content.includes('<Media omitted>') || 
    msg.content.toLowerCase().includes('image')
  );

  const timeDistribution: Record<string, number> = {};
  const senderDistribution: Record<string, number> = {};
  const batchSizes: number[] = [];
  const consecutiveShares: { sender: string; timestamp: Date; count: number; }[] = [];

  // Analyze consecutive image shares
  let currentBatch = {
    sender: '',
    count: 0,
    startTime: new Date()
  };

  imageMessages.forEach((msg, index) => {
    // Time distribution
    const hour = msg.timestamp.getHours();
    timeDistribution[hour] = (timeDistribution[hour] || 0) + 1;

    // Sender distribution
    senderDistribution[msg.sender] = (senderDistribution[msg.sender] || 0) + 1;

    // Batch analysis
    if (currentBatch.count === 0) {
      currentBatch.sender = msg.sender;
      currentBatch.startTime = msg.timestamp;
      currentBatch.count = 1;
    } else if (
      msg.sender === currentBatch.sender &&
      msg.timestamp.getTime() - currentBatch.startTime.getTime() < 300000 // 5 minutes
    ) {
      currentBatch.count++;
    } else {
      if (currentBatch.count > 1) {
        batchSizes.push(currentBatch.count);
        consecutiveShares.push({
          sender: currentBatch.sender,
          timestamp: currentBatch.startTime,
          count: currentBatch.count
        });
      }
      currentBatch = {
        sender: msg.sender,
        count: 1,
        startTime: msg.timestamp
      };
    }

    // Handle last batch
    if (index === imageMessages.length - 1 && currentBatch.count > 1) {
      batchSizes.push(currentBatch.count);
      consecutiveShares.push({
        sender: currentBatch.sender,
        timestamp: currentBatch.startTime,
        count: currentBatch.count
      });
    }
  });

  // Find peak sharing time
  const peakHour = Object.entries(timeDistribution)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '0';

  // Find most active sharer
  const mostActiveSharer = Object.entries(senderDistribution)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

  // Find largest batch
  const largestBatch = consecutiveShares
    .sort((a, b) => b.count - a.count)[0] || {
      sender: '',
      timestamp: new Date(),
      count: 0
    };

  return {
    totalImages: imageMessages.length,
    imagePatterns: {
      timeDistribution,
      senderDistribution,
      batchSizes,
      consecutiveShares: consecutiveShares.sort((a, b) => b.count - a.count).slice(0, 5)
    },
    insights: {
      mostActiveImageSharer: mostActiveSharer,
      peakImageSharingTime: `${peakHour}:00`,
      averageBatchSize: batchSizes.length > 0 
        ? batchSizes.reduce((a, b) => a + b, 0) / batchSizes.length 
        : 0,
      largestImageBatch: largestBatch
    }
  };
}

function analyzeChat(messages: Message[]): ChatStats {
  const stats: ChatStats = {
    totalMessages: messages.length,
    messagesPerPerson: {},
    averageMessageLength: 0,
    mostActiveHours: {},
    commonWords: [],
    emotionalMetrics: {},
    communicationStyles: {},
    relationshipDynamics: {
      conversationBalance: 0,
      responseRate: 0,
      sharedInterests: [],
      conversationPatterns: {
        peakTimes: {},
        topicTransitions: 0,
        conversationLength: 0
      },
      examples: {
        engagingDiscussions: [],
        sharedInterestMoments: []
      }
    },
    messageDistribution: {
      hourly: {},
      daily: {},
      monthly: {}
    },
    interactionPatterns: {
      responseTime: {
        average: 0,
        distribution: {}
      },
      conversationStarters: {},
      topicChanges: {
        frequency: 0,
        examples: []
      }
    },
    predictions: {
      nextMessages: {},
      general: []
    },
    specialLingo: [],
    imageAnalytics: analyzeImages(messages)
  };

  let totalLength = 0;
  const participants = [...new Set(messages.map(m => m.sender))];

  messages.forEach(msg => {
    // Basic stats
    stats.messagesPerPerson[msg.sender] = (stats.messagesPerPerson[msg.sender] || 0) + 1;
    totalLength += msg.content.length;
    
    const hour = msg.timestamp.getHours();
    stats.mostActiveHours[hour] = (stats.mostActiveHours[hour] || 0) + 1;
    
    // Message distribution
    stats.messageDistribution.hourly[hour] = (stats.messageDistribution.hourly[hour] || 0) + 1;
    const dayKey = msg.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
    stats.messageDistribution.daily[dayKey] = (stats.messageDistribution.daily[dayKey] || 0) + 1;
    const monthKey = msg.timestamp.toLocaleDateString('en-US', { month: 'long' });
    stats.messageDistribution.monthly[monthKey] = (stats.messageDistribution.monthly[monthKey] || 0) + 1;
  });

  // Calculate emotional metrics and communication styles for each participant
  participants.forEach(participant => {
    stats.emotionalMetrics[participant] = calculateEmotionalMetrics(messages, participant);
    stats.communicationStyles[participant] = calculateCommunicationStyle(messages, participant);
  });

  // Calculate relationship dynamics
  const totalMessagesCount = Object.values(stats.messagesPerPerson).reduce((a, b) => a + b, 0);
  stats.relationshipDynamics.conversationBalance = 1 - Math.abs(
    Object.values(stats.messagesPerPerson).reduce((a, b) => Math.abs(a - b), 0) / totalMessagesCount
  );

  stats.averageMessageLength = totalLength / messages.length;
  stats.commonWords = calculateWordCloud(messages);
  stats.specialLingo = analyzeSpecialLingo(messages);

  return stats;
}

export { parseWhatsAppExport, analyzeChat };