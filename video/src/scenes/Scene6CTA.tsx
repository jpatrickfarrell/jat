import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme, fonts } from "../theme";

// Scene 6: CTA — "Supervise the Swarm" + jomarchy.com
// Duration: ~7s (210 frames at 30fps)

export const Scene6CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // JAT logo/text entrance
  const logoProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const logoScale = interpolate(logoProgress, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(logoProgress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Tagline
  const tagProgress = spring({
    frame: frame - 35,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const tagY = interpolate(tagProgress, [0, 1], [30, 0]);
  const tagOpacity = interpolate(tagProgress, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // URL
  const urlProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 15, stiffness: 80 },
  });
  const urlOpacity = interpolate(urlProgress, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Ambient glow pulse behind logo
  const glowPhase = (frame * 0.03) % (2 * Math.PI);
  const glowIntensity = 0.3 + Math.sin(glowPhase) * 0.15;

  // Particle dots floating upward
  const particles = Array.from({ length: 12 }, (_, i) => {
    const startY = 800 + (i * 47) % 300;
    const x = 200 + (i * 137) % 1520;
    const speed = 0.4 + (i * 0.07) % 0.4;
    const y = startY - frame * speed;
    const opacity = y > 100 && y < 700 ? 0.15 + (i % 3) * 0.1 : 0;
    const size = 2 + (i % 3);
    const color = i % 3 === 0 ? theme.primary : i % 3 === 1 ? theme.success : theme.info;
    return { x, y, opacity, size, color };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.primary}${Math.round(glowIntensity * 30).toString(16).padStart(2, "0")}, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />

      {/* JAT ASCII logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          fontFamily: fonts.mono,
          fontSize: 28,
          fontWeight: 700,
          color: theme.text,
          lineHeight: 1.15,
          textAlign: "center",
          marginBottom: 10,
          whiteSpace: "pre",
        }}
      >
        {`     __       ___   .___________.
    |  |     /   \\  |           |
    |  |    /  ^  \\ \`---|  |----\`
.--.|  |   /  /_\\  \\    |  |
|  \`--'  |  /  _____  \\   |  |
 \\______/  /__/     \\__\\  |__|`}
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
          fontSize: 36,
          fontWeight: 700,
          fontFamily: fonts.heading,
          color: theme.text,
          marginTop: 40,
          letterSpacing: "-0.01em",
        }}
      >
        Supervise the Swarm.
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
          fontSize: 20,
          fontFamily: fonts.body,
          color: theme.textMuted,
          marginTop: 12,
        }}
      >
        One command. Multiple agents. Ship faster.
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlOpacity,
          marginTop: 50,
          fontSize: 24,
          fontFamily: fonts.mono,
          color: theme.primaryBright,
          fontWeight: 600,
          letterSpacing: "0.05em",
        }}
      >
        jomarchy.com
      </div>
    </AbsoluteFill>
  );
};
