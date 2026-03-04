"use client";

import React from 'react'
import { LevelContent } from './_components/LevelContent'
import { Level } from '@shared/types'

interface LevelPageProps {
  levels: Level[]
}

export default function LevelPage({ 
  levels = [] 
}: LevelPageProps) {
  return (
    <div>
      <LevelContent levels={levels} />
    </div>
  )
}
