import React from 'react';
import { ArrowRight, ShieldAlert, Cpu, HeartPulse, Sparkles } from 'lucide-react';

export default function Homepage({ onStartDemo }) {
  return (
    <div className="homepage-hero">
      <div className="homepage-glow"></div>
      
      <div className="container">
        <div className="badge">
          <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Helpline Operator Console
        </div>
        
        <h1 className="title">
          CallSaarthi <span className="title-accent">AI</span>
        </h1>
        
        <p className="subtitle">
          AI-Assisted Helpline Triage & Emergency Dispatch Routing
        </p>

        <p className="hero-description">
          Empowering emergency operators with real-time multilingual call analysis, 
          instant urgency scoring, and automated emergency service recommendation.
        </p>
        
        <div className="hero-action-group">
          <button 
            type="button" 
            className="btn-primary btn-large" 
            onClick={onStartDemo}
          >
            Start Demo
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="hero-feature-cards">
          <div className="hero-card">
            <div className="hero-card-icon">
              <ShieldAlert size={22} color="#00e5ff" />
            </div>
            <h3>Urgency Scoring</h3>
            <p>Immediate categorization into Critical, High, Medium, or Low priority queues.</p>
          </div>

          <div className="hero-card">
            <div className="hero-card-icon">
              <Cpu size={22} color="#00e5ff" />
            </div>
            <h3>Multilingual Triage</h3>
            <p>Processes Indian regional languages including Hindi, Marathi, Bengali, Tamil & Telugu.</p>
          </div>

          <div className="hero-card">
            <div className="hero-card-icon">
              <HeartPulse size={22} color="#00e5ff" />
            </div>
            <h3>Direct Routing</h3>
            <p>Matches caller distress with 108, 1091, 1098, and Tele-MANAS instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
