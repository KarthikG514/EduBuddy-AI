"use client";

import React, { useState } from 'react';
import type { GenerateKnowledgeGalaxyOutput, Planet } from '@/ai/schemas';
import { Sparkles } from 'lucide-react';

interface GalaxyVisualProps {
    galaxyData: GenerateKnowledgeGalaxyOutput;
}

const colors = [
    'text-purple-400',
    'text-pink-400',
    'text-red-400',
    'text-yellow-400',
    'text-green-400',
    'text-blue-400',
    'text-indigo-400',
];

export function GalaxyVisual({ galaxyData }: GalaxyVisualProps) {
    const [activePlanet, setActivePlanet] = useState<Planet | null>(null);

    const handlePlanetClick = (planet: Planet) => {
        setActivePlanet(activePlanet?.name === planet.name ? null : planet);
    };

    const handleSunClick = () => {
        setActivePlanet(null);
    }
    
    return (
        <div className="relative w-full h-[600px] flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
            {/* Main Orbit Container with Animation */}
            <div className="relative w-[500px] h-[500px] animate-spin-slow">
                {/* Planets */}
                {galaxyData.planets.map((planet, pIndex) => {
                    const angle = (pIndex / galaxyData.planets.length) * 360;
                    const orbitRadius = 220;

                    return (
                        <div
                            key={planet.name}
                            className="absolute top-1/2 left-1/2 w-0 h-0"
                            style={{
                                transform: `rotate(${angle}deg) translate(${orbitRadius}px)`
                            }}
                        >
                            <div 
                                className="animate-spin-reverse-slow"
                                onClick={(e) => { e.stopPropagation(); handlePlanetClick(planet); }}
                            >
                                <div className="flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:scale-110">
                                    <Sparkles className={`h-8 w-8 ${colors[pIndex % colors.length]}`} />
                                    <p className={`text-sm font-semibold ${colors[pIndex % colors.length]} w-32`}>{planet.name}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sun - placed outside the spinning container */}
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-center text-black font-bold p-2 shadow-[0_0_20px_5px_rgba(252,208,76,0.7)] cursor-pointer z-10"
                onClick={handleSunClick}
            >
                {galaxyData.subject}
            </div>

            {/* Moons of Active Planet */}
            {activePlanet && (
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                      <div className="relative w-[240px] h-[240px] animate-spin-slow">
                        {activePlanet.moons.map((moon, mIndex) => {
                          const moonAngle = (mIndex / activePlanet.moons.length) * 360;
                          const moonOrbitRadius = 120;
                          return (
                              <div
                                  key={moon.name}
                                  className="absolute top-1/2 left-1/2 w-0 h-0"
                                  style={{
                                      transform: `rotate(${moonAngle}deg) translate(${moonOrbitRadius}px)`
                                  }}
                              >
                                  <div className="animate-spin-reverse-slow">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-4 h-4 bg-slate-400 rounded-full mb-1"></div>
                                        <p className="text-xs text-slate-300 w-24">{moon.name}</p>
                                    </div>
                                  </div>
                              </div>
                          );
                        })}
                      </div>
                </div>
            )}
        </div>
    );
}
