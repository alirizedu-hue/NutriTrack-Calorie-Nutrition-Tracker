import React, { useState, useEffect, useRef } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { ChatMessage } from '../types/nutrition';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Trash2,
  RefreshCw,
  Flame,
  Target,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const CHAT_STORAGE_KEY = 'nutritrack_chat_v1';

export const AINutritionAssistantView: React.FC = () => {
  const { userProfile, currentDailyLog, dailyLogs, selectedDate, setActiveTab } = useNutrition();

  // Calculate today's real numbers for context
  const todayCalories = currentDailyLog.entries.reduce((sum, e) => sum + e.calories, 0);
  const todayProtein = Math.round(currentDailyLog.entries.reduce((sum, e) => sum + e.protein, 0) * 10) / 10;
  const todayCarbs = Math.round(currentDailyLog.entries.reduce((sum, e) => sum + e.carbs, 0) * 10) / 10;
  const todayFat = Math.round(currentDailyLog.entries.reduce((sum, e) => sum + e.fat, 0) * 10) / 10;
  const todayFiber = Math.round(currentDailyLog.entries.reduce((sum, e) => sum + e.fiber, 0) * 10) / 10;

  const remainingCalories = Math.max(0, userProfile.dailyCalorieTarget - todayCalories);
  const remainingProtein = Math.max(0, userProfile.dailyProteinTarget - todayProtein);

  // Past 7 days average calculation
  const past7DaysLogs = dailyLogs.slice(-7);
  const total7DayCalories = past7DaysLogs.reduce(
    (sum, log) => sum + log.entries.reduce((s, e) => s + e.calories, 0),
    0
  );
  const avgCalories7Days = past7DaysLogs.length > 0 ? Math.round(total7DayCalories / past7DaysLogs.length) : todayCalories;

  const initialWelcomeMessage: ChatMessage = {
    id: 'welcome-msg',
    role: 'assistant',
    content: `Hello ${userProfile.name}! I am your **NutriTrack 2.0 AI Nutrition Assistant**.\n\nI have live visibility into your diary for **${selectedDate}**:\n- **Calories Consumed:** ${todayCalories} / ${userProfile.dailyCalorieTarget} kcal (${remainingCalories} kcal remaining)\n- **Protein:** ${todayProtein} / ${userProfile.dailyProteinTarget}g (${remainingProtein}g remaining)\n- **Dietary Focus:** ${userProfile.dietaryPreference} (${userProfile.dietaryRestrictions?.length ? userProfile.dietaryRestrictions.join(', ') : 'No allergies'})\n\nHow can I help you optimize your nutrition or plan your next meal?`,
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    suggestedFollowUps: [
      'Evaluate my nutrition balance today',
      'What should I eat next based on my remaining macros?',
      'How can I hit my protein goal today?',
    ],
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [initialWelcomeMessage];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    const now = new Date();
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/nutrition-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userContext: {
            userProfile,
            todaySummary: {
              date: selectedDate,
              calories: todayCalories,
              protein: todayProtein,
              carbs: todayCarbs,
              fat: todayFat,
              fiber: todayFiber,
              waterGlasses: currentDailyLog.waterGlasses,
            },
            todayMeals: currentDailyLog.entries.map((e) => ({
              foodName: e.foodName,
              mealType: e.mealType,
              servings: e.servings,
              calories: e.calories,
              protein: e.protein,
              carbs: e.carbs,
              fat: e.fat,
              fiber: e.fiber,
            })),
            weeklySummary: {
              avgCalories: avgCalories7Days,
              loggedDaysCount: past7DaysLogs.length,
            },
          },
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to receive assistant reply.');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: json.data.reply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: json.data.suggestedFollowUps || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Could not connect to the AI Nutrition Assistant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear your conversation history with the AI Nutrition Assistant?')) {
      setMessages([initialWelcomeMessage]);
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to render formatted markdown-like text
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bold rendering
      let processed = line;
      const parts = processed.split(/(\*\*.*?\*\*)/g);

      return (
        <p key={idx} className={`${line === '' ? 'h-2' : ''} leading-relaxed`}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-slate-900 dark:text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('- ')) {
              return (
                <span key={pIdx} className="flex items-start gap-2 my-0.5">
                  <span className="text-emerald-500 font-bold shrink-0">•</span>
                  <span>{part.slice(2)}</span>
                </span>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                AI Nutrition Assistant
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                Grounded in Your Meals
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized meal recommendations, macro checks, and clinical nutrition advice.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Live Context Badge Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Calories Today</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {todayCalories} <span className="text-xs font-normal text-slate-400">/ {userProfile.dailyCalorieTarget}</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            {remainingCalories > 0 ? `${remainingCalories} kcal left` : 'Target reached'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Target className="w-3.5 h-3.5 text-blue-500" />
            <span>Protein</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {todayProtein}g <span className="text-xs font-normal text-slate-400">/ {userProfile.dailyProteinTarget}g</span>
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
            {remainingProtein > 0 ? `${remainingProtein}g left` : 'Goal fulfilled'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Meals Logged</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {currentDailyLog.entries.length} items
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {currentDailyLog.entries.length > 0 ? 'Fresh data ready' : 'No entries yet today'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Lightbulb className="w-3.5 h-3.5 text-purple-500" />
            <span>Diet Style</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
            {userProfile.dietaryPreference}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {userProfile.dietaryRestrictions?.length ? userProfile.dietaryRestrictions[0] : 'Standard'}
          </div>
        </div>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[560px]">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {isUser ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Bubble */}
                <div className="space-y-2">
                  <div
                    className={`rounded-2xl p-4 text-sm ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="space-y-1.5">{renderMessageContent(message.content)}</div>
                    <div
                      className={`text-[10px] mt-2 text-right ${
                        isUser ? 'text-emerald-200' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {message.timestamp}
                    </div>
                  </div>

                  {/* Suggested Follow-ups */}
                  {!isUser && message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-emerald-500" />
                        <span>Suggested follow-up questions:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {message.suggestedFollowUps.map((question, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => handleSendMessage(question)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition-colors text-left font-medium"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                <span>NutriTrack AI is analyzing your food logs...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your calories, meals, or nutrition goals..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 text-white font-medium transition-colors shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Quick starter chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 font-medium">
              Quick prompts:
            </span>
            <button
              onClick={() => handleSendMessage('What should I have for dinner with my remaining calories?')}
              className="shrink-0 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 text-[11px]"
            >
              Dinner suggestion
            </button>
            <button
              onClick={() => handleSendMessage('Evaluate my macronutrient distribution today')}
              className="shrink-0 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 text-[11px]"
            >
              Macro balance
            </button>
            <button
              onClick={() => handleSendMessage('Suggest high fiber snacks that fit my dietary preferences')}
              className="shrink-0 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 text-[11px]"
            >
              High fiber snacks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
