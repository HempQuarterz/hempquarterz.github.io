/**
 * VerseNode Component
 * Custom node component for React Flow representing a Bible verse in the network graph
 */

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const VerseNode = ({ data, selected }) => {
  const { book, chapter, verse, isRoot, depth } = data;

  // Node styling based on state
  const nodeClass = `verse-node ${isRoot ? 'root-node' : ''} ${selected ? 'selected' : ''} depth-${depth}`;

  return (
    <div className={nodeClass}>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555', width: 8, height: 8 }}
        isConnectable={false}
      />

      {/* Node content */}
      <div className="verse-node-content">
        {isRoot && (
          <div className="root-indicator">
            <span>📍</span>
          </div>
        )}
        <div className="verse-reference">
          <strong>{book}</strong>
        </div>
        <div className="verse-location">
          {chapter}:{verse}
        </div>
        {isRoot && (
          <div className="root-label">Current</div>
        )}
      </div>

      {/* Source handle for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555', width: 8, height: 8 }}
        isConnectable={false}
      />
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(VerseNode);
