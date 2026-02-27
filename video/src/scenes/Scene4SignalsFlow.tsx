import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme, fonts, agents } from "../theme";

// Scene 4: IDE statusline signals flowing — working → review → complete
// Duration: ~8s (240 frames at 30fps)

type SignalState = "working" | "review" | "complete";

const signalColors: Record<SignalState, string> = {
  working: theme.warning,
  review: theme.primary,
  complete: theme.success,
};

const AgentStatusRow: React.FC<{
  agent: (typeof agents)[number];
  frame: number;
  fps: number;
  stateTransitionStart: number;
  reviewStart: number;
  completeStart: number;
  progress: number;
}> = ({
  agent,
  frame,
  stateTransitionStart,
  reviewStart,
  completeStart,
  progress,
}) => {
  // Determine current state
  let currentState: SignalState = "working";
  if (frame >= completeStart) currentState = "complete";
  else if (frame >= reviewStart) currentState = "review";
  else if (frame >= stateTransitionStart) currentState = "working";

  const stateColor = signalColors[currentState];

  // Pulse animation on state change
  const isTransitioning =
    (currentState === "review" && frame - reviewStart < 15) ||
    (currentState === "complete" && frame - completeStart < 15);
  const pulseScale = isTransitioning
    ? interpolate(
        (frame - (currentState === "complete" ? completeStart : reviewStart)) %
          15,
        [0, 7, 15],
        [1, 1.15, 1],
        { extrapolateRight: "clamp" }
      )
    : 1;

  // File lock indicators
  const filesText =
    currentState === "complete"
      ? "released"
      : "src/auth/**";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        opacity: interpolate(progress, [0, 0.4], [0, 1], {
          extrapolateRight: "clamp",
        }),
        transform: `translateX(${interpolate(progress, [0, 1], [40, 0])}px)`,
        background: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        padding: "16px 24px",
        width: 700,
      }}
    >
      {/* Agent avatar */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${agent.color}, ${agent.color}80)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 700,
          fontFamily: fonts.mono,
          color: "white",
          flexShrink: 0,
        }}
      >
        {agent.name
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .split(" ")
          .map((w) => w[0])
          .join("")}
      </div>

      {/* Agent name */}
      <div
        style={{
          flex: 1,
          fontSize: 18,
          fontFamily: fonts.mono,
          color: theme.text,
          fontWeight: 600,
        }}
      >
        {agent.name}
      </div>

      {/* File lock */}
      <div
        style={{
          fontSize: 12,
          fontFamily: fonts.mono,
          color: theme.textMuted,
        }}
      >
        {filesText}
      </div>

      {/* Status badge */}
      <div
        style={{
          transform: `scale(${pulseScale})`,
          background: `${stateColor}20`,
          color: stateColor,
          fontSize: 13,
          fontWeight: 700,
          fontFamily: fonts.mono,
          padding: "5px 14px",
          borderRadius: 8,
          border: `1px solid ${stateColor}40`,
          boxShadow: isTransitioning
            ? `0 0 16px ${stateColor}40`
            : "none",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {currentState}
      </div>
    </div>
  );
};

export const Scene4SignalsFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [5, 25], [25, 0], {
    extrapolateRight: "clamp",
  });

  // Row entrances
  const row1 = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const row2 = spring({
    frame: frame - 35,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const row3 = spring({
    frame: frame - 50,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Subtitle (no conflicts)
  const subOpacity = interpolate(frame, [160, 185], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Exit
  const exitOpacity = interpolate(frame, [200, 240], [1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        opacity: exitOpacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 100,
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 48,
          fontWeight: 800,
          fontFamily: fonts.heading,
          color: theme.text,
          marginBottom: 50,
          letterSpacing: "-0.02em",
        }}
      >
        Signals flow. Zero conflicts.
      </div>

      {/* Agent status rows */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
        }}
      >
        <AgentStatusRow
          agent={agents[0]}
          frame={frame}
          fps={fps}
          stateTransitionStart={60}
          reviewStart={100}
          completeStart={150}
          progress={row1}
        />
        <AgentStatusRow
          agent={agents[1]}
          frame={frame}
          fps={fps}
          stateTransitionStart={70}
          reviewStart={120}
          completeStart={165}
          progress={row2}
        />
        <AgentStatusRow
          agent={agents[2]}
          frame={frame}
          fps={fps}
          stateTransitionStart={80}
          reviewStart={140}
          completeStart={180}
          progress={row3}
        />
      </div>

      {/* "No conflicts" subtitle */}
      <div
        style={{
          opacity: subOpacity,
          marginTop: 40,
          fontSize: 20,
          fontFamily: fonts.body,
          color: theme.textMuted,
        }}
      >
        File locks + dependency awareness = no merge conflicts
      </div>
    </AbsoluteFill>
  );
};
