import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Sparkles, AlertTriangle, MessageSquareWarning, Zap, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/context/NotificationContext';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export const FloatingOrb = () => {
  const { addNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: 'Hi! I am Prabandh AI Support. Please select an option below if you need to report an issue or need help.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleOptionClick = (optionText: string, aiResponse: string, successEvent?: boolean) => {
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: optionText };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: aiResponse }]);
      setIsTyping(false);
      
      if (successEvent) {
         addNotification('success', 'Ticket Created', 'Your report has been received by our Admin team.');
      }
    }, 1500);
  };

  const OPTIONS = [
    {
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
      text: "Report Wrongly Parked Vehicle",
      response: "Thank you for reporting. A security officer has been notified to check the zone.",
      ticket: true
    },
    {
      icon: <Zap className="w-4 h-4 text-emerald-500" />,
      text: "EV Charger is Broken",
      response: "We apologize for the inconvenience. We have marked the charger as Offline in the Digital Twin and dispatched maintenance.",
      ticket: true
    },
    {
      icon: <CreditCard className="w-4 h-4 text-indigo-400" />,
      text: "FASTag Payment Issue",
      response: "If the boom barrier doesn't open, your ticket will be reviewed manually within 2 mins.",
      ticket: true
    },
    {
      icon: <MessageSquareWarning className="w-4 h-4 text-cyan-400" />,
      text: "Other Enquiry",
      response: "Please call the Helpdesk at 1-800-PARK for immediate assistance. Safe driving!"
    }
  ];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 pointer-events-none">
        
        {isOpen && (
          <div className="w-[350px] max-h-[85vh] flex flex-col glass-card-elevated border border-primary/20 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up pointer-events-auto origin-bottom-right bg-slate-900/95 backdrop-blur-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent flex justify-between items-center relative overflow-hidden shrink-0">
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-primary/50 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    <MessageSquareWarning className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse"></span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm tracking-wide text-white">AI Assistant</h3>
                  <div className="text-[10px] text-primary flex items-center gap-1">
                     <Sparkles className="w-3 h-3"/> Support Active
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full relative z-10 w-8 h-8 text-white/70 hover:text-white hover:bg-white/10">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-transparent max-h-[300px]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-[13px] leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-[0_4px_15px_rgba(34,211,238,0.2)]' 
                      : 'bg-slate-800/80 border border-white/10 text-slate-100 rounded-tl-sm backdrop-blur-md'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start animate-fade-in-up">
                  <div className="bg-slate-800/80 border border-white/10 rounded-2xl rounded-tl-sm p-3 backdrop-blur-md flex items-center gap-1 shadow-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Options Area (Replaces Text Input) */}
            <div className="p-4 bg-slate-900/80 border-t border-white/10 shrink-0">
               <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-semibold text-center">
                 Select an option
               </div>
               <div className="flex flex-col gap-2">
                 {OPTIONS.map((opt, i) => (
                   <button
                     key={i}
                     disabled={isTyping}
                     onClick={() => handleOptionClick(opt.text, opt.response, opt.ticket)}
                     className="w-full text-left px-3 py-2.5 rounded-xl border border-white/5 bg-slate-800/50 hover:bg-slate-800 hover:border-white/10 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                   >
                     <div className="bg-slate-900 rounded p-1.5 group-hover:scale-110 transition-transform">
                       {opt.icon}
                     </div>
                     <span className="text-xs text-slate-200 font-medium">{opt.text}</span>
                   </button>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* Floating Orb Button */}
        {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            className="group relative w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all duration-300 hover:scale-105 pointer-events-auto"
          >
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping opacity-60"></div>
            
            <MessageSquareWarning className="w-6 h-6 text-cyan-400 drop-shadow-md z-10" />
            
            {/* Mini notification badge */}
            <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white z-20">
              1
            </div>
          </button>
        )}

      </div>
    </>
  );
};
