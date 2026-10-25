import React from 'react';
import { Clock, ArrowRight, Construction } from 'lucide-react';

const PlaceholderPage = ({
  title,
  icon: Icon = Construction,
  phase,
  description,
  plannedFeatures = [],
  onNavigate
}) => {
  return (
    <div className="placeholder-page-card">
      <div className="placeholder-header">
        <div className="placeholder-icon-wrap">
          <Icon size={32} />
        </div>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="phase-badge">
          <Clock size={14} />
          <span>{phase}</span>
        </div>
      </div>

      <div className="placeholder-notice">
        <div className="notice-icon">
          <Construction size={20} color="#f59e0b" />
        </div>
        <div className="notice-text">
          <strong>Module under staged implementation</strong>
          <p>
            This module is structured in the navigation as part of Phase 1 layout scaffolding.
            Its backend models, transactional logic, and interactive components will be activated in {phase}.
          </p>
        </div>
      </div>

      {plannedFeatures.length > 0 && (
        <div className="planned-features-card">
          <h4>Planned Functionality for {title}:</h4>
          <ul className="planned-features-list">
            {plannedFeatures.map((feat, idx) => (
              <li key={idx}>
                <span className="feature-bullet">•</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="placeholder-actions">
        <button className="btn-secondary" onClick={() => onNavigate('dashboard')}>
          Back to Dashboard
        </button>
        <button className="btn-primary" onClick={() => onNavigate('products')}>
          <span>View All Products</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PlaceholderPage;
