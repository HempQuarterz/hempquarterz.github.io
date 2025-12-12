/**
 * RelationshipEdge Component
 * Custom edge component for React Flow showing cross-reference relationships
 */

import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { getCategoryDisplayName } from '../api/crossReferences';

const RelationshipEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const relationType = data?.relationType || 'related';
  const displayName = getCategoryDisplayName(relationType);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
      />

      {/* Optional: Add label for relationship type */}
      {data?.showLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              fontWeight: 600,
              border: '1px solid #ddd',
              pointerEvents: 'none',
              opacity: 0.8,
            }}
          >
            {displayName}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default RelationshipEdge;
