import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../api/axios';

const ChatbotPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [labTopic, setLabTopic] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! I\'m your AI viva preparation assistant. Select your subject and ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Explain this lab concept",
    "Give important viva questions",
    "Explain in simple words",
    "Give examples",
    "What are the key points?"
  ];

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const response = await axiosClient.get('/viva/schedules');
        // Extract unique subjects from schedules
        const uniqueSubjects = [...new Map(response.data.map(item => [item['subjectName'], item])).values()];
        setSubjects(uniqueSubjects);
        if (uniqueSubjects.length > 0) {
          setSelectedSubject(uniqueSubjects[0].subjectName);
          setLabTopic(uniqueSubjects[0].labTopic || '');
        }
      } catch (err) {
        console.error('Failed to fetch context', err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchContext();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !selectedSubject) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axiosClient.post('/ai/chat', {
        message: userMessage,
        context: {
          subjectName: selectedSubject,
          labTopic: labTopic
        }
      });
      
      setMessages(prev => [...prev, { role: 'ai', content: response.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Sorry, I encountered an error. Please try again.',
        isError: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
      
      {/* Left Sidebar (30%) */}
      <div className="w-full lg:w-1/3 flex flex-col space-y-4">
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Context Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  const subj = subjects.find(s => s.subjectName === e.target.value);
                  if (subj) setLabTopic(subj.labTopic || '');
                }}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="">Select a subject...</option>
                {subjects.map(s => (
                  <option key={s._id || s.subjectName} value={s.subjectName}>{s.subjectName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lab Topic (Optional)</label>
              <input
                type="text"
                value={labTopic}
                onChange={(e) => setLabTopic(e.target.value)}
                placeholder="e.g. Binary Search Tree"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="card flex-1 overflow-y-auto">
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Suggested Questions</h3>
          <div className="flex flex-col space-y-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="text-left text-sm p-3 rounded-lg bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 transition-colors text-gray-700 hover:text-orange-700"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Chat Area (70%) */}
      <div className="w-full lg:w-2/3 flex flex-col card p-0 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d6a9f] text-white px-6 py-4 flex items-center shadow-md z-10">
          <div className="text-3xl mr-4 bg-white/20 p-2 rounded-full backdrop-blur-sm">🤖</div>
          <div>
            <h2 className="font-bold text-lg">AI Preparation Assistant</h2>
            <p className="text-blue-100 text-sm">Ask me anything about {selectedSubject || 'your subjects'}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex items-end space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                
                {/* Bubble */}
                <div className={`p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-sm' 
                    : msg.isError 
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-end space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">🤖</div>
                <div className="bg-white p-4 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedSubject ? "Type your question here... (Press Enter to send)" : "Please select a subject first..."}
              disabled={!selectedSubject || loading}
              className="w-full border border-gray-300 rounded-xl pl-4 pr-14 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none overflow-hidden"
              rows={1}
              style={{ minHeight: '50px', maxHeight: '150px' }}
            />
            <div className="absolute right-2 top-2 flex flex-col items-center">
              <button
                type="submit"
                disabled={!input.trim() || !selectedSubject || loading}
                className={`p-2 rounded-lg transition-colors ${
                  !input.trim() || !selectedSubject || loading
                    ? 'text-gray-400 bg-gray-100'
                    : 'text-white bg-orange-500 hover:bg-orange-600 shadow-md'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>
          <div className="text-right text-xs text-gray-400 mt-2 pr-2">
            {input.length} chars
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatbotPage;
