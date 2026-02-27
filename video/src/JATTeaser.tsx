import { AbsoluteFill, Sequence } from "remotion";
import { theme } from "./theme";
import { Scene1TaskDrops } from "./scenes/Scene1TaskDrops";
import { Scene2AgentsSpawn } from "./scenes/Scene2AgentsSpawn";
import { Scene3ParallelWork } from "./scenes/Scene3ParallelWork";
import { Scene4SignalsFlow } from "./scenes/Scene4SignalsFlow";
import { Scene5EverythingMerges } from "./scenes/Scene5EverythingMerges";
import { Scene6CTA } from "./scenes/Scene6CTA";

// 45 seconds at 30fps = 1350 frames
// Scene breakdown:
//   Scene 1: Task Drops In       - 0-8s     (0-240)
//   Scene 2: Agents Spawn        - 7-16s    (210-480)
//   Scene 3: Parallel Work       - 15-24s   (450-720)
//   Scene 4: Signals Flow        - 23-31s   (690-930)
//   Scene 5: Everything Merges   - 30-39s   (900-1170)
//   Scene 6: CTA                 - 38-45s   (1140-1350)

export const JATTeaser: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <Sequence from={0} durationInFrames={240}>
        <Scene1TaskDrops />
      </Sequence>

      <Sequence from={210} durationInFrames={270}>
        <Scene2AgentsSpawn />
      </Sequence>

      <Sequence from={450} durationInFrames={270}>
        <Scene3ParallelWork />
      </Sequence>

      <Sequence from={690} durationInFrames={240}>
        <Scene4SignalsFlow />
      </Sequence>

      <Sequence from={900} durationInFrames={270}>
        <Scene5EverythingMerges />
      </Sequence>

      <Sequence from={1140} durationInFrames={210}>
        <Scene6CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
