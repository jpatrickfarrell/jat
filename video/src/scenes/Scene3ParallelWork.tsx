import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme, fonts, agents } from "../theme";

// Scene 3: Split-screen showing agents working simultaneously
// Duration: ~9s (270 frames at 30fps)

const codeSnippets = [
  {
    agent: agents[0],
    label: "auth/middleware.ts",
    lines: [
      "export async function authMiddleware(req, res, next) {",
      '  const token = req.headers["authorization"]?.split(" ")[1];',
      "  if (!token) return res.status(401).json({ error: 'No token' });",
      "",
      "  const { data, error } = await supabase.auth.getUser(token);",
      "  if (error) return res.status(401).json({ error: 'Invalid' });",
      "",
      "  req.user = data.user;",
      "  next();",
      "}",
    ],
  },
  {
    agent: agents[1],
    label: "routes/login/+page.svelte",
    lines: [
      "<script>",
      '  import { supabase } from "$lib/supabase";',
      "",
      "  async function signInWithGoogle() {",
      "    const { error } = await supabase.auth.signInWithOAuth({",
      "      provider: 'google',",
      "      options: { redirectTo: window.location.origin }",
      "    });",
      "  }",
      "</script>",
    ],
  },
  {
    agent: agents[2],
    label: "tests/auth.test.ts",
    lines: [
      'describe("Authentication", () => {',
      '  it("should reject invalid tokens", async () => {',
      "    const res = await request(app)",
      '      .get("/api/protected")',
      '      .set("Authorization", "Bearer invalid");',
      "    expect(res.status).toBe(401);",
      "  });",
      "",
      '  it("should accept valid tokens", async () => {',
      "    const res = await request(app)",
      '      .get("/api/protected")',
      '      .set("Authorization", `Bearer ${validToken}`);',
    ],
  },
];

const CodePanel: React.FC<{
  snippet: (typeof codeSnippets)[0];
  progress: number;
  frame: number;
  fps: number;
  fileCount: number;
}> = ({ snippet, progress, frame, fps, fileCount }) => {
  // How many lines are "typed" so far
  const typedLines = Math.min(
    snippet.lines.length,
    Math.floor(interpolate(frame, [20, 200], [0, snippet.lines.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }))
  );

  const fileCountDisplay = Math.floor(
    interpolate(frame, [40, 220], [0, fileCount], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <div
      style={{
        flex: 1,
        opacity: interpolate(progress, [0, 0.5], [0, 1], {
          extrapolateRight: "clamp",
        }),
        transform: `scale(${interpolate(progress, [0, 1], [0.9, 1])})`,
        background: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Panel header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: `1px solid ${theme.border}`,
          background: theme.bgPanel,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: snippet.agent.color,
              boxShadow: `0 0 6px ${snippet.agent.color}60`,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontFamily: fonts.mono,
              color: snippet.agent.color,
              fontWeight: 600,
            }}
          >
            {snippet.agent.name}
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            fontFamily: fonts.mono,
            color: theme.textMuted,
          }}
        >
          {fileCountDisplay} files
        </span>
      </div>

      {/* File name tab */}
      <div
        style={{
          padding: "6px 16px",
          fontSize: 12,
          fontFamily: fonts.mono,
          color: theme.textDim,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        {snippet.label}
      </div>

      {/* Code area */}
      <div
        style={{
          flex: 1,
          padding: "12px 16px",
          fontFamily: fonts.mono,
          fontSize: 12,
          lineHeight: 1.7,
          color: theme.textDim,
        }}
      >
        {snippet.lines.slice(0, typedLines).map((line, i) => (
          <div key={i} style={{ display: "flex", gap: 12 }}>
            <span style={{ color: theme.textMuted, width: 20, textAlign: "right", flexShrink: 0 }}>
              {i + 1}
            </span>
            <span
              style={{
                color:
                  line.includes("export") || line.includes("async") || line.includes("const") || line.includes("import")
                    ? theme.primaryBright
                    : line.includes("//") || line.includes("describe") || line.includes('it(')
                    ? theme.warning
                    : line.includes('"') || line.includes("'") || line.includes("`")
                    ? theme.success
                    : theme.textDim,
              }}
            >
              {line}
            </span>
          </div>
        ))}
        {/* Blinking cursor */}
        {typedLines < snippet.lines.length && (
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 16,
              background: snippet.agent.color,
              opacity: Math.sin(frame * 0.15) > 0 ? 1 : 0,
              marginLeft: 32,
            }}
          />
        )}
      </div>
    </div>
  );
};

export const Scene3ParallelWork: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Panel entrances (staggered)
  const panel1 = spring({
    frame: frame - 15,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const panel2 = spring({
    frame: frame - 25,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const panel3 = spring({
    frame: frame - 35,
    fps,
    config: { damping: 15, stiffness: 100 },
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
        padding: "50px 60px",
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          fontSize: 40,
          fontWeight: 800,
          fontFamily: fonts.heading,
          color: theme.text,
          textAlign: "center",
          marginBottom: 30,
          letterSpacing: "-0.02em",
        }}
      >
        Working in parallel.
      </div>

      {/* Three code panels side by side */}
      <div
        style={{
          display: "flex",
          gap: 20,
          flex: 1,
        }}
      >
        <CodePanel snippet={codeSnippets[0]} progress={panel1} frame={frame} fps={fps} fileCount={7} />
        <CodePanel snippet={codeSnippets[1]} progress={panel2} frame={frame} fps={fps} fileCount={5} />
        <CodePanel snippet={codeSnippets[2]} progress={panel3} frame={frame} fps={fps} fileCount={4} />
      </div>
    </AbsoluteFill>
  );
};
