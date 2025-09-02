"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { IZone } from "../types/zone";

interface PMLayer extends L.Layer {
  pm: {
    disable: () => void;
    enable: (options?: any) => void;
    toggleEdit: () => void;
    _inEditMode: boolean;
  };
}

export const MapControls = ({
  setDrawnFeature,
  setEditingZone,
  editingZone,
}: {
  setDrawnFeature: any;
  setEditingZone: (zone: IZone | null) => void;
  editingZone: IZone | null;
}) => {
  const map = useMap();
  const geoJsonLayerRef = useRef<L.LayerGroup>(L.layerGroup()).current;
  const drawnLayerRef = useRef<PMLayer | null>(null);

  useEffect(() => {
    geoJsonLayerRef.addTo(map);

    map.pm.disableGlobalEditMode();
    map.pm.disableGlobalDragMode();
    map.pm.disableGlobalCutMode();

    map.pm.addControls({
      position: "topleft",
      drawPolygon: true,
      editMode: true,
      dragMode: false,
      cutPolygon: true,
      rotateMode: false,
      drawMarker: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawRectangle: true,
      drawPolyline: false,
      drawText: false,
    });

    const onCreate = (e: any) => {
      geoJsonLayerRef.clearLayers();
      geoJsonLayerRef.addLayer(e.layer);
      drawnLayerRef.current = e.layer as PMLayer;
      setDrawnFeature(e.layer.toGeoJSON());
    };

    const onUpdate = (e: any) => setDrawnFeature(e.layer.toGeoJSON());
    const onRemove = () => {
      setDrawnFeature(null);
      setEditingZone(null);
    };

    map.on("pm:create", onCreate);
    map.on("pm:edit", onUpdate);
    map.on("pm:remove", onRemove);

    return () => {
      map.off("pm:create", onCreate);
      map.off("pm:edit", onUpdate);
      map.off("pm:remove", onRemove);
      map.pm.removeControls();
      map.removeLayer(geoJsonLayerRef);
    };
  }, [map, setDrawnFeature, setEditingZone]);

  useEffect(() => {
    if (!editingZone && drawnLayerRef.current) {
      drawnLayerRef.current.pm.disable();
      geoJsonLayerRef.removeLayer(drawnLayerRef.current);
      drawnLayerRef.current = null;
    }
  }, [editingZone, geoJsonLayerRef]);

  return null;
};
