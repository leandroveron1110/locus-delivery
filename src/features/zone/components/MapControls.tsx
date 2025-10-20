"use client";

import { useEffect, useCallback } from "react";
import { useMap } from "react-leaflet";
import * as L from "leaflet";
import { IZone, DrawnFeature } from "../types/zone";

// Usa el tipo PMEvent que declaraste
type PMEvent = L.PMEvent;

interface MapControlsProps {
  setDrawnFeature: (feature: DrawnFeature | null) => void;
  setEditingZone: (zone: IZone | null) => void;
  editingZone: IZone | null;
}

export const MapControls = ({
  setDrawnFeature,
  setEditingZone,
  editingZone,
}: MapControlsProps) => {
  const map = useMap();

  const onCreate = useCallback((e: PMEvent) => {
    map.pm.disableDraw();
    setDrawnFeature(e.layer.toGeoJSON() as DrawnFeature);
    e.layer.remove(); 
  }, [map, setDrawnFeature]);

  const onUpdate = useCallback((e: PMEvent) => {
    setDrawnFeature(e.layer.toGeoJSON() as DrawnFeature);
  }, [setDrawnFeature]);

  const onRemove = useCallback(() => {
    setDrawnFeature(null);
    setEditingZone(null);
  }, [setDrawnFeature, setEditingZone]);

  useEffect(() => {
    // Inicialización y limpieza
    map.pm.disableGlobalEditMode();
    map.pm.disableGlobalDragMode();
    map.pm.disableGlobalCutMode();

    // =================================================================
    // 🛠️ AJUSTE DE CONTROLES: Solo Polígono y Rectángulo, y el botón de Borrar Capas
    // Desactivamos 'editMode' y 'cutPolygon' ya que los implementarás después.
    map.pm.addControls({
      position: "topleft",
      
      // Controles de Dibujo Requeridos
      drawPolygon: true, // ✅ Dibujar Polígono
      drawRectangle: true, // ✅ Dibujar Rectángulo
      
      // Controles de Edición y Borrado (Desactivados temporalmente)
      editMode: true, // ❌ Desactivado por ahora
      cutPolygon: false, // ❌ Desactivado por ahora
      
      // Borrar todas las capas dibujadas
      removalMode: false, // Permitir borrar manualmente la figura si el usuario lo desea.
      
      // Controles de Dibujo No Requeridos (Aseguramos que estén en false)
      drawMarker: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawText: false,
      
      // Otros Modos (Aseguramos que estén en false)
      dragMode: false, 
      rotateMode: false,
    });
    // =================================================================

    // Suscripción a eventos.
    map.on("pm:create", onCreate as L.LeafletEventHandlerFn);
    map.on("pm:edit", onUpdate as L.LeafletEventHandlerFn);
    map.on("pm:remove", onRemove as L.LeafletEventHandlerFn);
    
    return () => {
      map.off("pm:create", onCreate as L.LeafletEventHandlerFn);
      map.off("pm:edit", onUpdate as L.LeafletEventHandlerFn);
      map.off("pm:remove", onRemove as L.LeafletEventHandlerFn);
      map.pm.removeControls();
    };
  }, [map, onCreate, onUpdate, onRemove]);
  
  // Mantenemos la lógica de deshabilitar el dibujo si estamos en modo edición de zona
  useEffect(() => {
      if (editingZone) {
          map.pm.disableDraw();
      }
  }, [editingZone, map]);

  return null;
};