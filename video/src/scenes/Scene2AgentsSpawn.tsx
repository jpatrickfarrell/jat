import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme, fonts, agents } from "../theme";

// Scene 2: Multiple agents spawn and claim subtasks
// Duration: ~9s (270 frames at 30fps)

const subtasks = [
  { title: "Set up Supabase auth config", agent: 0 },
  { title: "Implement Google OAuth flow", agent: 1 },
  { title: "Build login UI components", agent: 2 },
  { title: "Write integration tests", agent: 0 },
];

const AgentAvatar: React.FC<{
  name: string;
  color: string;
  progress: number;
}> = ({ name, color, progress }) => {
  const initials = name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        transform: `scale(${progress})`,
        opacity: interpolate(progress, [0, 0.5], [0, 1], {
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${color}, ${color}80)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 700,
          fontFamily: fonts.mono,
          color: "white",
          boxShadow: `0 0 24px ${color}50`,
        }}
      >
        {initials}
      </div>
      <div
        style={{
          fontSize: 14,
          fontFamily: fonts.mono,
          color: color,
          fontWeight: 600,
        }}
      >
        {name}
      </div>
    </div>
  );
};

export const Scene2AgentsSpawn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [5, 30], [30, 0], {
    extrapolateRight: "clamp",
  });

  // Agent avatars spring in staggered
  const agent1 = spring({
    frame: frame - 30,
    fps,
    config: { damping: 10, stiffness: 150 },
  });
  const agent2 = spring({
    frame: frame - 45,
    fps,
    config: { damping: 10, stiffness: 150 },
  });
  const agent3 = spring({
    frame: frame - 60,
    fps,
    config: { damping: 10, stiffness: 150 },
  });
  const agentScales = [agent1, agent2, agent3];

  // Command line that triggers spawn
  const cmdOpacity = interpolate(frame, [8, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Lines connecting agents to subtasks
  const lineProgress = interpolate(frame, [100, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit
  const exitOpacity = interpolate(frame, [230, 270], [1, 0], {
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
        paddingTop: 80,
      }}
    >
      {/* Command prompt */}
      <div
        style={{
          opacity: cmdOpacity,
          fontSize: 20,
          fontFamily: fonts.mono,
          color: theme.textMuted,
          marginBottom: 16,
        }}
      >
        <span style={{ color: theme.success }}>$</span> jat chimaro 3 --auto
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 48,
          fontWeight: 800,
          fontFamily: fonts.heading,
          color: theme.text,
          marginBottom: 60,
          letterSpacing: "-0.02em",
        }}
      >
        Agents spawn.
      </div>

      {/* Agent avatars row */}
      <div
        style={{
          display: "flex",
          gap: 80,
          marginBottom: 60,
        }}
      >
        {agents.map((agent, i) => (
          <AgentAvatar
            key={agent.name}
            name={agent.name}
            color={agent.color}
            progress={agentScales[i]}
          />
        ))}
      </div>

      {/* Subtask claim list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          width: 660,
        }}
      >
        {subtasks.map((task, i) => {
          const claimProgress = spring({
            frame: frame - 110 - i * 18,
            fps,
            config: { damping: 15, stiffness: 100 },
          });
          const agent = agents[task.agent];
          const xOffset = interpolate(claimProgress, [0, 1], [60, 0]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: interpolate(claimProgress, [0, 0.3], [0, 1], {
                  extrapolateRight: "clamp",
                }),
                transform: `translateX(${xOffset}px)`,
                background: theme.bgCard,
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: "12px 18px",
              }}
            >
              {/* Agent color dot */}
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: agent.color,
                  boxShadow: `0 0 8px ${agent.color}60`,
                  flexShrink: 0,
                }}
              />

              {/* Task title */}
              <div
                style={{
                  flex: 1,
                  fontSize: 17,
                  fontFamily: fonts.body,
                  color: theme.textDim,
                }}
              >
                {task.title}
              </div>

              {/* Agent name badge */}
              <div
                style={{
                  fontSize: 12,
                  fontFamily: fonts.mono,
                  color: agent.color,
                  fontWeight: 600,
                  background: `${agent.color}15`,
                  padding: "3px 10px",
                  borderRadius: 6,
                  border: `1px solid ${agent.color}30`,
                }}
              >
                {agent.name}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
