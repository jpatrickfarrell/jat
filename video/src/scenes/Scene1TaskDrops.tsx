import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme, fonts } from "../theme";

// Scene 1: A task card flies in with the IDE's slide-in-fwd-center animation
// Duration: ~8s (240 frames at 30fps)

export const Scene1TaskDrops: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tagline fade in
  const tagOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
  });
  const tagY = interpolate(frame, [0, 25], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Task card entrance — inspired by slide-in-fwd-center (perspective + Z-translate)
  const cardProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const cardZ = interpolate(cardProgress, [0, 1], [-800, 0]);
  const cardOpacity = interpolate(cardProgress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glow pulse when card lands
  const glowFrame = frame - 70;
  const glowOpacity =
    glowFrame > 0
      ? interpolate(glowFrame, [0, 12, 40], [0, 0.6, 0], {
          extrapolateRight: "clamp",
        })
      : 0;

  // Subtask items appear staggered
  const subtasks = [
    "Set up Supabase auth config",
    "Implement Google OAuth flow",
    "Build login UI components",
    "Write integration tests",
  ];

  // Badge "P1" pulse
  const badgeScale = spring({
    frame: frame - 55,
    fps,
    config: { damping: 8, stiffness: 200 },
  });

  // Exit fade
  const exitOpacity = interpolate(frame, [200, 240], [1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Tagline */}
      <div
        style={{
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
          fontSize: 22,
          fontFamily: fonts.body,
          color: theme.textMuted,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 40,
        }}
      >
        A task arrives
      </div>

      {/* Task card */}
      <div
        style={{
          position: "relative",
          perspective: 1000,
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            inset: -30,
            borderRadius: 28,
            background: `radial-gradient(ellipse at center, ${theme.primary}50, transparent 70%)`,
            opacity: glowOpacity,
          }}
        />

        <div
          style={{
            transform: `perspective(1000px) translateZ(${cardZ}px)`,
            opacity: cardOpacity,
            width: 700,
            background: theme.bgCard,
            border: `1.5px solid ${theme.border}`,
            borderRadius: 16,
            padding: "36px 40px",
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${theme.primary}15`,
          }}
        >
          {/* Card header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {/* Priority badge */}
            <div
              style={{
                transform: `scale(${badgeScale})`,
                background: theme.error,
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: fonts.mono,
                padding: "4px 10px",
                borderRadius: 6,
              }}
            >
              P1
            </div>

            {/* Epic badge */}
            <div
              style={{
                opacity: cardOpacity,
                background: `${theme.primary}20`,
                color: theme.primaryBright,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: fonts.mono,
                padding: "4px 10px",
                borderRadius: 6,
                border: `1px solid ${theme.primary}40`,
              }}
            >
              EPIC
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              fontFamily: fonts.heading,
              color: theme.text,
              marginBottom: 28,
              lineHeight: 1.2,
            }}
          >
            Build user authentication system
          </div>

          {/* Subtask list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {subtasks.map((task, i) => {
              const itemProgress = spring({
                frame: frame - 90 - i * 10,
                fps,
                config: { damping: 15, stiffness: 120 },
              });
              const itemX = interpolate(itemProgress, [0, 1], [40, 0]);
              const itemOpacity = interpolate(itemProgress, [0, 0.4], [0, 1], {
                extrapolateRight: "clamp",
              });

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    opacity: itemOpacity,
                    transform: `translateX(${itemX}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: theme.textMuted,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 18,
                      fontFamily: fonts.body,
                      color: theme.textDim,
                    }}
                  >
                    {task}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
