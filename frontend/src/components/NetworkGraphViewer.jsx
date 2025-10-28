/**
 * NetworkGraphViewer Component - Tier 5
 * Interactive network graph visualization for biblical cross-references
 * Uses React Flow for node-based UI with custom verse nodes and relationship edges
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getCrossReferences } from '../api/crossReferences';
import { formatCrossReference, getCategoryColor } from '../api/crossReferences';
import VerseNode from './VerseNode';
import RelationshipEdge from './RelationshipEdge';
import '../styles/networkGraph.css';

const NetworkGraphViewer = ({ book, chapter, verse, onNavigate, maxDepth = 2 }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Custom node types
  const nodeTypes = useMemo(() => ({
    verse: VerseNode,
  }), []);

  // Custom edge types
  const edgeTypes = useMemo(() => ({
    relationship: RelationshipEdge,
  }), []);

  // Load cross-reference network
  useEffect(() => {
    async function loadNetwork() {
      if (!book || !chapter || !verse) return;

      try {
        setLoading(true);
        setError(null);

        // Build network graph with BFS traversal
        const network = await buildReferenceNetwork(book, chapter, verse, maxDepth);

        // Apply force-directed layout
        const layoutedNodes = applyForceLayout(network.nodes);
        const formattedEdges = formatEdges(network.edges);

        setNodes(layoutedNodes);
        setEdges(formattedEdges);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load network:', err);
        setError(err.message || 'Failed to load reference network');
        setLoading(false);
      }
    }

    loadNetwork();
  }, [book, chapter, verse, maxDepth]);

  /**
   * Build reference network using BFS traversal
   * @param {string} startBook - Starting book code
   * @param {number} startChapter - Starting chapter
   * @param {number} startVerse - Starting verse
   * @param {number} depth - Maximum depth to traverse
   * @returns {Object} Network with nodes and edges
   */
  async function buildReferenceNetwork(startBook, startChapter, startVerse, depth) {
    const nodes = new Map();
    const edges = [];
    const visited = new Set();
    const queue = [];

    // Add starting node
    const startId = `${startBook}_${startChapter}_${startVerse}`;
    nodes.set(startId, {
      id: startId,
      book: startBook,
      chapter: startChapter,
      verse: startVerse,
      depth: 0,
      isRoot: true,
    });
    queue.push({ book: startBook, chapter: startChapter, verse: startVerse, depth: 0 });
    visited.add(startId);

    // BFS traversal
    while (queue.length > 0 && queue[0].depth < depth) {
      const current = queue.shift();
      const currentId = `${current.book}_${current.chapter}_${current.verse}`;

      try {
        // Get cross-references for current verse
        const refs = await getCrossReferences(current.book, current.chapter, current.verse);

        // Process each reference
        for (const ref of refs) {
          const targetId = `${ref.target_book}_${ref.target_chapter}_${ref.target_verse}`;

          // Add target node if not visited
          if (!visited.has(targetId) && current.depth + 1 <= depth) {
            nodes.set(targetId, {
              id: targetId,
              book: ref.target_book,
              chapter: ref.target_chapter,
              verse: ref.target_verse,
              depth: current.depth + 1,
              isRoot: false,
            });
            queue.push({
              book: ref.target_book,
              chapter: ref.target_chapter,
              verse: ref.target_verse,
              depth: current.depth + 1,
            });
            visited.add(targetId);
          }

          // Add edge
          if (visited.has(targetId)) {
            edges.push({
              id: `${currentId}-${targetId}`,
              source: currentId,
              target: targetId,
              type: ref.link_type || 'related',
              depth: current.depth,
            });
          }
        }
      } catch (err) {
        console.error(`Failed to load references for ${currentId}:`, err);
      }
    }

    return {
      nodes: Array.from(nodes.values()),
      edges: edges,
    };
  }

  /**
   * Apply force-directed layout algorithm
   * Uses a simple radial layout for now (can be enhanced with D3-force later)
   */
  function applyForceLayout(networkNodes) {
    const centerX = 400;
    const centerY = 300;
    const radiusStep = 150;

    return networkNodes.map(node => {
      let x, y;

      if (node.isRoot) {
        // Root node at center
        x = centerX;
        y = centerY;
      } else {
        // Arrange by depth in concentric circles
        const radius = node.depth * radiusStep;
        const angleStep = (2 * Math.PI) / networkNodes.filter(n => n.depth === node.depth).length;
        const index = networkNodes.filter(n => n.depth === node.depth && n.id <= node.id).length - 1;
        const angle = angleStep * index;

        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      }

      return {
        id: node.id,
        type: 'verse',
        position: { x, y },
        data: {
          book: node.book,
          chapter: node.chapter,
          verse: node.verse,
          isRoot: node.isRoot,
          depth: node.depth,
          label: `${node.book} ${node.chapter}:${node.verse}`,
        },
      };
    });
  }

  /**
   * Format edges with colors based on relationship type
   */
  function formatEdges(networkEdges) {
    return networkEdges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'relationship',
      animated: edge.depth === 0, // Animate first-level connections
      style: {
        strokeWidth: 2,
        stroke: getCategoryColor(edge.type),
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: getCategoryColor(edge.type),
      },
      data: {
        relationType: edge.type,
        depth: edge.depth,
      },
    }));
  }

  /**
   * Handle node click - navigate to verse
   */
  const onNodeClick = useCallback((event, node) => {
    console.log('Node clicked:', node.data);
    setSelectedNode(node);

    if (onNavigate) {
      onNavigate({
        book: node.data.book,
        chapter: node.data.chapter,
        verse: node.data.verse,
      });
    }
  }, [onNavigate]);

  /**
   * Handle edge click - show relationship info
   */
  const onEdgeClick = useCallback((event, edge) => {
    console.log('Edge clicked:', edge.data);
  }, []);

  if (loading) {
    return (
      <div className="network-graph-container">
        <div className="network-loading">
          Loading reference network...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="network-graph-container">
        <div className="network-error">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="network-graph-container">
        <div className="network-empty">
          No cross-references found for {book} {chapter}:{verse}
        </div>
      </div>
    );
  }

  return (
    <div className="network-graph-container">
      {/* Header */}
      <div className="network-header">
        <h3>📊 Reference Network Graph</h3>
        <p>
          {nodes.length} verses • {edges.length} connections
          {selectedNode && ` • Selected: ${selectedNode.data.label}`}
        </p>
      </div>

      {/* React Flow Canvas */}
      <div className="network-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.1}
          maxZoom={2}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node) => (node.data.isRoot ? '#2E7D32' : '#1976D2')}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="network-legend">
        <h4>Relationship Types</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ background: getCategoryColor('quotation') }} />
            <span>Quotation</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: getCategoryColor('allusion') }} />
            <span>Allusion</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: getCategoryColor('parallel') }} />
            <span>Parallel</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: getCategoryColor('thematic') }} />
            <span>Thematic</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: getCategoryColor('other') }} />
            <span>Related</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkGraphViewer;
