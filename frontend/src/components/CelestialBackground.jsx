import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const CelestialBackground = () => {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
                options={{
                    fullScreen: {
                        enable: true,
                        zIndex: -1
                    },
                    background: {
                        color: {
                            value: "#0D1B2A", // Midnight blue base
                        },
                    },
                    fpsLimit: 60, // Cap at 60 for smoothness performance
                    interactivity: {
                        events: {
                            onHover: {
                                enable: true,
                                mode: "bubble",
                            },
                            resize: true,
                        },
                        modes: {
                            bubble: {
                                distance: 200,
                                duration: 2,
                                size: 0,
                                opacity: 0.8,
                            },
                        },
                    },
                    particles: {
                        color: {
                            value: "#D4AF37", // Gold
                        },
                        links: {
                            enable: false, // DISABLED for cleaner look
                            distance: 150,
                            color: "#D4AF37",
                            opacity: 0.1,
                            width: 1,
                        },
                        move: {
                            direction: "top", // Rising stars
                            enable: true,
                            outModes: {
                                default: "out", // Flow off screen, don't bounce
                            },
                            random: true,
                            speed: 0.2, // Very slow, meditative
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                                area: 800,
                            },
                            value: 60, // Reduced density
                        },
                        opacity: {
                            value: 0.5,
                            random: true,
                            animation: {
                                enable: true,
                                speed: 0.5, // Slow twinkle
                                minimumValue: 0.1,
                                sync: false
                            }
                        },
                        shape: {
                            type: "circle",
                        },
                        size: {
                            value: { min: 1, max: 2 }, // Smaller, more distant stars
                        },
                    },
                    detectRetina: true,
                }}
            className="celestial-background"
        />
    );
};

export default CelestialBackground;
