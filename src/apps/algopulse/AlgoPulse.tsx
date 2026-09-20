import React, { useState } from 'react';
import { SortingVisualizer } from './components/SortingVisualizer';
import { PathfindingVisualizer } from './components/PathfindingVisualizer';
import { GameOfLifeVisualizer } from './components/GameOfLifeVisualizer';
import { sound } from '../../core/audio/soundEngine';
import { BarChart3, Compass, Grid } from 'lucide-react';

export type AlgoPulseTab = 'sorting' | 'pathfinding' | 'life';

export const AlgoPulse: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AlgoPulseTab>('sorting');

  const handleTabChange = (tab: AlgoPulseTab) => {
    sound.playClick();
    setActiveTab(tab);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'rgba(8, 8, 16, 0.7)' }}>
      {/* App Sub-Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 14px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <button
          onClick={() => handleTabChange('sorting')}
          className={`btn-cyber ${activeTab === 'sorting' ? 'btn-cyber-primary' : ''}`}
        >
          <BarChart3 size={14} />
          <span>Sorting Engine</span>
        </button>

        <button
          onClick={() => handleTabChange('pathfinding')}
          className={`btn-cyber ${activeTab === 'pathfinding' ? 'btn-cyber-primary' : ''}`}
        >
          <Compass size={14} />
          <span>Pathfinding (A* & Dijkstra)</span>
        </button>

        <button
          onClick={() => handleTabChange('life')}
          className={`btn-cyber ${activeTab === 'life' ? 'btn-cyber-primary' : ''}`}
        >
          <Grid size={14} />
          <span>Conway's Game of Life</span>
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'sorting' && <SortingVisualizer />}
        {activeTab === 'pathfinding' && <PathfindingVisualizer />}
        {activeTab === 'life' && <GameOfLifeVisualizer />}
      </div>
    </div>
  );
};
