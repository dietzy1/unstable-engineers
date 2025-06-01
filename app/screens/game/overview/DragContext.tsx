import React, { createContext, useState, useContext } from 'react';

type DragContextType = {
  draggingCardId: string | null;
  setDraggingCardId: (id: string | null) => void;
  dragPosition: { x: number; y: number } | null;
  setDragPosition: (pos: { x: number; y: number } | null) => void;
  centerLayout: { x: number; y: number; width: number; height: number } | null;
  setCenterLayout: (layout: { x: number; y: number; width: number; height: number } | null) => void;
};

const DragContext = createContext<DragContextType | undefined>(undefined);

export const DragProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [centerLayout, setCenterLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  return (
    <DragContext.Provider
      value={{
        draggingCardId,
        setDraggingCardId,
        dragPosition,
        setDragPosition,
        centerLayout,
        setCenterLayout,
      }}>
      {children}
    </DragContext.Provider>
  );
};

export const useDrag = () => {
  const ctx = useContext(DragContext);
  if (!ctx) throw new Error('useDrag must be used within DragProvider');
  return ctx;
};
