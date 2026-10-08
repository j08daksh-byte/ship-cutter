// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useTwinState } from '../TwinProvider';

function getRobotWorldPosition(localPos: {x: number, y: number, z: number}) {
  return new THREE.Vector3(
    50.25 + localPos.z,
    localPos.y,
    37.5 - localPos.x
  );
}

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const { position, cameraTarget, followMode, cameraFocusTrigger, completedCuts, activeCutPath } = useTwinState();

  const currentTarget = useRef(new THREE.Vector3(10, 0, 7.5));
  const desiredTarget = useRef(new THREE.Vector3(10, 0, 7.5));
  const desiredCamPos = useRef(new THREE.Vector3());
  const transitionActive = useRef(false);
  const lastTrigger = useRef(cameraFocusTrigger);

  const prevRobotPos = useRef(getRobotWorldPosition({x: 0, y: 0, z: 0}));

  useEffect(() => {
    camera.up.set(0, 0, 1);
  }, [camera]);

  useEffect(() => {
    if (position) {
      prevRobotPos.current = getRobotWorldPosition(position);
    }
  }, []);

  useEffect(() => {
    if (cameraFocusTrigger !== lastTrigger.current || (lastTrigger.current === 0 && cameraFocusTrigger === 0)) {
      lastTrigger.current = cameraFocusTrigger;
      
      const worldPos = getRobotWorldPosition(position || {x: 0, y: 0, z: 0});
      transitionActive.current = true;
      
      switch (cameraTarget) {
        case 'robot':
          // ROBOT_INSPECTION PRESET
          desiredTarget.current.set(worldPos.x, worldPos.y, worldPos.z);
          // Fixed offset for clear inspection
          desiredCamPos.current.set(worldPos.x + 4, worldPos.y + 4, worldPos.z + 4);
          break;
          
        case 'cut':
          // CUT_INSPECTION PRESET
          const cuts = completedCuts || [];
          const active = activeCutPath || [];
          let cutWorld = worldPos;
          if (active.length > 0) {
            cutWorld = getRobotWorldPosition({ x: active[0].x, y: active[0].y, z: -0.05 });
          } else if (cuts.length > 0 && cuts[cuts.length - 1].path.length > 0) {
            const lastCut = cuts[cuts.length - 1];
            cutWorld = getRobotWorldPosition({ x: lastCut.path[0].x, y: lastCut.path[0].y, z: -0.05 });
          }
          desiredTarget.current.copy(cutWorld);
          desiredCamPos.current.set(cutWorld.x + 3, cutWorld.y + 3, cutWorld.z + 3);
          break;
          
        case 'ship':
          // SHIP_OVERVIEW PRESET
          desiredTarget.current.set(0, 0, 37.5);
          desiredCamPos.current.set(120, 120, 120);
          break;
          
        case 'free':
          // FREE MODE: Stop transition, let user control
          transitionActive.current = false;
          break;
      }
    }
  }, [cameraFocusTrigger, cameraTarget]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;
    
    const currentWorldPos = getRobotWorldPosition(position || {x: 0, y: 0, z: 0});
    const diff = currentWorldPos.clone().sub(prevRobotPos.current);
    prevRobotPos.current.copy(currentWorldPos);

    if (transitionActive.current && cameraTarget !== 'free') {
      // Smoothly animate to preset
      camera.position.lerp(desiredCamPos.current, delta * 3.0);
      currentTarget.current.lerp(desiredTarget.current, delta * 3.0);
      controlsRef.current.target.copy(currentTarget.current);
      
      if (camera.position.distanceTo(desiredCamPos.current) < 0.2 && 
          currentTarget.current.distanceTo(desiredTarget.current) < 0.2) {
        transitionActive.current = false;
      }
    } else {
      // Normal interactive mode
      if (followMode && cameraTarget !== 'free') {
        // Follow movement without changing zoom/relative angle
        camera.position.add(diff);
        currentTarget.current.add(diff);
        desiredTarget.current.add(diff);
        controlsRef.current.target.copy(currentTarget.current);
      } else {
        // Just free orbit, keep track of where the target is
        currentTarget.current.copy(controlsRef.current.target);
        desiredTarget.current.copy(controlsRef.current.target);
      }
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef} 
      makeDefault 
      enablePan={true} 
      enableZoom={true} 
      enableDamping={true}
      dampingFactor={0.05}
    />
  );
}
