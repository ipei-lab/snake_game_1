/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from "./types";

export const translations = {
  en: {
    title: "Snake_Core // v1.0.4",
    status: "Status",
    systemActive: "System Active",
    standby: "Standby",
    sessionScore: "Session Score",
    highRecord: "High Record",
    initializeGame: "INITIALIZE_GAME",
    neuralLinkReady: "Neural Link Ready",
    collisionProtocolsActive: "Collision Protocols Active",
    pressSpaceToStart: "Press Space to Start",
    bootSequence: "Boot Sequence",
    gameOver: "GAME_OVER",
    coreFailure: "Core Failure Detected",
    rebootSystem: "Reboot System",
    componentState: "Component State",
    segments: "snake.segments",
    direction: "direction",
    target: "target.x_y",
    efficiencyThreshold: "Efficiency Threshold",
    memoryDump: "Memory Dump",
    controlMapping: "Control Mapping",
    subsystem: "Subsystem",
    language: "EN",
  },
  zh: {
    title: "核心貪食蛇 // v1.0.4",
    status: "狀態",
    systemActive: "系統運行中",
    standby: "待命",
    sessionScore: "本次得分",
    highRecord: "最高紀錄",
    initializeGame: "初始化遊戲",
    neuralLinkReady: "神經連結就緒",
    collisionProtocolsActive: "碰撞協定已啟動",
    pressSpaceToStart: "按下 空白鍵 開始",
    bootSequence: "啟動序列",
    gameOver: "遊戲結束",
    coreFailure: "偵測到核心故障",
    rebootSystem: "重啟系統",
    componentState: "組件狀態",
    segments: "蛇段數",
    direction: "移動方向",
    target: "目標座標",
    efficiencyThreshold: "效率閾值",
    memoryDump: "記憶體傾印",
    controlMapping: "控制介面",
    subsystem: "子系統",
    language: "中",
  },
};

export type TranslationKeys = keyof typeof translations.en;
