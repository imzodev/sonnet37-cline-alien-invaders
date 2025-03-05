"use client";

import React, { useState, useEffect } from "react";
import { useGameLogic } from "@/lib/useGameLogic";
import GameCanvas from "./GameCanvas";
import { DefenseType, DEFENSE_STATS, setDifficulty } from "@/lib/gameTypes";
import { GameOverModal, WaveCompletedModal } from "./GameModals";
import Leaderboard from "./Leaderboard";
import { AnimatePresence } from "framer-motion";
import StartScreen from "./StartScreen";
import MobileScore from "./MobileScore";
import MobileBottomBar from "./MobileBottomBar";
import GameInfo from "./GameInfo";

const Game: React.FC = () => {
    const {
        gameState,
        isRunning,
        waveCompleted,
        userName,
        setUserName,
        startGame,
        pauseGame,
        endGame,
        selectDefense,
        placeDefense,
        startNextWave,
        explosionEffects,
        setGameState,
    } = useGameLogic();

    const [showStartScreen, setShowStartScreen] = useState(true);
    const [selectedDifficulty, setSelectedDifficulty] = useState("normal");
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [modalKey, setModalKey] = useState(0);

    const handleCanvasClick = (x: number, y: number) => {
        if (gameState.selectedDefense) {
            placeDefense(x, y);
        }
    };

    // Apply difficulty setting
    useEffect(() => {
        setDifficulty(selectedDifficulty);
    }, [selectedDifficulty]);

    // Load username from localStorage on initial load
    useEffect(() => {
        // Only run on client-side
        if (typeof window !== "undefined") {
            const savedUserName = localStorage.getItem("cline_username");
            if (savedUserName) {
                setUserName(savedUserName);
                console.log(
                    "Username loaded from localStorage:",
                    savedUserName
                );
            }
        }
    }, [setUserName]);

    // Save username to localStorage whenever it changes
    useEffect(() => {
        if (userName && typeof window !== "undefined") {
            localStorage.setItem("cline_username", userName);
            console.log("Username saved to localStorage:", userName);
        }
    }, [userName]);

    // Debug username changes
    useEffect(() => {
        console.log("Current username in Game component:", userName);
    }, [userName]);

    const handleStartGame = () => {
        setShowStartScreen(false);
        startGame();
    };

    const handleRestartGame = () => {
        console.log("Restart game requested");

        // First, make sure we're not showing the leaderboard
        setShowLeaderboard(false);

        // Increment the modal key to force unmounting
        setModalKey((prev) => prev + 1);

        // Request a restart with a slight delay to ensure the modal is gone
        setTimeout(() => {
            // Force the game state to reset
            setGameState((prevState) => ({
                ...prevState,
                gameOver: false,
            }));

            // Then start the game again after another short delay
            setTimeout(() => {
                startGame();
                console.log("Game restarted with complete reset");
            }, 50);
        }, 50);
    };

    const handleShowLeaderboard = () => {
        // Make sure the leaderboard is visible
        setShowLeaderboard(true);
        console.log("Showing leaderboard");
    };

    const handleCloseLeaderboard = () => {
        setShowLeaderboard(false);
        console.log("Hiding leaderboard");
    };

    // Helper function to format defense names
    const formatDefenseName = (type: DefenseType): string => {
        return type
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
            {showStartScreen ? (
                <StartScreen
                    userName={userName}
                    setUserName={setUserName}
                    selectedDifficulty={selectedDifficulty}
                    setSelectedDifficulty={setSelectedDifficulty}
                    onStartGame={handleStartGame}
                    onShowLeaderboard={handleShowLeaderboard}
                />
            ) : (
                <div className="w-full max-w-6xl">
                    {/* Main game container with sidebar layout - desktop version remains unchanged */}
                    <div className="hidden md:flex md:flex-row gap-4">
                        {/* Left side - Game info and controls */}
                        <GameInfo
                            gameState={gameState}
                            pauseGame={pauseGame}
                            selectDefense={selectDefense}
                        />

                        {/* Right side - Game canvas */}
                        <div className="w-full md:flex-1 order-2">
                            <div className="border border-gray-700/50 rounded-lg overflow-hidden shadow-2xl">
                                <GameCanvas
                                    gameState={gameState}
                                    onCanvasClick={handleCanvasClick}
                                    explosionEffects={explosionEffects}
                                />
                            </div>
                        </div>
                    </div>

                    {/* MOBILE VERSION - Complete redesign with bottom drawer and minimalistic UI */}
                    <div className="flex flex-col md:hidden">
                        <MobileScore
                            score={gameState.score}
                            resources={gameState.player.resources}
                            lives={gameState.player.lives}
                            paused={gameState.paused}
                            pauseGame={pauseGame}
                        />
                        {/* Mobile Game Canvas Container */}
                        <div className="relative">
                            <div className="border border-gray-700/50 rounded-lg overflow-hidden shadow-2xl">
                                <GameCanvas
                                    gameState={gameState}
                                    onCanvasClick={handleCanvasClick}
                                    explosionEffects={explosionEffects}
                                />
                            </div>

                            {/* Wave info pill - floating over the game */}
                            <div
                                className={`absolute top-2 left-2 px-3 py-1 rounded-full text-white text-sm flex items-center space-x-2 ${
                                    gameState.currentWave.bossWave
                                        ? "bg-red-900/80 border border-red-500/50"
                                        : "bg-gray-800/80 border border-gray-700/50"
                                }`}
                            >
                                <span className="font-bold">
                                    Wave {gameState.waveNumber}
                                </span>
                                {gameState.currentWave.bossWave && (
                                    <span className="text-red-400 animate-pulse">
                                        BOSS
                                    </span>
                                )}
                            </div>

                            {/* Removed the touch controls from here - they will be at the bottom */}
                        </div>
                        <MobileBottomBar
                            gameState={gameState}
                            selectDefense={selectDefense}
                        />
                    </div>
                </div>
            )}

            <AnimatePresence mode="popLayout">
                {gameState.gameOver && !showStartScreen && (
                    <GameOverModal
                        key={`gameOverModal-${modalKey}`}
                        score={gameState.score}
                        onRestart={handleRestartGame}
                        onMainMenu={() => setShowStartScreen(true)}
                        onShowLeaderboard={handleShowLeaderboard}
                        difficulty={selectedDifficulty}
                        userName={userName}
                        setUserName={setUserName}
                    />
                )}

                {waveCompleted && !gameState.gameOver && !showStartScreen && (
                    <WaveCompletedModal
                        key="waveCompletedModal"
                        waveNumber={gameState.waveNumber}
                        onNextWave={startNextWave}
                    />
                )}

                {showLeaderboard && (
                    <Leaderboard
                        key="leaderboardModal"
                        onClose={handleCloseLeaderboard}
                    />
                )}
            </AnimatePresence>

            {/* Add global CSS for hiding scrollbars while preserving functionality */}
            <style jsx global>{`
                .hide-scrollbar {
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none; /* IE and Edge */
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Opera */
                }
            `}</style>
        </div>
    );
};

export default Game;
