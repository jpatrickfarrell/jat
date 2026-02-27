import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme, fonts, agents } from "../theme";

// Scene 5: Commits land, tests pass, green checkmarks cascade, epic completes
// Duration: ~9s (270 frames at 30fps)

const commits = [
  { msg: "feat(auth): add Supabase auth config", agent: agents[0], hash: "a3f2b1c" },
  { msg: "feat(auth): implement Google OAuth flow", agent: agents[1], hash: "7e4d9a2" },
  { msg: "feat(auth): build login UI components", agent: agents[2], hash: "1b8c5e3" },
  { msg: "test(auth): add integration test suite", agent: agents[0], hash: "d6a4f7b" },
];

export const Scene5EverythingMerges: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [5, 25], [25, 0], {
    extrapolateRight: "clamp",
  });

  // Commit list
  const commitEntries = commits.map((commit, i) => {
    const progress = spring({
      frame: frame - 30 - i * 20,
      fps,
      config: { damping: 15, stiffness: 110 },
    });
    return { ...commit, progress };
  });

  // Checkmark cascade — appears after all commits
  const checkProgress = spring({
    frame: frame - 130,
    fps,
    config: { damping: 8, stiffness: 180 },
  });

  // Test results
  const testsProgress = spring({
    frame: frame - 145,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const testCount = Math.floor(
    interpolate(frame, [145, 185], [0, 24], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Epic complete banner
  const epicProgress = spring({
    frame: frame - 185,
    fps,
    config: { damping: 10, stiffness: 120 },
  });
  const epicGlow = frame > 185
    ? interpolate((frame - 185) % 60, [0, 30, 60], [0.3, 0.7, 0.3], {
        extrapolateRight: "clamp",
      })
    : 0;

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
        paddingTop: 70,
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
          marginBottom: 40,
          letterSpacing: "-0.02em",
        }}
      >
        Everything merges.
      </div>

      {/* Commit list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 30,
          width: 740,
        }}
      >
        {commitEntries.map((commit, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              opacity: interpolate(commit.progress, [0, 0.3], [0, 1], {
                extrapolateRight: "clamp",
              }),
              transform: `translateX(${interpolate(commit.progress, [0, 1], [50, 0])}px)`,
              padding: "10px 16px",
              background: theme.bgCard,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
            }}
          >
            {/* Checkmark */}
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background:
                  commit.progress > 0.8 ? theme.success : "transparent",
                border: `2px solid ${commit.progress > 0.8 ? theme.success : theme.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                color: "white",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {commit.progress > 0.8 ? "✓" : ""}
            </div>

            {/* Hash */}
            <span
              style={{
                fontSize: 13,
                fontFamily: fonts.mono,
                color: theme.primary,
                flexShrink: 0,
              }}
            >
              {commit.hash}
            </span>

            {/* Message */}
            <span
              style={{
                flex: 1,
                fontSize: 15,
                fontFamily: fonts.mono,
                color: theme.textDim,
              }}
            >
              {commit.msg}
            </span>

            {/* Agent dot */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: commit.agent.color,
                flexShrink: 0,
              }}
            />
          </div>
        ))}
      </div>

      {/* Test results bar */}
      <div
        style={{
          opacity: interpolate(testsProgress, [0, 0.5], [0, 1], {
            extrapolateRight: "clamp",
          }),
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 30,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontFamily: fonts.mono,
            color: theme.success,
            fontWeight: 600,
          }}
        >
          ✓ {testCount}/24 tests passing
        </span>
        {/* Progress bar */}
        <div
          style={{
            width: 200,
            height: 6,
            background: theme.border,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(testCount / 24) * 100}%`,
              height: "100%",
              background: theme.success,
              borderRadius: 3,
            }}
          />
        </div>
      </div>

      {/* Epic complete banner */}
      <div
        style={{
          transform: `scale(${epicProgress})`,
          opacity: interpolate(epicProgress, [0, 0.5], [0, 1], {
            extrapolateRight: "clamp",
          }),
          background: `linear-gradient(135deg, ${theme.success}15, ${theme.successBright}10)`,
          border: `2px solid ${theme.success}50`,
          borderRadius: 16,
          padding: "20px 40px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: `0 0 ${30 + epicGlow * 20}px ${theme.success}${Math.round(epicGlow * 40).toString(16).padStart(2, "0")}`,
        }}
      >
        <div
          style={{
            transform: `scale(${checkProgress})`,
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: theme.success,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            color: "white",
            fontWeight: 700,
          }}
        >
          ✓
        </div>
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              fontFamily: fonts.heading,
              color: theme.success,
            }}
          >
            Epic Complete
          </div>
          <div
            style={{
              fontSize: 15,
              fontFamily: fonts.body,
              color: theme.textDim,
            }}
          >
            Build user authentication system — 4 subtasks, 3 agents
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
