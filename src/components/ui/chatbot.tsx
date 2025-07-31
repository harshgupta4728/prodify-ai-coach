import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Brain,
  Code,
  Target,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatbotProps {
  userData?: {
    name: string;
    leetcodeProfile?: string;
    geeksforgeeksProfile?: string;
  };
}

const SUGGESTED_QUESTIONS = [
  "What are the most important questions I should solve this week?",
  "How should I prepare for technical interviews?",
  "What DSA topics should I focus on next?",
  "Can you create a study plan for me?",
  "What are my weak areas based on my progress?",
  "How can I improve my problem-solving speed?"
];

export const Chatbot = ({ userData }: ChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi ${userData?.name || 'there'}! I'm your Prodify AI Mentor. I'm here to help you with your DSA preparation journey. What would you like to know today?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate API call to Gemini 2.5 Pro
    // In a real implementation, you would call the Gemini API here
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responses = {
      "What are the most important questions I should solve this week?": `Based on your profile, here are my top recommendations for this week:

🎯 **Priority 1: Arrays & Two Pointers**
- LeetCode #15: 3Sum (Medium)
- LeetCode #11: Container With Most Water (Medium)
- LeetCode #42: Trapping Rain Water (Hard)

🎯 **Priority 2: Dynamic Programming**
- LeetCode #70: Climbing Stairs (Easy)
- LeetCode #198: House Robber (Medium)
- LeetCode #322: Coin Change (Medium)

🎯 **Priority 3: Trees & Graphs**
- LeetCode #94: Binary Tree Inorder Traversal (Medium)
- LeetCode #102: Binary Tree Level Order Traversal (Medium)

Focus on these patterns as they're commonly asked in interviews. Would you like me to create a detailed study plan for any of these topics?`,

      "How should I prepare for technical interviews?": `Here's your personalized interview preparation strategy:

📚 **Week 1-2: Core Concepts**
- Master time/space complexity analysis
- Practice implementing basic data structures
- Focus on array, string, and linked list problems

📚 **Week 3-4: Advanced Patterns**
- Two pointers and sliding window
- Binary search variations
- Tree and graph traversals

📚 **Week 5-6: Dynamic Programming**
- Start with 1D DP problems
- Practice memoization and tabulation
- Focus on common patterns (knapsack, LIS, etc.)

📚 **Week 7-8: Mock Interviews**
- Practice with time constraints
- Work on communication skills
- Review system design basics

💡 **Pro Tips:**
- Solve at least 2-3 problems daily
- Focus on quality over quantity
- Practice explaining your solutions out loud
- Use platforms like LeetCode and GeeksForGeeks for practice

Would you like me to create a detailed schedule for any of these phases?`,

      "What DSA topics should I focus on next?": `Based on your current progress, here are the topics you should prioritize:

🔥 **High Priority (Interview Focus)**
1. **Dynamic Programming** - Most commonly asked
   - Memoization vs Tabulation
   - Classic problems: Fibonacci, Climbing Stairs, Coin Change
   
2. **Graph Algorithms**
   - DFS/BFS implementations
   - Shortest path algorithms
   - Topological sorting

3. **Advanced Tree Concepts**
   - Binary Search Trees
   - AVL Trees and Red-Black Trees
   - Tree traversal variations

🔥 **Medium Priority**
4. **String Algorithms**
   - Pattern matching (KMP, Boyer-Moore)
   - String manipulation problems
   
5. **Advanced Array Techniques**
   - Kadane's algorithm
   - Sliding window optimizations
   - Two pointers advanced patterns

🔥 **Specialized Topics**
6. **System Design Basics**
   - Scalability concepts
   - Database design principles
   - Caching strategies

Would you like me to create a detailed study plan for any of these topics?`,

      "Can you create a study plan for me?": `Here's your personalized 8-week DSA study plan:

📅 **Week 1: Foundation**
- **Days 1-3:** Arrays, Strings, Basic Sorting
- **Days 4-5:** Linked Lists, Stacks, Queues
- **Days 6-7:** Practice problems and review

📅 **Week 2: Two Pointers & Sliding Window**
- **Days 1-3:** Two pointers technique
- **Days 4-5:** Sliding window problems
- **Days 6-7:** Mixed practice problems

📅 **Week 3: Trees & Graphs**
- **Days 1-3:** Binary trees, traversals
- **Days 4-5:** Graph algorithms (DFS/BFS)
- **Days 6-7:** Tree and graph problems

📅 **Week 4: Dynamic Programming**
- **Days 1-3:** 1D DP problems
- **Days 4-5:** 2D DP problems
- **Days 6-7:** Advanced DP patterns

📅 **Week 5: Advanced Algorithms**
- **Days 1-3:** Binary search variations
- **Days 4-5:** Heap and priority queues
- **Days 6-7:** Advanced sorting algorithms

📅 **Week 6: System Design Basics**
- **Days 1-3:** Scalability concepts
- **Days 4-5:** Database design
- **Days 6-7:** Caching and optimization

📅 **Week 7-8: Interview Preparation**
- **Mock interviews and practice**
- **Time-constrained problem solving**
- **Communication skills practice**

🎯 **Daily Goals:**
- Solve 2-3 problems daily
- Review previous solutions
- Practice explaining solutions
- Track progress on platforms

Would you like me to break down any specific week in detail?`,

      "What are my weak areas based on my progress?": `Based on your coding profile analysis, here are your areas for improvement:

⚠️ **Areas Needing Attention:**

1. **Dynamic Programming (Priority: HIGH)**
   - You've solved only 15% of DP problems
   - Focus on: Memoization, Tabulation, State transitions
   - Recommended: Start with easy DP problems and gradually increase difficulty

2. **Graph Algorithms (Priority: HIGH)**
   - Limited exposure to graph problems
   - Focus on: DFS/BFS implementations, Shortest path algorithms
   - Practice: Start with basic graph traversals

3. **Advanced Tree Concepts (Priority: MEDIUM)**
   - Need more practice with complex tree problems
   - Focus on: Binary Search Trees, Tree balancing
   - Recommended: Practice tree construction and manipulation

4. **System Design (Priority: MEDIUM)**
   - Limited exposure to system design concepts
   - Focus on: Scalability, Database design, Caching
   - Start with basic system design principles

✅ **Your Strengths:**
- Arrays and Strings (85% success rate)
- Basic Sorting Algorithms (90% success rate)
- Two Pointers technique (80% success rate)

🎯 **Action Plan:**
1. Dedicate 60% of your time to DP problems
2. Spend 25% on graph algorithms
3. Use remaining 15% for advanced tree concepts
4. Start system design basics in parallel

Would you like me to create a focused study plan for any of these weak areas?`,

      "How can I improve my problem-solving speed?": `Here's your personalized strategy to improve problem-solving speed:

⚡ **Immediate Techniques (Week 1-2):**

1. **Pattern Recognition**
   - Learn to identify problem patterns quickly
   - Practice categorizing problems by type
   - Use mnemonic devices for common patterns

2. **Time Management**
   - Set strict time limits: 5 min for easy, 15 min for medium, 25 min for hard
   - Practice with a timer
   - Learn when to move on from a problem

3. **Code Templates**
   - Create templates for common algorithms
   - Practice writing boilerplate code quickly
   - Memorize standard implementations

⚡ **Advanced Techniques (Week 3-4):**

4. **Mental Models**
   - Visualize problems before coding
   - Use pen and paper for complex problems
   - Practice mental simulation of algorithms

5. **Optimization Strategies**
   - Learn to identify bottlenecks quickly
   - Practice space-time trade-offs
   - Master common optimization techniques

⚡ **Speed Drills (Week 5-6):**

6. **Daily Speed Challenges**
   - Solve 3 easy problems in 30 minutes
   - Practice with time pressure
   - Focus on accuracy over speed initially

7. **Mock Interview Practice**
   - Simulate real interview conditions
   - Practice explaining while coding
   - Get feedback on communication

🎯 **Daily Routine:**
- **Morning:** 2-3 speed drills (easy problems)
- **Afternoon:** 1-2 medium problems with full analysis
- **Evening:** Review and optimize previous solutions

💡 **Pro Tips:**
- Use keyboard shortcuts effectively
- Practice typing code without thinking
- Learn to debug quickly
- Master your IDE's features

Would you like me to create a specific speed training schedule?`
    };

    const defaultResponse = `I understand you're asking about "${userMessage}". Let me provide you with personalized guidance based on your DSA preparation journey.

For the best experience, I recommend:
1. **Connecting your LeetCode/GeeksForGeeks profiles** to get personalized recommendations
2. **Setting specific goals** for your preparation
3. **Tracking your progress** regularly

Would you like me to help you with any specific aspect of your DSA preparation?`;

    return responses[userMessage as keyof typeof responses] || defaultResponse;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputValue);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg rounded-full h-14 w-14 p-0"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={cn(
        "w-96 h-[600px] shadow-2xl border-0 bg-white",
        isMinimized && "h-16"
      )}>
        <CardHeader className={cn(
          "bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-lg",
          isMinimized && "rounded-lg"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">Prodify AI Mentor</CardTitle>
                <p className="text-xs text-white/80">Your DSA Study Companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 h-[calc(600px-80px)] flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-orange-600" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg p-3",
                        message.sender === 'user'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      )}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className={cn(
                        "text-xs mt-1",
                        message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                      )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-200">
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_QUESTIONS.slice(0, 3).map((question, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-orange-50 hover:border-orange-200"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question.length > 30 ? question.substring(0, 30) + '...' : question}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about DSA..."
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}; 